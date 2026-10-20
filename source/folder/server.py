#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EmulatorJS 本地服务器
- 提供游戏页面和模拟器文件
- 读取 ROM / 预览图 / BIOS 文件夹，这样网页不用每次都重新选文件夹
- 文件夹设置、局域网开关保存在同目录的 config.json 里
- 局域网联机：大厅（谁在玩什么）+ 转发 WebRTC 连接信息，画面和按键走点对点连接
默认只有本机能访问；在页面「文件夹设置」里打开「局域网联机」后，局域网里的其他设备才能访问。
"""
import hashlib
import hmac
import ipaddress
import json
import os
import socket
import string
import sys
import re
import threading
import unicodedata
import time
import urllib.parse
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

APP_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
CONFIG_FILE = os.path.join(APP_DIR, "config.json")
HOME = os.path.expanduser("~")
KINDS = ("roms", "thumbs", "bios")
LOCAL_HOSTS = {"127.0.0.1:%d" % PORT, "localhost:%d" % PORT, "[::1]:%d" % PORT}


# ---------------- 文件夹配置 ----------------
def retroarch_dirs():
    """RetroArch 常见的安装/数据位置"""
    if sys.platform == "darwin":
        return [os.path.join(HOME, "Library", "Application Support", "RetroArch"),
                os.path.join(HOME, "Documents", "RetroArch")]
    if os.name == "nt":
        out = []
        for env in ("APPDATA", "USERPROFILE"):
            if os.environ.get(env):
                out.append(os.path.join(os.environ[env], "RetroArch"))
        for drive in "CDEF":
            out += [drive + r":\RetroArch-Win64", drive + r":\RetroArch",
                    drive + r":\Games\RetroArch-Win64", drive + r":\Games\RetroArch"]
        return out
    return [os.path.join(HOME, ".config", "retroarch")]


def candidates(kind):
    """按优先级列出可能的文件夹：先找 EmulatorJS 文件夹里的，再找 RetroArch 的"""
    local = {"roms": ["roms", "ROMs"], "thumbs": ["thumbnails"], "bios": ["system", "bios"]}[kind]
    sub = {"roms": ["roms"], "thumbs": ["thumbnails"], "bios": ["system"]}[kind]
    out = [os.path.join(APP_DIR, s) for s in local]
    for r in retroarch_dirs():
        out += [os.path.join(r, s) for s in sub]
    return out


def read_saved():
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def write_saved(saved):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(saved, f, ensure_ascii=False, indent=2)


def lan_enabled():
    # 默认打开：在同一个局域网里打开 EmulatorJS 的人能互相看到；不想联机可以在设置里关掉
    return bool(read_saved().get("lan", True))


def current_config():
    saved = read_saved()
    out = {"home": HOME, "sep": os.sep, "platform": sys.platform}
    for kind in KINDS:
        path = saved.get(kind) or ""
        if path and os.path.isdir(path):
            out[kind] = {"path": path, "ok": True, "auto": False}
            continue
        found = next((c for c in candidates(kind) if os.path.isdir(c)), "")
        # 保存过但现在不存在（比如换了电脑），就退回自动查找
        out[kind] = {"path": found, "ok": bool(found), "auto": True, "missing": path if path else ""}
    out["cloud"] = {"url": str(saved.get("cloud_url") or ""), "key": str(saved.get("cloud_key") or ""),
                    "list": saved.get("cloud_list") if isinstance(saved.get("cloud_list"), list) else []}
    return out


def clean_cloud_url(url):
    """外网联机服务器地址：补上 http:// 和默认端口；格式不对返回 None"""
    url = str(url or "").strip().rstrip("/")
    if url and "://" not in url:
        url = "http://" + url
    if not url:
        return ""
    u = urllib.parse.urlsplit(url)
    if u.scheme not in ("http", "https") or not u.hostname:
        return None
    if not u.port and u.scheme == "http":
        url += ":8765"
    return url


def public_config():
    """给局域网里其他设备看的配置：不透露本机的文件夹路径、外网服务器的房间密码"""
    cfg = current_config()
    out = {"remote": True, "sep": "/", "home": "", "cloudProxy": bool(cfg["cloud"]["url"] and cfg["cloud"]["key"])}
    for kind in KINDS:
        out[kind] = {"path": "", "ok": cfg[kind]["ok"], "auto": True, "missing": ""}
    return out


# ---------------- 外网服务器中转 ----------------
# 局域网里的手机、平板没有房间密码：它们的外网请求（账号、好友、战绩、外网大厅）先发到这台电脑，
# 由这台电脑加上房间密码转发给外网服务器。
CLOUD_PROXY_RE = re.compile(r"^/cp/api/(mp|acct|friends|stats|match)/[a-z/]+$|^/cp/api/(ice|ping)$")


CLOUD_DOWN = [0.0]   # 外网服务器连不上的时间：之后 20 秒内直接回复「连不上」，不用每次都等


def cloud_proxy(method, path_qs, body, token):
    """返回 (状态码, 内容)"""
    if time.time() - CLOUD_DOWN[0] < 20:
        return 502, b'{"error": "cloud server unreachable"}'
    code, out = _cloud_proxy(method, path_qs, body, token)
    if code == 502:
        CLOUD_DOWN[0] = time.time()
    return code, out


def _cloud_proxy(method, path_qs, body, token):
    import ssl
    import subprocess
    import urllib.request
    import urllib.error
    saved = read_saved()
    base, key = str(saved.get("cloud_url") or ""), str(saved.get("cloud_key") or "")
    if not base or not key:
        return 404, b'{"error": "no cloud server"}'
    url = base + path_qs[3:]
    headers = {"X-EJS-Key": key, "X-EJS": "1", "Content-Type": "application/json"}
    if token:
        headers["X-EJS-Token"] = token
    req = urllib.request.Request(url, data=body if method == "POST" else None, headers=headers, method=method)
    ctx = None
    ca = os.environ.get("EJS_CLOUD_CA")
    if ca:
        ctx = ssl.create_default_context(cafile=ca)
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except urllib.error.URLError as e:
        if not isinstance(getattr(e, "reason", None), ssl.SSLError):
            return 502, b'{"error": "cloud server unreachable"}'
    # Mac 自带的 Python 有时找不到根证书：改用系统的 curl（用系统钥匙串验证证书）
    try:
        cmd = ["curl", "-sS", "-m", "10", "-X", method, "-w", "\n%{http_code}"]
        for k, v in headers.items():
            cmd += ["-H", "%s: %s" % (k, v)]
        if method == "POST":
            cmd += ["--data-binary", "@-"]
        out = subprocess.run(cmd + [url], input=body or b"", capture_output=True, timeout=15).stdout
        text, _, code = out.rpartition(b"\n")
        return int(code or 502), text
    except Exception:
        return 502, b'{"error": "cloud server unreachable"}'


def base_dir(kind):
    if kind not in KINDS:
        return None
    c = current_config()[kind]
    return c["path"] if c["ok"] else None


def safe_join(base, rel):
    base_real = os.path.realpath(base)
    target = os.path.realpath(os.path.join(base_real, *[p for p in rel.split("/") if p not in ("", ".", "..")]))
    if target != base_real and not target.startswith(base_real.rstrip(os.sep) + os.sep):
        return None
    return target


def list_files(base, limit=100000):
    out = []
    for root, dirs, files in os.walk(base):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))
        for name in files:
            if name.startswith("."):
                continue
            full = os.path.join(root, name)
            try:
                size = os.path.getsize(full)
            except OSError:
                continue
            out.append([os.path.relpath(full, base).replace(os.sep, "/"), size])
            if len(out) >= limit:
                return out
    return out


# ---------------- 从别人电脑下载的 ROM / BIOS：一段一段写进自己的文件夹 ----------------
BAD_NAME = re.compile(r"\.(exe|bat|cmd|com|ps1|psm1|vbs|vbe|js|jse|wsf|wsh|msi|scr|lnk|reg|sh|command|app|py|pyw|html?|dll|dylib|so|jar)$", re.I)
SAVE_LOCK = threading.Lock()


def rom_save(kind, rel, offset, total, length, read, keep=False):
    """kind=roms|bios|thumbs；rel=放在文件夹里的相对路径；按 offset 依次写入，写完最后一段才改成正式文件名。
    返回 (json, 状态码)。最后一段返回实际保存的位置（同名但不一样的文件不会被覆盖；keep=已经有同名文件就用自己的）"""
    cfg = current_config()
    if kind not in ("roms", "bios", "thumbs"):
        return {"error": "bad kind"}, 400
    used = kind
    base = cfg[kind]["path"] if cfg[kind]["ok"] else ""
    if not base and kind == "bios" and cfg["roms"]["ok"]:
        base, used = cfg["roms"]["path"], "roms"      # 没设 BIOS 文件夹：放进 ROM 文件夹
    if not base and kind == "thumbs" and offset == 0:
        base = os.path.join(APP_DIR, "thumbnails")    # 没有预览图文件夹：在 EmulatorJS 文件夹里建一个（以后会自动找到）
        os.makedirs(base, exist_ok=True)
    elif not base and kind == "thumbs" and os.path.isdir(os.path.join(APP_DIR, "thumbnails")):
        base = os.path.join(APP_DIR, "thumbnails")
    if not base:
        return {"error": "还没有设置 ROM 文件夹", "code": "no_folder"}, 400
    rel = rel.replace("\\", "/").strip("/")
    parts = [p for p in rel.split("/") if p not in ("", ".", "..")]
    if not parts or len(rel) > 300 or len(parts) > 5 or parts[-1].startswith(".") or BAD_NAME.search(parts[-1]):
        return {"error": "bad name"}, 400
    if total <= 0 or total > 4 * 1024 ** 3 or offset < 0 or length < 0 or length > 64 * 1024 * 1024 or offset + length > total:
        return {"error": "bad range"}, 400
    target = safe_join(base, "/".join(parts))
    if not target:
        return {"error": "bad name"}, 400
    folder, name = os.path.split(target)
    part = os.path.join(folder, "." + name + ".ejs-part")
    with SAVE_LOCK:
        if offset:
            if not os.path.isfile(part) or os.path.getsize(part) != offset:
                return {"error": "out of order", "have": os.path.getsize(part) if os.path.isfile(part) else 0}, 409
            f = open(part, "r+b")
        else:
            os.makedirs(folder, exist_ok=True)
            f = open(part, "wb")
        with f:
            f.seek(offset)
            left = length
            while left > 0:
                chunk = read(min(1024 * 1024, left))
                if not chunk:
                    break
                f.write(chunk)
                left -= len(chunk)
        if left:
            return {"error": "short body"}, 400
        if offset + length < total:
            return {"ok": True}, 200
        final = target
        if os.path.isfile(final) and (keep or os.path.getsize(final) == total):
            os.remove(part)                           # 已经有一模一样大小的（或者是预览图，已经有了）：用原来的
        else:
            if os.path.exists(final):
                # 同名但不一样的文件：不覆盖自己原来的，放进旁边的「EmulatorJS downloads」文件夹（文件名不能改，街机游戏靠文件名识别）
                final = os.path.join(folder, "EmulatorJS downloads", name)
                os.makedirs(os.path.dirname(final), exist_ok=True)
            os.replace(part, final)
        return {"ok": True, "done": True, "kind": used,
                "rel": os.path.relpath(final, os.path.realpath(base)).replace(os.sep, "/")}, 200


def shortcuts():
    items = [("个人文件夹", HOME)]
    for label, sub in (("桌面", "Desktop"), ("文稿", "Documents"), ("下载", "Downloads")):
        items.append((label, os.path.join(HOME, sub)))
    items.append(("EmulatorJS 文件夹", APP_DIR))
    for r in retroarch_dirs():
        items.append(("RetroArch", r))
    if sys.platform == "darwin":
        items.append(("外接磁盘", "/Volumes"))
    if os.name == "nt":
        for d in string.ascii_uppercase:
            items.append((d + ":", d + ":\\"))
    seen, out = set(), []
    for label, p in items:
        if p not in seen and os.path.isdir(p):
            seen.add(p)
            out.append({"label": label, "path": p})
    return out


def list_dirs(path):
    path = path or HOME
    path = os.path.abspath(os.path.expanduser(path))
    if not os.path.isdir(path):
        path = HOME
    try:
        names = sorted((n for n in os.listdir(path)
                        if not n.startswith(".") and os.path.isdir(os.path.join(path, n))),
                       key=str.lower)
    except OSError:
        names = []
    parent = os.path.dirname(path.rstrip(os.sep)) or path
    return {"path": path, "parent": parent if parent != path else "", "dirs": names, "shortcuts": shortcuts()}


def lan_addresses():
    """本机在局域网里的 IP 地址（给其他设备输入用）"""
    addrs = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))   # 不会真的发数据，只是让系统选出局域网网卡
        addrs.add(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            addrs.add(info[4][0])
    except OSError:
        pass
    return sorted(a for a in addrs if ipaddress.ip_address(a).is_private and not a.startswith("127."))


# ---------------- 自动发现：局域网里其他开着 EmulatorJS 的电脑 ----------------
# 每台电脑每 2 秒在局域网里广播一次“我在这里 + 正在玩什么”，不用互相告诉地址。
DISC_PORT = 8764
INSTANCE = uuid.uuid4().hex[:12]
PEERS = {}        # instance -> {"ip", "port", "sessions", "seen"}
PEER_TIMEOUT = 8


def broadcast_targets():
    out = {"255.255.255.255"}
    for a in lan_addresses():
        out.add(a.rsplit(".", 1)[0] + ".255")   # 家用路由器一般是 /24 网段
    return out


def discovery_loop():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    try:
        sock.bind(("", DISC_PORT))
    except OSError:
        return
    sock.settimeout(0.5)
    last = 0
    while True:
        now = time.time()
        if now - last >= 2:
            last = now
            if lan_enabled():
                with MP_LOCK:
                    mp_cleanup()
                    sess = [session_view(k, v) for k, v in SESSIONS.items()][:12]
                for x in sess:
                    x.pop("game", None)
                msg = json.dumps({"ejs": 2, "id": INSTANCE, "port": PORT, "sessions": sess},
                                 ensure_ascii=False).encode("utf-8")
                for t in broadcast_targets():
                    try:
                        sock.sendto(msg, (t, DISC_PORT))
                    except OSError:
                        pass
        try:
            data, (ip, _) = sock.recvfrom(65535)
            d = json.loads(data.decode("utf-8"))
            if d.get("ejs") == 2 and d.get("id") != INSTANCE and (ipaddress.ip_address(ip).is_private or os.environ.get("EJS_TEST_ANYIP")):
                with MP_LOCK:
                    PEERS[str(d["id"])[:20]] = {"ip": ip, "port": int(d.get("port") or 8765),
                                                "sessions": d.get("sessions") or [], "seen": time.time()}
        except (OSError, ValueError, KeyError, TypeError):
            pass


def remote_sessions():
    """其他电脑上正在玩的游戏（调用时已持有 MP_LOCK）"""
    now = time.time()
    out = []
    for k in list(PEERS):
        p = PEERS[k]
        if now - p["seen"] > PEER_TIMEOUT:
            del PEERS[k]
            continue
        for s in p["sessions"]:
            if isinstance(s, dict) and s.get("sid"):
                s = dict(s, at="%s:%d" % (p["ip"], p["port"]))
                out.append(s)
    return out


# ---------------- 玩家名字过滤：不允许辱骂、侮辱等不文明的词 ----------------
# 屏蔽词在 data/badwords.json（可以自己增删）；文件改了会自动重新读取
BADWORDS_FILE = os.path.join(APP_DIR, "data", "badwords.json")
_bad = {"mtime": None, "words": []}


def _norm(text):
    """统一全角半角、大小写，去掉空格和符号（防止用「傻 b」「s.b」绕过）"""
    text = unicodedata.normalize("NFKC", str(text)).lower()
    return re.sub(r"[\W_]+", "", text)


def bad_words():
    try:
        m = os.path.getmtime(BADWORDS_FILE)
        if m != _bad["mtime"]:
            with open(BADWORDS_FILE, "r", encoding="utf-8-sig") as f:
                _bad["words"] = [w for w in (_norm(x) for x in json.load(f).get("words", [])) if w]
            _bad["mtime"] = m
    except (OSError, ValueError, AttributeError):
        pass
    return _bad["words"]


def clean_name(name, cid=""):
    name = re.sub(r"[\x00-\x1f\x7f]", "", str(name or "")).strip()[:24]
    n = _norm(name)
    if not n or any(w in n for w in bad_words()):
        return "玩家" + str(cid)[:3].upper()   # 加上编号，免得一堆人都叫「玩家」
    return name


# 只有管理员（开发者）能用的名字：名字里带这些字的，都要用管理员账号登录才行
RESERVED_NAMES = ("开发者", "developer")


def reserved_name(name):
    n = _norm(name)
    return any(r in n for r in RESERVED_NAMES)


def name_taken(cid, name):
    """正在玩或正在乱入的人里，有别人用了同样的名字（忽略大小写、空格和符号）"""
    n = _norm(name)
    for s in SESSIONS.values():
        if s["host"] != cid and _norm(s["hostName"]) == n:
            return True
        for c, p in s["players"].items():
            if c != cid and _norm(p["name"]) == n:
                return True
    return False


def taken_reply(name):
    return {"error": "名字「%s」已经有人在用了，请点「我是：…」换一个名字" % name, "nameTaken": True}, 409


# ---------------- 联机大厅（只在内存里） ----------------
MP_LOCK = threading.Lock()
SESSIONS = {}     # sid -> {game, title, system, group, host, hostName, allowJoin, players{cid:{name,slot,seen}}, seen}
MAILBOX = {}      # cid -> [messages]
CLIENT_SEEN = {}  # cid -> time
CLIENT_INFO = {}  # cid -> {name, acct, country, loc}：在线玩家列表用（外网服务器）
TIMEOUT = 12      # 秒：超过这么久没心跳就当作离开
BANS = {}         # 房主的编号 -> [{cid, acct, iph, until}]：被房主请出去的人，30 分钟内不能再进这个房主的房间
KICK_MINUTES = 30
MAX_WATCH = 8         # 每局最多观战人数
MAX_WATCH_VIDEO = 2   # 其中「看画面」观战（主机要单独给每个人压缩视频，最吃主机性能）最多几个
ACCOUNTS_ENABLED = False   # 云服务器上为 True：data["_acct"] 是服务器核实过的账号名
IP_SALT = os.urandom(16)


def ip_hash(ip):
    """不把对方的 IP 告诉任何人，只留一个对不上原 IP 的指纹，用来认出被请出去的人"""
    ip = str(ip or "")
    if ip.startswith("::ffff:"):
        ip = ip[7:]
    return hmac.new(IP_SALT, ip.encode(), hashlib.sha256).hexdigest()[:16] if ip else ""


def ban_left(host, cid, acct, iph):
    """这个人被这个房主请出去了吗？返回还剩几分钟（0 = 没有）"""
    now = time.time()
    for b in BANS.get(host, []):
        if b["until"] > now and ((cid and b["cid"] == cid) or (acct and b["acct"] and _norm(b["acct"]) == _norm(acct))
                                 or (iph and b["iph"] == iph)):
            return max(1, int((b["until"] - now + 59) // 60))
    return 0


# 每台设备的编号（client）是公开的（房间列表里看得到房主的编号），所以再配一个只有它自己知道的密钥（csec）：
# 服务器第一次见到这个编号时记下密钥的指纹，以后同一个编号必须带同一个密钥，别人就冒充不了（结束别人的房间、收别人的消息）。
# 旧版本没有密钥：只要这个编号还没被带密钥的请求用过，照旧可以用。
CLIENT_SECRETS = {}      # client -> [密钥指纹, 最后一次用的时间]
CLIENT_SECRET_DAYS = 30


def client_ok(cid, sec, now):
    sec = str(sec or "")[:200]
    old = CLIENT_SECRETS.get(cid)
    if not sec:
        return old is None
    h = hashlib.sha256(("ejs-client:" + sec).encode()).hexdigest()
    if old is None:
        CLIENT_SECRETS[cid] = [h, now]
        return True
    if not hmac.compare_digest(old[0], h):
        return False
    old[1] = now
    return True


def mp_cleanup():
    now = time.time()
    if len(CLIENT_SECRETS) > 2000:
        for c in [c for c, v in CLIENT_SECRETS.items() if now - v[1] > CLIENT_SECRET_DAYS * 86400]:
            del CLIENT_SECRETS[c]
    for sid in list(SESSIONS):
        s = SESSIONS[sid]
        if now - s["seen"] > TIMEOUT:
            for cid in s["players"]:
                MAILBOX.setdefault(cid, []).append({"type": "ended", "sid": sid})
            del SESSIONS[sid]
            continue
        for cid in list(s["players"]):
            if now - s["players"][cid]["seen"] > TIMEOUT:
                del s["players"][cid]
                MAILBOX.setdefault(s["host"], []).append({"type": "left", "sid": sid, "from": cid})
    for cid in list(MAILBOX):
        if now - CLIENT_SEEN.get(cid, 0) > 60:   # 一直没来取消息（或者根本不存在）的编号：信箱清掉
            del MAILBOX[cid]
    if len(CLIENT_SEEN) > 5000:
        for c in [c for c, t in CLIENT_SEEN.items() if now - t > 600]:
            del CLIENT_SEEN[c]
            CLIENT_INFO.pop(c, None)
    for h in list(BANS):
        BANS[h] = [b for b in BANS[h] if b["until"] > now]
        if not BANS[h]:
            del BANS[h]


def players_view(cids):
    """在线玩家：名字、国家 / 地区、有没有注册，在玩什么（开局 / 一起玩 / 观战 / 在大厅）"""
    where = {}
    for sid, s in SESSIONS.items():
        where[s["host"]] = {"sid": sid, "role": "host", "title": s["title"], "system": s["system"], "group": s["group"], "game": s["game"]}
        for c, p in s["players"].items():
            where.setdefault(c, {"sid": sid, "role": "watch" if p.get("watch") else "player", "title": s["title"],
                                 "system": s["system"], "group": s["group"], "game": s["game"]})
    out = []
    for c in cids:
        i = CLIENT_INFO.get(c)
        if not i:
            continue
        out.append({"name": i["name"], "country": i["country"], "loc": i["loc"], "reg": bool(i["acct"]), "at": where.get(c)})
    out.sort(key=lambda x: (x["at"] is None, not x["reg"], x["name"].lower()))
    return out


def session_view(sid, s):
    return {"sid": sid, "game": s["game"], "title": s["title"], "system": s["system"], "group": s["group"],
            "host": s["host"], "hostName": s["hostName"], "allowJoin": s["allowJoin"], "sync": s.get("sync", False),
            "size": s.get("size", 0), "challenge": s.get("challenge", False), "hostCountry": s.get("hostCountry", ""), "hostLoc": s.get("hostLoc", ""),
            "allowWatch": s.get("allowWatch", True), "regOnly": s.get("regOnly", False),
            "players": [{"cid": c, "name": p["name"], "slot": p["slot"], "mode": p.get("mode", ""), "country": p.get("country", ""),
                         "loc": p.get("loc", ""), "watch": p.get("watch", False)}
                        for c, p in s["players"].items()]}


def _int(v):
    try:
        return max(0, min(int(v or 0), 1 << 40))
    except (TypeError, ValueError):
        return 0


def mp_handle(path, data):
    """处理联机请求，返回 (json, 状态码)"""
    cid = str(data.get("client") or "")[:64]
    name = clean_name(data.get("name"), data.get("client") or "")
    now = time.time()
    iph = str(data.get("_iph") or "")
    # 账号：云服务器上是核实过的；局域网里是对方自己说的（只用来认出被请出去的人，冒用别人的名字只会挡住自己）
    acct = str(data.get("_acct") or "") if ACCOUNTS_ENABLED else str(data.get("acct") or "")[:16]
    # 管理员专用的名字：要用这个名字的账号（云服务器上核实过；局域网里由房主拿凭证去外网服务器核实）
    if reserved_name(name) and _norm(acct) != _norm(name):
        name = "玩家" + str(cid)[:3].upper()
    with MP_LOCK:
        if cid and path != "/api/mp/sessions" and not client_ok(cid, data.get("csec"), now):
            return {"error": "这台设备的联机编号被别人占用了，请刷新页面", "code": "bad_client"}, 403
        if cid:
            CLIENT_SEEN[cid] = now
            CLIENT_INFO[cid] = {"name": name, "acct": acct, "country": str(data.get("country") or "")[:2],
                                "loc": str(data.get("_loc") or "")[:2]}
        mp_cleanup()
        if path == "/api/mp/sessions":
            remote = remote_sessions() if lan_enabled() else []
            return {"sessions": [session_view(k, v) for k, v in SESSIONS.items()],
                    "remote": remote, "peers": len(PEERS) if lan_enabled() else 0}, 200
        if not cid:
            return {"error": "missing client"}, 400
        if path == "/api/mp/host":
            game = str(data.get("game") or "")[:500]
            for sid, s in SESSIONS.items():
                if s["game"] == game and s["host"] != cid:
                    # 同一个游戏已经有人在玩：改为乱入
                    return {"existing": session_view(sid, s)}, 200
            for sid in [k for k, v in SESSIONS.items() if v["host"] == cid]:
                del SESSIONS[sid]
            if name_taken(cid, name):
                return taken_reply(name)
            sid = uuid.uuid4().hex[:10]
            SESSIONS[sid] = {"game": game, "title": str(data.get("title") or "")[:200],
                             "system": str(data.get("system") or "")[:20], "group": str(data.get("group") or "")[:20],
                             "host": cid, "hostName": name, "allowJoin": bool(data.get("allowJoin", True)),
                             "sync": bool(data.get("sync", False)), "size": _int(data.get("size")),
                             "challenge": bool(data.get("challenge", False)), "hostCountry": str(data.get("country") or "")[:2],
                             "hostLoc": str(data.get("_loc") or "")[:2],   # 外网服务器按 IP 查到的国家/地区
                             "allowWatch": bool(data.get("allowWatch", True)), "regOnly": bool(data.get("regOnly", False)),
                             "players": {}, "seen": now}
            return {"sid": sid}, 200
        s = SESSIONS.get(str(data.get("sid") or ""))
        if path == "/api/mp/heartbeat":
            if s and s["host"] == cid:
                s["seen"] = now
                if not name_taken(cid, name):    # 中途改名：和别人重名就保留原来的名字
                    s["hostName"] = name
            elif s and cid in s["players"]:
                s["players"][cid]["seen"] = now
            return {"ok": bool(s), "session": session_view(data.get("sid"), s) if s else None}, 200
        if path == "/api/mp/update":
            if not s or s["host"] != cid:
                return {"error": "not host"}, 403
            if "allowJoin" in data:
                s["allowJoin"] = bool(data["allowJoin"])
            if "challenge" in data:
                s["challenge"] = bool(data["challenge"])
            if "allowWatch" in data:
                s["allowWatch"] = bool(data["allowWatch"])
            if "regOnly" in data:
                s["regOnly"] = bool(data["regOnly"])
            return {"session": session_view(data.get("sid"), s)}, 200
        if path in ("/api/mp/kick", "/api/mp/reject"):
            # 房主把人请出去（kick：30 分钟内不能再进来）；或者拒绝（reject：没通过账号核实，不记仇）
            if not s or s["host"] != cid:
                return {"error": "not host"}, 403
            target = str(data.get("target") or "")[:64]
            p = s["players"].pop(target, None)
            if path == "/api/mp/kick":
                acct_t = str(data.get("acct") or "")[:16] or (p.get("acct", "") if p else "")
                BANS.setdefault(cid, []).append({"cid": target, "acct": acct_t, "iph": p.get("iph", "") if p else "",
                                                 "until": now + KICK_MINUTES * 60})
                MAILBOX.setdefault(target, []).append({"type": "kicked", "sid": data.get("sid"), "minutes": KICK_MINUTES})
            else:
                MAILBOX.setdefault(target, []).append({"type": "rejected", "sid": data.get("sid"),
                                                       "code": str(data.get("code") or "")[:20]})
            return {"ok": True, "session": session_view(data.get("sid"), s)}, 200
        if path == "/api/mp/end":
            if s and s["host"] == cid:
                for p in s["players"]:
                    MAILBOX.setdefault(p, []).append({"type": "ended", "sid": data.get("sid")})
                del SESSIONS[data.get("sid")]
            return {"ok": True}, 200
        if path == "/api/mp/join":
            if not s:
                return {"error": "这局游戏已经结束了"}, 404
            if s["host"] == cid:
                return {"error": "这是你自己开的游戏"}, 400
            left = ban_left(s["host"], cid, acct, iph)
            if left:
                return {"error": "你被房主请出了这个房间，%d 分钟后才能再进入" % left, "code": "kicked", "minutes": left}, 403
            if s.get("regOnly") and ACCOUNTS_ENABLED and not acct:
                return {"error": "这局只允许登录了账号的玩家进入", "code": "need_login"}, 403
            watch = data.get("watch") is True     # 观战：不占玩家位置，不能操作
            mode = "sync" if data.get("mode") == "sync" else "stream"
            if watch:
                if not s.get("allowWatch", True):
                    return {"error": "房主关闭了观战", "code": "no_watch"}, 403
                others = [p for c, p in s["players"].items() if p.get("watch") and c != cid]
                if len(others) >= MAX_WATCH:
                    return {"error": "观战的人太多了（最多 8 个）"}, 409
                if mode == "stream" and sum(1 for p in others if p.get("mode") != "sync") >= MAX_WATCH_VIDEO:
                    return {"error": "看画面观战的人满了（最多 2 个）", "code": "watch_video_full"}, 409
                slot = 0
            else:
                if not s["allowJoin"]:
                    return {"error": "主机设置了不允许乱入"}, 403
                used = {p["slot"] for c, p in s["players"].items() if c != cid and not p.get("watch")}
                free = [n for n in (1, 2, 3) if n not in used]
                if not free:
                    return {"error": "人满了（最多 4 个玩家）"}, 409
                old = s["players"].get(cid)
                slot = old["slot"] if old and not old.get("watch") else free[0]
            if name_taken(cid, name):
                return taken_reply(name)
            s["players"][cid] = {"name": name, "slot": slot, "seen": now, "mode": mode, "watch": watch,
                                 "country": str(data.get("country") or "")[:2], "loc": str(data.get("_loc") or "")[:2], "acct": acct, "iph": iph}
            msg = {"type": "join", "sid": data.get("sid"), "from": cid, "name": name, "slot": slot, "mode": mode, "watch": watch,
                   "acct": acct, "verified": bool(ACCOUNTS_ENABLED and acct)}
            if not ACCOUNTS_ENABLED and data.get("ticket"):
                msg["ticket"] = str(data.get("ticket"))[:600]   # 局域网：主机拿去外网服务器核实账号
            MAILBOX.setdefault(s["host"], []).append(msg)
            return {"slot": slot, "host": s["host"], "session": session_view(data.get("sid"), s)}, 200
        if path == "/api/mp/leave":
            if s and cid in s["players"]:
                del s["players"][cid]
                MAILBOX.setdefault(s["host"], []).append({"type": "left", "sid": data.get("sid"), "from": cid})
            return {"ok": True}, 200
        if path == "/api/mp/send":
            to = str(data.get("to") or "")[:64]
            try:
                size = len(json.dumps(data.get("data"), ensure_ascii=False))
            except (TypeError, ValueError):
                return {"error": "bad data"}, 400
            if size > 64 * 1024:
                return {"error": "too large"}, 413
            if now - CLIENT_SEEN.get(to, 0) > 60:   # 对方不在了（或者根本没有这个人）：不存
                return {"ok": True}, 200
            box = MAILBOX.setdefault(to, [])
            if len(box) < 200:
                box.append({"type": "signal", "from": cid, "sid": str(data.get("sid") or "")[:20], "data": data.get("data")})
            return {"ok": True}, 200
        if path == "/api/mp/recv":
            msgs = MAILBOX.pop(cid, [])
            return {"messages": msgs}, 200
        if path == "/api/mp/presence":   # 开着程序、连着这个大厅：每 15 秒报到一次（在线人数、在线玩家列表）
            return {"ok": True}, 200
    return {"error": "not found"}, 404


# ---------------- HTTP ----------------
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=APP_DIR, **kwargs)

    def log_message(self, *args):
        pass

    def end_headers(self):
        # 页面和脚本每次都向服务器确认是否有新版本（更新后不会用到浏览器里的旧缓存）
        p = urllib.parse.urlsplit(self.path).path
        if p == "/" or p.endswith((".html", ".js", ".json", ".css")):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def is_local(self):
        return self.client_address[0] in ("127.0.0.1", "::1", "::ffff:127.0.0.1")

    def host_ok(self):
        # 防止别的网站借助 DNS 重绑定读取本机文件：只接受 localhost 或 IP 地址形式的访问
        host = self.headers.get("Host", "")
        if host in LOCAL_HOSTS:
            return True
        if not lan_enabled():
            return False
        h, _, p = host.rpartition(":")
        try:
            ipaddress.ip_address(h.strip("[]"))
            return p == str(PORT)
        except ValueError:
            return False

    def allowed(self):
        return self.host_ok() and (self.is_local() or lan_enabled())

    def cors_origin(self):
        """局域网里其他电脑上的 EmulatorJS 页面（来自 127.0.0.1 或局域网地址）可以调用联机接口"""
        origin = self.headers.get("Origin") or ""
        try:
            u = urllib.parse.urlsplit(origin)
            if u.scheme != "http" or not u.hostname:
                return ""
            if u.hostname == "localhost":
                return origin
            ip = ipaddress.ip_address(u.hostname)
            return origin if (ip.is_loopback or ip.is_private) else ""
        except ValueError:
            return ""

    def send_cors(self):
        if urllib.parse.urlsplit(self.path).path.startswith("/api/mp/"):
            origin = self.cors_origin()
            if origin:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")

    def do_OPTIONS(self):
        origin = self.cors_origin()
        if not self.allowed() or not origin or not urllib.parse.urlsplit(self.path).path.startswith("/api/mp/"):
            return self.send_error(403)
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-EJS")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Vary", "Origin")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_proxy(self, method, body=b""):
        url = urllib.parse.urlsplit(self.path)
        if not CLOUD_PROXY_RE.match(url.path):
            return self.send_error(404)
        code, out = cloud_proxy(method, self.path, body, self.headers.get("X-EJS-Token", "")[:200])
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(out)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(out)

    def do_GET(self):
        if not self.allowed():
            return self.send_error(403)
        url = urllib.parse.urlsplit(self.path)
        if url.path.startswith("/cp/"):
            return self.send_proxy("GET")
        q = urllib.parse.parse_qs(url.query)
        if url.path == "/api/config":
            return self.send_json(current_config() if self.is_local() else public_config())
        if url.path == "/api/lan":
            return self.send_json({"enabled": lan_enabled(), "port": PORT, "addresses": lan_addresses(),
                                   "isLocal": self.is_local()})
        if url.path == "/api/mp/sessions":
            body, code = mp_handle(url.path, {})
            return self.send_json(body, code)
        if url.path == "/api/list":
            base = base_dir((q.get("root") or [""])[0])
            if not base:
                return self.send_json({"files": [], "error": "folder not set"})
            return self.send_json({"files": list_files(base)})
        if url.path == "/api/dirs":
            if not self.is_local():
                return self.send_error(403)
            return self.send_json(list_dirs((q.get("path") or [""])[0]))
        if url.path.startswith("/fs/"):
            parts = url.path[4:].split("/", 1)
            base = base_dir(parts[0])
            rel = urllib.parse.unquote(parts[1]) if len(parts) > 1 else ""
            target = safe_join(base, rel) if base else None
            if not target or not os.path.isfile(target):
                return self.send_error(404)
            return self.send_file(target)
        if not self.static_ok():
            return self.send_error(404)
        return super().do_GET()

    def do_HEAD(self):
        if not self.allowed():
            return self.send_error(403)
        if not self.static_ok():
            return self.send_error(404)
        return super().do_HEAD()

    def static_ok(self):
        """只给出页面本身和 data 文件夹里的文件。EmulatorJS 文件夹里的其他东西（config.json 里有外网房间密码、
        脚本等）一律不给；按真正对应的文件位置判断，换个写法（%63onfig.json、/./config.json）也绕不过去"""
        try:
            full = os.path.realpath(self.translate_path(self.path))
        except Exception:
            return False
        app = os.path.realpath(APP_DIR)
        if full in (app, os.path.join(app, "index.html"), os.path.join(app, "redirect.html")):
            return True
        return full.startswith(os.path.join(app, "data") + os.sep) and os.path.isfile(full)

    def send_file(self, target):
        """发送文件；支持 Range 请求（网页只读文件头/目录时用，不用整个下载）"""
        try:
            size = os.path.getsize(target)
            start, end = 0, size - 1
            rng = self.headers.get("Range", "")
            partial = False
            if rng.startswith("bytes="):
                a, _, b = rng[6:].split(",")[0].partition("-")
                try:
                    if a:
                        start = int(a)
                        end = min(int(b), size - 1) if b else size - 1
                    elif b:
                        start = max(size - int(b), 0)
                    partial = start <= end and start < size
                except ValueError:
                    partial = False
                if not partial:
                    start, end = 0, size - 1
            length = max(end - start + 1, 0)
            self.send_response(206 if partial else 200)
            self.send_header("Content-Type", self.guess_type(target))
            self.send_header("Content-Length", str(length))
            self.send_header("Accept-Ranges", "bytes")
            if partial:
                self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
            self.end_headers()
            with open(target, "rb") as f:
                f.seek(start)
                left = length
                while left > 0:
                    chunk = f.read(min(1024 * 1024, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
        except (OSError, ConnectionError):
            pass

    def do_POST(self):
        # 只接受本页面发来的请求（自定义请求头会让别的网站的请求被浏览器拦下）
        if not self.allowed() or self.headers.get("X-EJS") != "1":
            return self.send_error(403)
        path = urllib.parse.urlsplit(self.path).path
        if path == "/api/rom/save":
            # 只有本机的页面能往自己的文件夹里写
            if not self.is_local():
                return self.send_error(403)
            q = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
            try:
                offset, total = int((q.get("offset") or ["0"])[0]), int((q.get("total") or ["0"])[0])
                length = int(self.headers.get("Content-Length") or 0)
            except ValueError:
                return self.send_json({"error": "bad request"}, 400)
            try:
                body, code = rom_save((q.get("kind") or ["roms"])[0], (q.get("rel") or [""])[0], offset, total, length, self.rfile.read,
                                      keep=(q.get("keep") or [""])[0] == "1")
            except OSError as e:
                body, code = {"error": "保存失败：" + str(e), "code": "write"}, 500
            return self.send_json(body, code)
        if path.startswith("/cp/"):
            try:
                length = int(self.headers.get("Content-Length") or 0)
            except ValueError:
                return self.send_error(400)
            if length < 0 or length > 256 * 1024:
                return self.send_error(413)
            return self.send_proxy("POST", self.rfile.read(length))
        try:
            length = int(self.headers.get("Content-Length") or 0)
            if length < 0 or length > 256 * 1024:
                return self.send_json({"error": "too large"}, 413)
            data = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            if not isinstance(data, dict):
                raise ValueError
        except Exception:
            return self.send_json({"error": "bad request"}, 400)
        if path.startswith("/api/mp/"):
            data.pop("_acct", None); data.pop("_loc", None)
            data["_iph"] = ip_hash(self.client_address[0])
            body, code = mp_handle(path, data)
            return self.send_json(body, code)
        # 以下设置只能在本机改
        if not self.is_local():
            return self.send_error(403)
        if path == "/api/lan":
            saved = read_saved()
            want = bool(data.get("enabled"))
            changed = bool(saved.get("lan", True)) != want
            saved["lan"] = want
            write_saved(saved)
            self.send_json({"enabled": want, "port": PORT, "addresses": lan_addresses(), "isLocal": True,
                            "restarting": changed})
            if changed:
                request_restart()
            return
        if path == "/api/quit":
            # 新打开的 EmulatorJS 会先让旧的服务器退出，保证用的是最新版本
            self.send_json({"ok": True})
            threading.Thread(target=lambda: (time.sleep(0.2), os._exit(0)), daemon=True).start()
            return
        if path == "/api/cloud":
            # 外网联机服务器的地址和房间密码（写进 config.json，打包发给朋友时一起带过去）
            url = clean_cloud_url(data.get("url"))
            key = str(data.get("key") or "").strip()
            if url is None:
                return self.send_json({"error": "地址格式不对，例如 http://1.2.3.4:8765"}, 400)
            saved = read_saved()
            saved["cloud_url"], saved["cloud_key"] = url, key[:200]
            # 保存过的多个服务器（一个服务器一个大厅，可以切换）
            if isinstance(data.get("list"), list):
                lst = []
                for x in data["list"][:20]:
                    if isinstance(x, dict) and clean_cloud_url(x.get("url")):
                        lst.append({"url": clean_cloud_url(x.get("url")), "key": str(x.get("key") or "").strip()[:200]})
                saved["cloud_list"] = lst
            write_saved(saved)
            return self.send_json(current_config())
        if path != "/api/config":
            return self.send_error(404)
        saved = read_saved()
        for kind in KINDS:
            if kind in data:
                p = (data[kind] or "").strip()
                if p:
                    p = os.path.abspath(os.path.expanduser(p))
                    if not os.path.isdir(p):
                        return self.send_json({"error": "文件夹不存在：" + p}, 400)
                saved[kind] = p
        write_saved(saved)
        return self.send_json(current_config())


# ---------------- 启动 / 切换局域网时重新监听 ----------------
HTTPD = None
RESTART = threading.Event()


def request_restart():
    RESTART.set()
    threading.Thread(target=lambda: (time.sleep(0.3), HTTPD and HTTPD.shutdown()), daemon=True).start()


def main():
    global HTTPD
    first = True
    threading.Thread(target=discovery_loop, daemon=True).start()
    while True:
        lan = lan_enabled()
        addr = "0.0.0.0" if lan else "127.0.0.1"
        try:
            HTTPD = ThreadingHTTPServer((addr, PORT), Handler)
        except OSError:
            if first:
                print("Port %d is already in use: EmulatorJS may already be running." % PORT)
                return
            time.sleep(1)
            continue
        HTTPD.daemon_threads = True
        if first:
            print("EmulatorJS server started: http://127.0.0.1:%d/index.html" % PORT)
        if lan:
            print("LAN play is on. Other devices can open: " + ", ".join("http://%s:%d" % (a, PORT) for a in lan_addresses()))
        else:
            print("LAN play is off (only this computer can connect).")
        first = False
        try:
            HTTPD.serve_forever()
        except KeyboardInterrupt:
            break
        finally:
            HTTPD.server_close()
        if not RESTART.is_set():
            break
        RESTART.clear()


if __name__ == "__main__":
    main()
