// EmulatorJS 按键同步联机（lockstep）
// 每台电脑都运行同一个游戏，网上只传「每一帧按了哪些键」。
// 开局的电脑（主机）是裁判：收齐所有人第 N 帧的按键后，把这一帧的按键发给大家，大家再一起跑第 N 帧。
// 为了不卡，每个人的按键都延后几帧生效（delay），这样按键有时间在网上传过来。
// 每隔几秒互相核对一次游戏状态；万一对不上，主机把自己的即时存档发过去，重新对齐。
(() => {
  // localSlot：主机自己控制的是几号玩家（平常是 0；从手机接手游戏后，电脑保持原来的玩家号）
  const NP = window.EJSNet = { active: false, role: null, localSlot: 0 };
  const origRAF = window.requestAnimationFrame.bind(window);
  let held = null;   // 被我们按住的模拟器主循环：调用一次 = 跑一帧
  window.requestAnimationFrame = function (cb) {
    if (NP.active && typeof cb === "function" &&
        (cb.name === "MainLoop_runner" || String(cb).slice(0, 120).includes("MainLoop.queue"))) { held = cb; return 0; }
    return origRAF(cb);
  };

  const HASH_EVERY = 120;      // 每 120 帧（约 2 秒）核对一次
  const HOST_DELAY = 1;        // 主机自己的按键延后 1 帧
  let gm = null, base = 0, send = null, onEvent = () => {};
  let paused = false, internalLoad = false, resyncAt = 0;
  const fnum = () => gm.functions.getFrameNum();
  const executed = () => fnum() - base;
  const localMask = [0, 0, 0, 0];   // 本机产生的按键（主机上：0 号是自己，其他是看画面乱入的人）
  const applied = [0, 0, 0, 0];     // 已经交给模拟器的按键

  function waitEmu() {
    return new Promise(res => {
      const t = setInterval(() => {
        const e = window.EJS_emulator;
        if (e && e.started && e.gameManager) { clearInterval(t); res(e); }
      }, 50);
    });
  }
  function hook() {
    gm = window.EJS_emulator.gameManager;
    if (gm.__npHooked) return;
    gm.__npHooked = true;
    const orig = gm.simulateInput.bind(gm);
    gm.simulateInput = (player, index, value) => {
      if (!NP.active) return orig(player, index, value);
      if (index >= 24) { if (NP.role === "host") orig(player, index, value); return; }   // 存读档热键：只有主机能用
      if (index >= 16) return;                                                          // 模拟摇杆不同步
      const s = NP.role === "host" ? NP.localSlot : 0;
      if (value) localMask[s] |= (1 << index); else localMask[s] &= ~(1 << index);
    };
    // 联机时不能加速 / 减速（大家必须一帧一帧同步）
    for (const fn of ["toggleFastForward", "toggleSlowMotion", "toggleRewind"]) {
      const o = gm.functions[fn];
      if (typeof o === "function") gm.functions[fn] = v => { if (NP.active && v) return onEvent("speedBlocked"); return o(v); };
    }
    const oRestart = gm.restart.bind(gm), oLoad = gm.loadState.bind(gm);
    gm.restart = () => {
      if (NP.active && NP.role === "guest") return onEvent("guestBlocked");
      oRestart();
      if (NP.active) resyncAt = executed() + 3;   // 主机重置了游戏：过几帧把新状态发给大家
    };
    gm.loadState = s => {
      if (NP.active && NP.role === "guest" && !internalLoad) return onEvent("guestBlocked");
      oLoad(s);
      if (NP.active && NP.role === "host" && !internalLoad) resyncAt = executed() + 3;
    };
  }
  function apply(masks) {
    for (let s = 0; s < 4; s++) {
      const d = applied[s] < 0 ? 0xffff : (masks[s] || 0) ^ applied[s];   // -1 = 不知道模拟器现在按着什么：16 个键全部重新告诉它
      if (!d) continue;
      for (let i = 0; i < 16; i++) if (d & (1 << i)) gm.functions.simulateInput(s, i, (masks[s] >> i) & 1);
      applied[s] = masks[s] || 0;
    }
  }
  // 跑一帧：成功返回 true（模拟器还在处理上一帧的收尾时会失败，下次再试）
  function step(masks) {
    const cb = held;
    if (!cb) return false;
    apply(masks);
    const b = fnum();
    held = null;
    cb(performance.now());
    return fnum() > b;
  }
  // 把即时存档分成 64 块，每块算一个指纹；只有少数几块对不上时，可能只是声音缓冲之类的无关数据
  // skip：不比较的块（回滚模式：这台电脑自己测出来、读档后会变的无关数据），记成 x
  function stateHash(st, skip) {
    const s = st || gm.getState();
    const n = 64, size = Math.ceil(s.length / n), out = [];
    for (let b = 0; b < n; b++) {
      if (skip && skip.has(b)) { out.push("x"); continue; }
      let h = 0x811c9dc5;
      for (let i = b * size, e = Math.min(s.length, i + size); i < e; i++) h = Math.imul(h ^ s[i], 16777619);
      out.push((h >>> 0).toString(36));
    }
    return out.join(",");
  }
  function toB64(u8) {
    let out = "";
    for (let i = 0; i < u8.length; i += 0x8000) out += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(out);
  }
  function fromB64(b64) {
    const bin = atob(b64), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  let tickTimer = null;
  function schedule(ms = 0) { if (tickTimer === null) tickTimer = setTimeout(() => { tickTimer = null; tick(); }, ms); }
  async function activate() {
    await waitEmu();
    hook();
    if (NP.active) return;
    NP.active = true;
    paused = false;
    // 等主循环被我们按住
    await new Promise(res => { const t = setInterval(() => { if (held) { clearInterval(t); res(); } }, 5); });
    for (let s = 0; s < 4; s++) applied[s] = 0;
    for (let s = 1; s < 4; s++) for (let i = 0; i < 16; i++) gm.functions.simulateInput(s, i, 0);
    base = fnum();
  }
  function deactivate() {
    if (!NP.active) return;
    NP.active = false;
    clearTimeout(tickTimer); tickTimer = null;
    apply([localMask[0], 0, 0, 0]);
    const cb = held; held = null;
    if (cb) origRAF(cb);
    NP.role = null;
  }

  // ================= 主机 =================
  const H = { mode: "delay", keep: false, handing: 0, noise: new Set(), lastSync: 0, peers: {}, watchers: {}, rows: new Map(), decided: new Map(), hashes: new Map(), pending: [], t0: 0, done: 0,
    sentUpTo: 0, recordedUpTo: 0, stallSince: 0, fps: 60 };
  // 「快速通道」：不保证送达、不排队的数据通道。每次都带上最近几帧，丢一个包也没关系，
  // 不会像可靠通道那样因为一个包丢了重发而让后面的全部卡住。可靠通道照样发，作为保底。
  const FAST = {}, FASTW = {};      // 玩家号 / 观战者 -> 发送函数
  const RECENT = 8;                 // 每次带上最近几帧
  function fastSend(p, fn, n, masks) {
    if (!fn) return;
    p.recent = (p.recent || []).concat([[n, masks]]).slice(-RECENT);
    fn({ t: "F", r: p.recent });
  }
  function hostRow(n) { let r = H.rows.get(n); if (!r) { r = [undefined, undefined, undefined, undefined]; H.rows.set(n, r); } return r; }
  function hostLookup(n, s) {
    const r = H.rows.get(n);
    if (r && r[s] !== undefined) return r[s];
    const p = H.peers[s];
    if (!p) return 0;                         // 本机的按键没记录到的帧（刚开始）= 没按
    if (n <= p.zeroUntil) return 0;           // 刚加入的人，前几帧当作没按
    return undefined;                          // 还在等他的按键
  }
  // 对齐：主机存一个即时存档，自己和所有人都读这个存档，从同一帧开始
  // （有些模拟核心，存档没包含全部内部状态；大家都读同一个存档才能保证完全一致）
  function hostSyncAll() {
    if (RB.on) rbStop();
    const rb = rbWanted();
    const J = executed();
    const raw = gm.getState();
    internalLoad = true;
    try { gm.loadState(raw); } finally { internalLoad = false; }
    for (let s = 0; s < 4; s++) applied[s] = -1;
    const st = toB64(raw);
    const k = Math.random().toString(36).slice(2, 8);
    const CH = 60000;
    const targets = [...Object.keys(H.peers).map(s => [s, H.peers[s]]), ...Object.keys(H.watchers).map(w => ["w:" + w, H.watchers[w]])];
    for (const [s, p] of targets) {
      for (let i = 0, n = Math.ceil(st.length / CH); i < n; i++) p.send({ t: "sp", k, i, n, d: st.slice(i * CH, (i + 1) * CH) });
      if (rb && !p.watch) p.send({ t: "sync", k, f: J, d: RB_DELAY, mode: "rb", me: Number(s), W: RB_WINDOW });
      else p.send({ t: "sync", k, f: J, d: p.delay });
      p.zeroUntil = Math.max(p.zeroUntil || 0, J + p.delay);
      if (!p.synced && !p.watch) onEvent("synced", { slot: Number(s), frame: J });
      p.synced = true;
      p.syncedAt = J;
      for (let n = J + 1; n <= H.sentUpTo; n++) { const m = H.decided.get(n); if (m) p.send({ t: "f", f: n, m }); }
    }
    H.hashes.clear();
    H.lastSync = J;
    if (rb) rbStart(J, NP.localSlot, Object.keys(H.peers).map(Number));
    else { H.done = J; H.sentUpTo = Math.max(H.sentUpTo, J); H.recordedUpTo = Math.max(H.recordedUpTo, J); H.t0 = performance.now() - J * (1000 / H.fps); }
    onEvent("mode", { mode: rb ? "rb" : "delay" });
  }
  function hostTick() {
    if (RB.on && !H.pending.length && !(resyncAt && executed() >= resyncAt)) return rbTick();
    if (RB.on) { H.sentUpTo = executed(); }   // 回滚模式下要重新对齐：在两帧之间做
    if (paused) { H.t0 = performance.now() - H.done * (1000 / H.fps); return; }
    // 有人刚加入 / 需要重新对齐：在两帧之间把状态发过去
    if (H.sentUpTo === executed()) {
      if (resyncAt && executed() >= resyncAt) { resyncAt = 0; H.pending.push(-1); }
      if (H.pending.length) { H.pending = []; hostSyncAll(); }
    }
    if (RB.on) return schedule(0);
    const now = performance.now();
    const frameMs = 1000 / H.fps;
    let target = Math.floor((now - H.t0) / frameMs);
    const n = executed() + 1;
    if (target - H.done > 6) { H.t0 = now - H.done * frameMs; target = H.done + 1; }   // 等过人：不要快进追赶
    if (n > target) return schedule(Math.max(0, Math.min(8, H.t0 + n * frameMs - now - 1)));
    // 记录本机这一刻的按键，给第 n+HOST_DELAY 帧用
    while (H.recordedUpTo < n + HOST_DELAY) {
      H.recordedUpTo++;
      const r = hostRow(H.recordedUpTo);
      for (let s = 0; s < 4; s++) if (!H.peers[s]) r[s] = localMask[s];
    }
    let masks = H.decided.get(n);
    if (!masks) {
      masks = [0, 1, 2, 3].map(s => hostLookup(n, s));
      if (masks.includes(undefined)) {
        // 记下在等谁：经常等同一个人，就给他多留一帧余量（见 hostAdapt）
        for (let s = 0; s < 4; s++) if (masks[s] === undefined && H.peers[s] && !H.peers[s].stallStart) H.peers[s].stallStart = now;
        if (!H.stallSince) H.stallSince = now;
        if (now - H.stallSince > 400 && !H.waiting) { H.waiting = true; onEvent("waiting", { slots: [0, 1, 2, 3].filter(s => masks[s] === undefined) }); }
        return schedule(2);
      }
      H.stallSince = 0;
      for (const s in H.peers) { const p = H.peers[s]; if (p.stallStart) { const ms = now - p.stallStart; p.stallStart = 0; if (ms > 12) { p.stallMs = (p.stallMs || 0) + ms; p.stalls = (p.stalls || 0) + 1; } } }
      if (H.waiting) { H.waiting = false; onEvent("running"); }
      H.decided.set(n, masks);
      H.sentUpTo = n;
      for (const s in H.peers) if (H.peers[s].synced) { H.peers[s].send({ t: "f", f: n, m: masks }); fastSend(H.peers[s], FAST[s], n, masks); }
      for (const w in H.watchers) if (H.watchers[w].synced) { H.watchers[w].send({ t: "f", f: n, m: masks }); fastSend(H.watchers[w], FASTW[w], n, masks); }
    }
    hostAdapt(now);
    if (step(masks)) {
      H.done++;
      H.rows.delete(n - 30); H.decided.delete(n - 600);
      if (n % HASH_EVERY === 0) { H.hashes.set(n, stateHash(null, RB.noise)); H.hashes.delete(n - HASH_EVERY * 20); }   // 回滚时测出来的无关数据块，换回延迟模式后也不比较
    }
    schedule(0);
  }
  // 每 3 秒看一次：主机常常要等某个人的按键（网络慢或者忽快忽慢），就给他的按键多留 1 帧；
  // 一直很顺（30 秒没等过），就少留 1 帧，减少延迟。范围 2～15 帧。
  function hostAdapt(now) {
    if (now - (H.adaptAt || 0) < 3000) return;
    H.adaptAt = now;
    for (const s in H.peers) {
      const p = H.peers[s];
      if (!p.synced) continue;
      if (!p.calmSince) p.calmSince = now;
      let d = p.delay;
      if ((p.stallMs || 0) > 100 || (p.stalls || 0) >= 4) { d = Math.min(15, p.delay + 1); p.calmSince = now; }
      else if (p.stallMs || p.stalls) p.calmSince = now;
      else if (now - p.calmSince > 30000 && p.delay > 2) { d = p.delay - 1; p.calmSince = now; }
      p.stallMs = 0; p.stalls = 0;
      if (d !== p.delay) { p.delay = d; p.send({ t: "delay", d }); onEvent("delay", { slot: Number(s), delay: d }); }
    }
  }
  function hostMessage(slot, msg) {
    const p = H.peers[slot];
    if (!p) return;
    if (msg.t === "ri" || msg.t === "RI") {   // 回滚模式：他的按键（只收他自己那个玩家号的）
      if (!RB.on) return;
      for (const e of Array.isArray(msg.l) ? msg.l : []) if (e && e[0] === Number(slot)) rbInput(e[0], e[1] | 0, e[2] | 0, slot);
      rbPeerInfo(Number(slot), msg);
      return schedule(0);
    }
    if (msg.t === "h" && RB.on && !msg.rbChecked) return rbHashFromGuest(slot, msg);
    if (msg.t === "rresync") { if (!H.pending.length) H.pending.push(-1); rbUnstableCheck(); return; }
    if (msg.t === "rbslow") { onEvent("rbSlow", { slot: Number(slot) }); return; }
    if (msg.t === "i") {
      if (msg.f > executed() && !H.decided.has(msg.f)) hostRow(msg.f)[slot] = msg.m | 0;
      schedule(0);
    } else if (msg.t === "I") {   // 快速通道：最近几帧的按键
      for (const [f, m] of Array.isArray(msg.r) ? msg.r : []) {
        if (f > executed() && !H.decided.has(f)) { const r = hostRow(f); if (r[slot] === undefined) r[slot] = m | 0; }
      }
      schedule(0);
    } else if (msg.t === "h") {
      const mine = H.hashes.get(msg.f);
      if (!mine || mine === msg.h) return;
      const a = mine.split(","), b = msg.h.split(",");
      const diff = [];
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && a[i] !== "x" && b[i] !== "x" && !H.noise.has(i)) diff.push(i);
      if (!diff.length) return;
      // 刚对齐完就有一两块不一样：这几块是无关数据（比如声音缓冲），以后不再比较
      if (diff.length <= 2 && msg.f - H.lastSync <= HASH_EVERY * 2) { diff.forEach(i => H.noise.add(i)); return; }
      if (!H.pending.length) { H.pending.push(slot); onEvent("desync", { slot, frame: msg.f, blocks: diff.length }); if (RB.on) rbUnstableCheck(); }
    }
  }

  // ================= 乱入的人（客户端） =================
  // 乱入的人：主机发来的每一帧先放进缓冲区，再按每秒 60 帧均匀地播放。
  // 网上的数据常常一阵一阵地到；收到就马上播放的话，画面会忽快忽慢、声音断断续续。
  // 缓冲区留几帧（target）自动调：断过就多留一帧，30 秒都很顺就少留一帧。
  const FRAME_MS = 1000 / 60;
  const G = { frames: new Map(), parts: {}, synced: false, delay: 3, sentUpTo: 0, stallSince: 0, hoAt: null,
    maxRecv: 0, next: null, target: 2, calmSince: 0, waitStart: 0, recent: [], fast: null };
  function guestSendInputs() {
    // 主机已经定到第 maxRecv 帧：我的按键给第 maxRecv+delay 帧用（收到主机的帧就发，不等自己播放到那里）
    if (G.watch || !G.synced) return;
    const upto = Math.max(G.maxRecv, executed()) + G.delay;
    if (G.sentUpTo >= upto) return;
    for (let f = Math.max(G.sentUpTo + 1, executed() + 1); f <= upto; f++) {
      send({ t: "i", f, m: localMask[0] });
      G.recent.push([f, localMask[0]]);
    }
    G.sentUpTo = upto;
    G.recent = G.recent.slice(-RECENT);
    if (G.fast) G.fast({ t: "I", r: G.recent });
  }
  function guestTick() {
    if (!G.synced) return;
    if (RB.on) return rbTick();
    // 主机（手机）要把游戏交给我运行：跑到约定的那一帧就停住，等页面接手
    if (G.hoAt !== null && executed() >= G.hoAt) { const f = G.hoAt; G.hoAt = null; G.synced = false; onEvent("handover", { frame: f }); return; }
    guestSendInputs();
    const n = executed() + 1;
    const m = G.frames.get(n);
    const now = performance.now();
    if (!m) {
      if (G.next !== null) { G.next = null; G.target = Math.min(8, G.target + 1); G.calmSince = now; }   // 断了：以后多缓冲一帧
      if (!G.stallSince) G.stallSince = now;
      else if (now - G.stallSince > 600 && !G.waiting) { G.waiting = true; onEvent("waiting", {}); }
      return schedule(4);
    }
    G.stallSince = 0;
    if (G.waiting) { G.waiting = false; onEvent("running"); }
    let buf = 1;
    while (buf < 30 && G.frames.has(n + buf)) buf++;
    if (G.next === null) {
      // 刚开始 / 刚断过：先攒够几帧再开始播放（最多等 300 毫秒）
      if (!G.waitStart) G.waitStart = now;
      if (buf < G.target && now - G.waitStart < 300) return schedule(4);
      G.waitStart = 0; G.next = now;
    }
    if (now < G.next - 1) return schedule(Math.min(8, G.next - now));
    if (step(m)) {
      G.frames.delete(n);
      if (n % HASH_EVERY === 0 && !G.watch) send({ t: "h", f: n, h: stateHash(null, RB.noise) });
      // 缓冲区比需要的多：稍微播快一点追上，免得越积越多（延迟变大）
      const extra = buf - 1 - G.target;
      G.next = Math.max(G.next + FRAME_MS * (extra > 3 ? 0.5 : extra > 0 ? 0.92 : 1), now - FRAME_MS * 2);
      if (!G.calmSince) G.calmSince = now;
      if (now - G.calmSince > 30000 && G.target > 1) { G.target--; G.calmSince = now; }
    } else G.next = now + 1;
    schedule(Math.max(0, Math.min(8, G.next - performance.now())));
  }
  function guestMessage(msg) {
    if (msg.t === "rp" || msg.t === "RP") {   // 回滚模式：别人的按键（主机转过来的）
      if (!RB.on) return;
      for (const e of Array.isArray(msg.l) ? msg.l : []) if (e && e[0] !== RB.me) rbInput(e[0] | 0, e[1] | 0, e[2] | 0);
      rbPeerInfo(0, msg);
      return schedule(0);
    }
    if (msg.t === "f") {
      if (!G.synced || msg.f > executed()) G.frames.set(msg.f, msg.m);
      if (msg.f > G.maxRecv) G.maxRecv = msg.f;
      guestSendInputs(); schedule(0);
    }
    else if (msg.t === "F") {   // 快速通道：最近几帧
      for (const [f, m] of Array.isArray(msg.r) ? msg.r : []) {
        if ((!G.synced || f > executed()) && !G.frames.has(f)) G.frames.set(f, m);
        if (f > G.maxRecv) G.maxRecv = f;
      }
      guestSendInputs(); schedule(0);
    }
    else if (msg.t === "delay") { G.delay = Math.max(1, Math.min(15, msg.d | 0)); guestSendInputs(); }
    else if (msg.t === "ho") { G.hoAt = msg.upTo | 0; schedule(0); }
    else if (msg.t === "sp") {
      const p = G.parts[msg.k] || (G.parts[msg.k] = []);
      p[msg.i] = msg.d;
    } else if (msg.t === "sync") {
      const st = fromB64((G.parts[msg.k] || []).join(""));
      delete G.parts[msg.k];
      internalLoad = true;
      try { gm.loadState(st); } finally { internalLoad = false; }
      base = fnum() - msg.f;
      for (let s = 0; s < 4; s++) applied[s] = -1;   // 读档后：所有按键重新告诉模拟器
      G.delay = msg.d;
      if (RB.on) rbStop();
      if (msg.mode === "rb") rbStart(msg.f, msg.me | 0, null, msg.W);
      for (const f of [...G.frames.keys()]) if (f <= msg.f) G.frames.delete(f);
      G.sentUpTo = msg.f + msg.d;   // 这几帧主机当作没按
      G.maxRecv = msg.f; G.next = null; G.waitStart = 0; G.recent = [];
      const first = !G.synced;
      G.synced = true;
      onEvent(first ? "synced" : "resynced", { frame: msg.f, mode: msg.mode === "rb" ? "rb" : "delay" });
      schedule(0);
    }
  }


  // ================= 回滚模式（rollback） =================
  // 每个人自己的按键马上生效（只延后很少几帧），别人的按键还没到时，先当作「他还按着上一次的键」继续往下跑；
  // 他真正的按键到了、和猜的不一样，就读回那一帧之前的即时存档，用正确的按键把这几帧重新跑一遍（一瞬间完成）。
  // 主机还是中转：乱入的人把自己的按键发给主机，主机转给其他人。观战的人照旧收「已经确定的帧」。
  const RB_DELAY = 2;          // 自己的按键延后几帧（减少回滚次数）
  const RB_WINDOW = 10;        // 最多往回改几帧；别人的按键落后更多就等一等
  const RB = { on: false, me: 0, local: new Set(), remote: new Set(), J: 0, D: RB_DELAY, W: RB_WINDOW,
    inp: new Map(), conf: [0, 0, 0, 0], val: [0, 0, 0, 0], used: new Map(), states: new Map(), rollTo: null,
    cap: 0, t0: 0, out: [], recent: [], rf: [0, 0, 0, 0], radv: [0, 0, 0, 0], sleepAt: 0, hashed: new Set(), gh: new Map(),
    stallSince: 0, waiting: false, rollbacks: 0, rolled: 0, stepMs: 2, slowSince: 0, lastWatch: 0, noise: new Set(), calib: null };
  // 主机：回滚模式只在「想用回滚 + 所有按键同步的乱入者都是新版本」时才开
  function rbWanted() {
    const ps = Object.values(H.peers);
    return H.mode === "rb" && ps.length > 0 && ps.every(p => p.rb);
  }
  function rbStart(J, me, peerSlots, W) {
    const r = RB;
    r.on = true; r.J = J; r.me = me; r.W = W || RB_WINDOW; r.D = RB_DELAY;
    r.local = new Set(); r.remote = new Set();
    if (NP.role === "host") {
      for (let s = 0; s < 4; s++) (peerSlots.includes(s) ? r.remote : r.local).add(s);
    } else {
      for (let s = 0; s < 4; s++) (s === me ? r.local : r.remote).add(s);
    }
    r.inp.clear(); r.used.clear(); r.states.clear(); r.hashed.clear(); r.gh.clear();
    r.conf = [J, J, J, J]; r.val = [0, 0, 0, 0]; r.rollTo = null; r.out = []; r.recent = [];
    // 对齐后的头几帧：大家都当作没按（谁的按键都还来不及传到）
    for (let f = J + 1; f <= J + r.D; f++) r.inp.set(f, [0, 0, 0, 0]);
    r.conf = [J + r.D, J + r.D, J + r.D, J + r.D];
    r.cap = J + r.D;
    r.t0 = performance.now(); r.rf = [J, J, J, J]; r.radv = [0, 0, 0, 0]; r.sleepAt = J + 120;
    r.stallSince = 0; r.waiting = false; r.rollbacks = 0; r.rolled = 0; r.slowSince = 0; r.lastWatch = J;
    for (let s = 0; s < 4; s++) applied[s] = -1;   // 下一帧把所有按键重新告诉模拟器
    r.calib = { S: null, X: null, i: 0 };
  }
  // 有些模拟核心读档以后，存档里有几块无关的数据（声音、计时之类）会和没读过档时不一样，游戏本身没变。
  // 开始前自己试四次「跑一帧 → 读回去 → 再跑一帧」，找出这几块，核对状态时跳过它们（不然会一直误报「对不上」）
  function rbCalibrate() {
    const r = RB, c = r.calib;
    try {
      if (!c.S) c.S = gm.getState();
      while (c.i < 4) {
        if (!step([0, 0, 0, 0])) return false;   // 模拟器还没准备好跑下一帧：等一下再试
        const st = gm.getState();
        internalLoad = true;
        try { gm.loadState(c.S); } finally { internalLoad = false; }
        for (let s = 0; s < 4; s++) applied[s] = -1;
        if (!c.X) { c.X = st; continue; }
        const a = stateHash(c.X).split(","), b = stateHash(st).split(",");
        a.forEach((v, k) => { if (v !== b[k]) r.noise.add(k); });
        c.X = null; c.i++;
      }
    } catch (e) { console.warn("[netplay] calibrate", e); }
    r.calib = null;
    base = fnum() - r.J;
    for (let s = 0; s < 4; s++) applied[s] = -1;
    r.t0 = performance.now();
    return true;
  }
  // 回滚模式下一分钟里对不上 3 次：这个游戏不适合回滚，让页面改回延迟模式
  let rbBad = [];
  function rbUnstableCheck() {
    if (!RB.on) return;
    const now = performance.now();
    rbBad = rbBad.filter(t => now - t < 60000).concat(now);
    if (rbBad.length >= 3) { rbBad = []; onEvent("rbUnstable"); }
  }
  function rbStop() { RB.on = false; RB.states.clear(); RB.inp.clear(); RB.used.clear(); }
  const rbRow = f => { let row = RB.inp.get(f); if (!row) { row = [undefined, undefined, undefined, undefined]; RB.inp.set(f, row); } return row; };
  // 收到某个玩家第 f 帧的按键
  function rbInput(s, f, m, from) {
    const r = RB;
    if (!r.on || f <= r.J || s < 0 || s > 3 || r.local.has(s)) return;
    const row = rbRow(f);
    if (row[s] !== undefined) return;
    row[s] = m;
    while (true) { const nx = r.inp.get(r.conf[s] + 1); if (!nx || nx[s] === undefined) break; r.conf[s]++; r.val[s] = nx[s]; }
    const used = r.used.get(f);
    if (used && used[s] !== m && (r.rollTo === null || f < r.rollTo)) r.rollTo = f;   // 猜错了：要从第 f 帧重跑
    if (NP.role === "host") r.out.push([s, f, m, from]);                               // 主机：转给其他人
  }
  function rbPeerInfo(s, msg) {
    if (typeof msg.cf === "number") { RB.rf[s] = Math.max(RB.rf[s], msg.cf); }
    if (typeof msg.adv === "number") RB.radv[s] = msg.adv;
  }
  const rbMasks = f => { const row = RB.inp.get(f); return [0, 1, 2, 3].map(s => (row && row[s] !== undefined) ? row[s] : RB.val[s]); };
  const rbConfirmed = f => { for (const s of RB.remote) if (RB.conf[s] < f) return false; return true; };
  const rbMinConf = () => { let m = Infinity; for (const s of RB.remote) m = Math.min(m, RB.conf[s]); return m === Infinity ? executed() + 1000 : m; };
  // 把本机的按键（主机：自己 + 看画面乱入的人 + 没人的玩家号；乱入的人：自己）记到第 f 帧，发出去
  function rbCapture(upto) {
    const r = RB, now = [];
    while (r.cap < upto) {
      r.cap++;
      const row = rbRow(r.cap);
      for (const s of r.local) { row[s] = (NP.role === "host" ? localMask[s] : localMask[0]) | 0; now.push([s, r.cap, row[s]]); }
    }
    if (!now.length) return;
    for (const s of r.local) { r.conf[s] = r.cap; r.val[s] = rbRow(r.cap)[s]; }
    if (NP.role === "host") for (const e of now) r.out.push([e[0], e[1], e[2], -1]);
    else r.out.push(...now);
  }
  // 发出去：可靠通道发新的，快速通道每次带上最近的（丢包也不怕）
  function rbFlush() {
    const r = RB, cf = executed();
    if (!r.out.length && cf % 4) return;
    const out = r.out; r.out = [];
    if (NP.role === "host") {
      for (const sk in H.peers) {
        const p = H.peers[sk], slot = Number(sk);
        if (!p.synced) continue;
        const mine = out.filter(e => e[0] !== slot && e[3] !== slot).map(e => [e[0], e[1], e[2]]);
        p.rbRecent = (p.rbRecent || []).concat(mine).slice(-24);
        const adv = cf - r.rf[slot];
        if (mine.length) p.send({ t: "rp", l: mine, cf, adv });
        if (FAST[sk]) FAST[sk]({ t: "RP", l: p.rbRecent, cf, adv });
      }
    } else {
      const mine = out.filter(e => e[0] === r.me);
      r.recent = r.recent.concat(mine).slice(-24);
      const adv = cf - r.rf[0];
      if (mine.length) send({ t: "ri", l: mine, cf, adv });
      if (G.fast) G.fast({ t: "RI", l: r.recent, cf, adv });
    }
  }
  // 两边跑得快慢不一样时，跑在前面的人稍微停一下（不然后面的人一直在回滚）
  function rbTimeSync(n) {
    const r = RB;
    if (n < r.sleepAt) return 0;
    r.sleepAt = n + 60;
    let worst = 0;
    const others = NP.role === "host" ? Object.keys(H.peers).map(Number) : [0];
    for (const s of others) {
      const mine = n - r.rf[s], theirs = r.radv[s] || 0;
      worst = Math.max(worst, Math.floor((mine - theirs) / 2));
    }
    return Math.min(worst, 4);
  }
  // 已经确定的帧：主机发给观战的人；大家核对游戏状态（每 120 帧一次）
  function rbConfirmedWork() {
    const r = RB, mc = Math.min(rbMinConf(), executed());
    if (NP.role === "host" && Object.keys(H.watchers).length) {
      while (r.lastWatch < mc) {
        r.lastWatch++;
        const m = rbMasks(r.lastWatch);
        H.decided.set(r.lastWatch, m); H.decided.delete(r.lastWatch - 600); H.sentUpTo = r.lastWatch;
        for (const w in H.watchers) if (H.watchers[w].synced) { H.watchers[w].send({ t: "f", f: r.lastWatch, m }); fastSend(H.watchers[w], FASTW[w], r.lastWatch, m); }
      }
    }
    if (r.rollTo !== null) return;
    for (const [f, st] of r.states) {
      if (f - 1 > mc || f > executed() || (f - 1) % HASH_EVERY || r.hashed.has(f - 1) || f - 1 <= r.J) continue;
      r.hashed.add(f - 1);
      const h = stateHash(st, r.noise);
      if (NP.role === "host") { H.hashes.set(f - 1, h); const g = r.gh.get(f - 1); if (g) { r.gh.delete(f - 1); for (const [slot, gh] of g) hostMessage(slot, { t: "h", f: f - 1, h: gh, rbChecked: true }); } }
      else send({ t: "h", f: f - 1, h });
    }
    // 不再需要的旧存档、旧按键
    for (const f of r.states.keys()) if (f <= mc - 1 && !(f - 1 > r.J && (f - 1) % HASH_EVERY === 0 && !r.hashed.has(f - 1))) r.states.delete(f);
    for (const f of r.used.keys()) if (f < mc - 2) r.used.delete(f);
    for (const f of r.inp.keys()) if (f < mc - 30) r.inp.delete(f);
  }
  function rbHashFromGuest(slot, msg) {
    if (!H.hashes.has(msg.f)) { const g = RB.gh.get(msg.f) || []; g.push([slot, msg.h]); RB.gh.set(msg.f, g); return; }
    hostMessage(slot, Object.assign({}, msg, { rbChecked: true }));
  }
  function rbTick() {
    if (RB.calib && !rbCalibrate()) return schedule(2);
    const r = RB, frameMs = 1000 / 60, t = performance.now();
    // 1. 猜错了：读回存档，从那一帧重新跑
    if (r.rollTo !== null) {
      const f = r.rollTo, st = r.states.get(f);
      r.rollTo = null;
      if (f <= executed()) {
        if (!st) { onEvent("desync", { frame: f, rb: true }); if (NP.role === "host") { if (!H.pending.length) H.pending.push(-1); } else send({ t: "rresync" }); return schedule(50); }
        internalLoad = true;
        try { gm.loadState(st); } finally { internalLoad = false; }
        base = fnum() - (f - 1);
        for (let s = 0; s < 4; s++) applied[s] = -1;
        r.rollbacks++; r.rolled += 0;
      }
    }
    // 2. 应该跑到第几帧了（按每秒 60 帧算）
    let target = r.J + Math.floor((t - r.t0) / frameMs);
    const start = performance.now();
    let ran = 0;
    while (true) {
      const n = executed() + 1;
      if (n > target) break;
      rbCapture(n + r.D);
      // 别人的按键落后太多：等一等（不能无限往回改）
      if (n - rbMinConf() > r.W) {
        if (!r.stallSince) r.stallSince = t;
        if (t - r.stallSince > 400 && !r.waiting) { r.waiting = true; onEvent("waiting", { slots: [...r.remote].filter(s => n - r.conf[s] > r.W) }); }
        r.t0 = t - (executed() - r.J) * frameMs;   // 等完不要快进
        break;
      }
      if (r.stallSince) { r.stallSince = 0; if (r.waiting) { r.waiting = false; onEvent("running"); } }
      // 两边快慢对齐：在前面的人停几帧
      const sleep = n === executed() + 1 && n > target - 1 ? rbTimeSync(n) : 0;
      if (sleep) { r.t0 += sleep * frameMs; break; }
      const masks = rbMasks(n);
      const conf = rbConfirmed(n);
      // 这一帧还有人的按键是猜的、或者要核对状态：先存档（猜错时读回来）
      const before = performance.now();   // 存档 + 跑一帧一共要多久（电脑太慢就不适合回滚）
      if (!conf || (n - 1 > r.J && (n - 1) % HASH_EVERY === 0)) r.states.set(n, gm.getState()); else r.states.delete(n);
      if (!step(masks)) break;
      r.stepMs = r.stepMs * 0.95 + (performance.now() - before) * 0.05;
      r.used.set(n, masks);
      ran++;
      if (r.rollTo !== null || performance.now() - start > 30) break;
    }
    rbFlush();
    rbConfirmedWork();
    // 电脑太慢（重跑几帧来不及）：告诉主机改回延迟模式
    const need = r.stepMs * 4;   // 回滚时一下子要重跑好几帧：每帧（存档 + 运行）超过 3.5 毫秒就太吃力了
    if (need > 14) { if (!r.slowSince) r.slowSince = t; else if (t - r.slowSince > 8000) { r.slowSince = t + 60000; if (NP.role === "host") onEvent("rbSlow", { slot: -1 }); else send({ t: "rbslow" }); } }
    else r.slowSince = 0;
    if (r.rollTo !== null) return schedule(0);
    const next = r.t0 + (executed() - r.J + 1) * frameMs - performance.now();
    schedule(Math.max(0, Math.min(8, next - 1)));
  }

  function tick() {
    if (!NP.active) return;
    try { if (NP.role === "host") hostTick(); else if (NP.role === "guest") guestTick(); }
    catch (e) { console.error("[netplay]", e); schedule(50); }
  }

  // ================= 给页面用的接口 =================
  // 主机：有人用「按键同步」方式乱入
  NP.addPeer = async (slot, delay, sendFn, opts = {}) => {
    if (!NP.active) {
      NP.role = "host";
      await activate();
      H.t0 = performance.now(); H.done = 0; H.sentUpTo = 0; H.recordedUpTo = 0;
      H.rows.clear(); H.decided.clear(); H.hashes.clear(); H.noise.clear();
    }
    H.peers[slot] = { send: sendFn, delay: delay || 3, synced: false, zeroUntil: 0, rb: !!opts.rb };
    H.pending.push(slot);
    schedule(0);
  };
  NP.removePeer = slot => {
    delete H.peers[slot]; delete FAST[slot];
    H.pending = H.pending.filter(s => s !== slot);
    if (RB.on && !H.pending.length && (Object.keys(H.peers).length || Object.keys(H.watchers).length)) H.pending.push(-1);   // 回滚模式：少了一个人，大家重新对齐（没人了就回到普通方式给观战的人）
    if (NP.role === "host" && !H.keep && !Object.keys(H.peers).length && !Object.keys(H.watchers).length) deactivate();
  };
  // 主机：有人观战（只接收每一帧的按键，不参与操作，主机也不用等他）
  NP.addWatcher = async (key, sendFn) => {
    if (!NP.active) {
      NP.role = "host";
      await activate();
      H.t0 = performance.now(); H.done = 0; H.sentUpTo = 0; H.recordedUpTo = 0;
      H.rows.clear(); H.decided.clear(); H.hashes.clear(); H.noise.clear();
    }
    H.watchers[key] = { send: sendFn, synced: false, watch: true, zeroUntil: 0, delay: 0 };
    H.pending.push(-1);
    schedule(0);
  };
  NP.removeWatcher = key => {
    delete H.watchers[key]; delete FASTW[key];
    if (NP.role === "host" && !H.keep && !Object.keys(H.peers).length && !Object.keys(H.watchers).length) deactivate();
  };
  NP.peerMessage = (slot, msg) => hostMessage(slot, msg);
  // 快速通道连上了（主机：某个玩家 / 观战者的；乱入的人：自己的）
  NP.setPeerFast = (slot, fn) => { if (fn) FAST[slot] = fn; else delete FAST[slot]; };
  NP.setWatcherFast = (key, fn) => { if (fn) FASTW[key] = fn; else delete FASTW[key]; };
  NP.setGuestFast = fn => { G.fast = fn || null; };
  // 主机：看画面乱入的人按的键（由主机代为记录）
  NP.hostInput = (slot, index, value) => {
    if (index >= 16) return;
    if (value) localMask[slot] |= (1 << index); else localMask[slot] &= ~(1 << index);
  };
  // 主机：联机方式 "delay"（按键延后几帧，稳）或 "rb"（回滚，跟手）。换了就让大家重新对齐
  NP.setMode = mode => {
    const m = mode === "rb" ? "rb" : "delay";
    if (H.mode === m) return;
    H.mode = m;
    if (NP.role === "host" && NP.active && Object.keys(H.peers).length && !H.pending.length && rbWanted() !== RB.on) { H.pending.push(-1); schedule(0); }   // 实际方式变了才重新对齐
  };
  NP.mode = () => (RB.on ? "rb" : "delay");
  NP.togglePause = () => { if (RB.on) { onEvent("rbNoPause"); return false; } if (NP.role === "host") { paused = !paused; onEvent(paused ? "paused" : "running"); schedule(0); return true; } return false; };
  NP.isPaused = () => paused;
  // 客户端：开始同步（游戏加载好后，按住主循环，等主机发状态过来）
  NP.startGuest = async (opts) => {
    NP.role = "guest";
    send = opts.send;
    G.watch = !!opts.watch;
    G.synced = false; G.frames.clear(); G.parts = {}; G.hoAt = null;
    G.maxRecv = 0; G.next = null; G.target = 2; G.calmSince = 0; G.waitStart = 0; G.recent = []; G.fast = null;
    await activate();
    onEvent("ready");
  };
  NP.guestMessage = msg => guestMessage(msg);
  // 主机（比较慢的手机）：把游戏交给某个乱入的人运行。先暂停，告诉他跑到哪一帧为止
  NP.handover = slot => {
    const p = H.peers[slot];
    if (NP.role !== "host" || !p) return false;
    paused = true;
    p.send({ t: "ho", upTo: H.sentUpTo });
    return true;
  };
  // 乱入的人：接手游戏，自己变成主机（先暂停，等原来的主机连上来再继续）。mySlot = 我原来是几号玩家
  NP.becomeHost = mySlot => {
    NP.role = "host";
    NP.localSlot = mySlot | 0;
    localMask[NP.localSlot] = localMask[0]; if (NP.localSlot) localMask[0] = 0;
    for (const s in H.peers) delete H.peers[s];
    for (const w in H.watchers) delete H.watchers[w];
    for (const k in FAST) delete FAST[k];
    for (const k in FASTW) delete FASTW[k];
    H.pending = []; H.rows.clear(); H.decided.clear(); H.hashes.clear(); H.noise.clear();
    H.done = executed(); H.sentUpTo = executed(); H.recordedUpTo = executed();
    H.fps = 60; H.t0 = performance.now() - H.done * (1000 / H.fps);
    H.keep = true;
    G.synced = false; G.frames.clear();
    paused = true;
    schedule(0);
  };
  NP.resume = () => { if (NP.role === "host" && paused) { paused = false; onEvent("running"); schedule(0); } };
  NP.stop = () => { H.keep = false; NP.localSlot = 0; deactivate(); for (const s in H.peers) delete H.peers[s]; for (const w in H.watchers) delete H.watchers[w]; for (const k in FAST) delete FAST[k]; for (const k in FASTW) delete FASTW[k]; G.fast = null; H.pending = []; G.synced = false; };
  NP.setEventHandler = fn => { onEvent = fn || (() => {}); };
  NP.stats = () => ({ role: NP.role, frame: NP.active ? executed() : 0, peers: Object.keys(H.peers), watchers: Object.keys(H.watchers).length, synced: G.synced,
    buffered: G.frames.size, noise: [...H.noise],
    delay: NP.role === "guest" ? G.delay : Math.max(0, ...Object.values(H.peers).map(p => p.delay || 0)),
    buffer: NP.role === "guest" ? G.target : 0,
    mode: RB.on ? "rb" : "delay", rbDelay: RB.on ? RB.D : 0, rollbacks: RB.rollbacks, stepMs: Math.round(RB.stepMs * 10) / 10, rbNoise: [...RB.noise] });
})();
