#!/bin/bash
# 双击运行：在本机启动 EmulatorJS
cd "$(dirname "$0")"

# 给这个启动文件设置图标（图标在 data/icon.png；文件经过传输丢了图标时，运行一次就会恢复）
if [ -f data/icon.png ]; then
  osascript -l JavaScript - "$PWD/data/icon.png" "$PWD/$(basename "$0")" >/dev/null 2>&1 <<'JS' &
function run(argv) {
  ObjC.import("AppKit");
  const img = $.NSImage.alloc.initWithContentsOfFile(argv[0]);
  $.NSWorkspace.sharedWorkspace.setIconForFileOptions(img, argv[1], 0);
}
JS
fi

PORT=8765
# 端口被之前打开的 EmulatorJS 服务器占着（比如上次的窗口没关），先把它关掉，保证用的是最新版本
if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  for pid in $(lsof -t -iTCP:$PORT -sTCP:LISTEN); do
    ps -p "$pid" -o command= | grep -qE "http.server|server.py" && kill "$pid"
  done
  sleep 1
fi
if ! lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  python3 server.py $PORT &
  sleep 1
fi
open "http://127.0.0.1:$PORT/index.html"
echo "EmulatorJS is open in your browser: http://127.0.0.1:$PORT/index.html"
echo "Keep this window open while playing. Close it when you are done."
wait
