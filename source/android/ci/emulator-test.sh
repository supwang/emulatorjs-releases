#!/bin/bash
# Started by the GitHub workflow inside an Android emulator: install the app, start it and check that it works.
cd "$(dirname "$0")"
OUT="${GITHUB_WORKSPACE:-$(cd ../.. && pwd)}/test-out"; mkdir -p "$OUT"
exec > >(tee -a "$OUT/run.log") 2>&1
echo "== test started in $(pwd), results in $OUT"
set -x
APK=$(ls ../app/build/outputs/apk/debug/*.apk | head -1)
fail() {
  echo "TEST FAILED: $1"
  adb logcat -d -s EJS EJS-node EJS-page AndroidRuntime:E chromium:E > "$OUT"/logcat.txt
  adb logcat -d | grep -iE "couchvs|EJS|libnode|FATAL|UnsatisfiedLink|DEBUG  :" | tail -150 > "$OUT"/logcat-app.txt
  adb shell dumpsys activity activities | grep -E "topResumedActivity|mResumedActivity|couchvs" | head -10 > "$OUT"/activities.txt
  adb shell pidof site.couchvs.emulatorjs > "$OUT"/pid.txt
  adb shell ls -la /data/data/site.couchvs.emulatorjs/files 2>&1 | head > "$OUT"/files.txt
  adb exec-out screencap -p > "$OUT"/fail.png
  exit 1
}
# let the freshly started emulator settle, and close any "isn't responding" dialog
sleep 45
adb shell am broadcast -a android.intent.action.CLOSE_SYSTEM_DIALOGS >/dev/null
adb shell input keyevent KEYCODE_HOME
adb install -r -g "$APK" || fail "install"
adb shell mkdir -p /sdcard/EmulatorJS/roms/nes
adb push test.nes /sdcard/EmulatorJS/roms/nes/test.nes
adb logcat -c
# Android's one-time "Viewing full screen" hint takes the keys until someone taps "Got it": mark it as seen
adb shell settings put secure immersive_mode_confirmations confirmed
adb shell am start -n site.couchvs.emulatorjs/.MainActivity
# first start unpacks the game files, then the server starts
ok=""
for i in $(seq 1 150); do
  sleep 2
  [ $((i % 15)) = 0 ] && { adb shell am broadcast -a android.intent.action.CLOSE_SYSTEM_DIALOGS >/dev/null; adb shell dumpsys activity activities | grep -m1 -E "topResumedActivity|mResumedActivity"; adb logcat -d -s EJS | tail -3; }
  adb forward tcp:8765 tcp:8765 >/dev/null 2>&1
  if curl -s -m 3 http://127.0.0.1:8765/api/lan | grep -q enabled; then ok=1; break; fi
done
adb exec-out screencap -p > "$OUT"/1-start.png
[ -n "$ok" ] || fail "server did not answer"
echo "== config"; curl -s http://127.0.0.1:8765/api/config | head -c 600; echo
curl -s "http://127.0.0.1:8765/api/list?root=roms" | grep -q "nes/test.nes" || fail "ROM folder not found"
echo "== folder browser"; curl -s "http://127.0.0.1:8765/api/dirs" | head -c 600; echo
sleep 8
PID=$(adb shell pidof site.couchvs.emulatorjs | tr -d '\r')
SOCK=$(adb shell cat /proc/net/unix | grep -o "webview_devtools_remote_$PID" | head -1)
[ -n "$SOCK" ] || fail "no WebView debugging socket"
adb forward tcp:19222 localabstract:$SOCK
js() { node cdp.mjs 19222 "$1"; }
echo "== page"; js "JSON.stringify({ games: games.map(g => g.title), lang: window.UI_LANG, theme: themeId, android: !!window.EJSAndroid })"
adb exec-out screencap -p > "$OUT"/2-page.png
# controller: press A through Android's input system and see it in the page
adb shell input gamepad keyevent KEYCODE_BUTTON_A
adb shell input gamepad keyevent 96
sleep 1
echo "== raw pads from the app"; js "window.EJSAndroid.pads()"
adb logcat -d -s EJS-pad | tail -5
js "(async () => { const seen = []; for (let i = 0; i < 20; i++) { const p = navigator.getGamepads(); if (p.length) seen.push(p[0].buttons[0].pressed); await new Promise(r => setTimeout(r, 25)); } return JSON.stringify({ pads: navigator.getGamepads().length, id: (navigator.getGamepads()[0] || {}).id }); })()" | tee "$OUT"/pad.txt
grep -q '"pads":[1-9]' "$OUT"/pad.txt || fail "controller not seen by the page"
# start the test game and check frames are running
js "(async () => { play(games.find(g => g.system === 'nes')); for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 1000)); const f = stage.querySelector('iframe'); const e = f && f.contentWindow.EJS_emulator; if (e && e.started) { const a = e.gameManager.functions.getFrameNum(); await new Promise(r => setTimeout(r, 2000)); return JSON.stringify({ started: true, framesIn2s: e.gameManager.functions.getFrameNum() - a, after: i + 1 }); } } return JSON.stringify({ started: false }); })()" | tee "$OUT"/game.txt
grep -q '"started":true' "$OUT"/game.txt || fail "game did not start"
adb exec-out screencap -p > "$OUT"/3-game.png
# Back key opens the game menu (record who opens / closes it, to explain a failure)
js "(() => { window.__dbg = []; const log = m => __dbg.push(Math.round(performance.now()) + ' ' + m); new MutationObserver(() => log('hidden=' + gameMenuEl.hidden)).observe(gameMenuEl, { attributes: true, attributeFilter: ['hidden'] }); for (const n of ['gameMenuOpen', 'gameMenuClose', 'gameMenuDo', 'navBack', 'navActivate']) { const f = window[n]; window[n] = function () { log(n + ' ' + [...arguments].join(',') + ' <- ' + (new Error().stack.split('\\n')[2] || '').trim()); return f.apply(this, arguments); }; } window.__ejsBack = window.navBack; document.addEventListener('keydown', e => log('keydown ' + e.key), true); document.addEventListener('click', e => log('click ' + (e.target.dataset && e.target.dataset.gm || e.target.tagName) + ' trusted=' + e.isTrusted), true); return 'ok'; })()"
adb shell input keyevent KEYCODE_BACK
sleep 1
js "JSON.stringify({ menu: !gameMenuEl.hidden, buttons: gameMenuEl.querySelectorAll('[data-gm]').length, paused: !!(gameEmu() && gameEmu().paused), focus: document.activeElement && document.activeElement.dataset.gm, coverPrompt: !document.getElementById('thumbModal').hidden })" | tee "$OUT"/menu.txt
sleep 5   # the emulator draws with a slow software GPU: give the screen time to catch up before the picture
adb exec-out screencap -p > "$OUT"/4-menu.png
js "JSON.stringify(window.__dbg)" | tee -a "$OUT"/menu.txt
js "JSON.stringify(EJSAndroid.pads())" | tee -a "$OUT"/menu.txt
grep -q '"menu":true' "$OUT"/menu.txt || fail "Back did not open the game menu"
adb logcat -d -s EJS EJS-node EJS-page AndroidRuntime > "$OUT"/logcat.txt
echo "ALL ANDROID TESTS PASSED"
