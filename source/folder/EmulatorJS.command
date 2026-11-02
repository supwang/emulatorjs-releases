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

# 端口：28765（1.3.0 以前是 8765，常被别的开发工具占用）。浏览器里原来的名字、设置、存档会自动从 8765 搬过来
PORT=28765
# 之前打开的 EmulatorJS 服务器还开着（比如上次的窗口没关）：先把它关掉，保证用的是最新版本
for p in 8765 $PORT; do
  for pid in $(lsof -t -iTCP:$p -sTCP:LISTEN 2>/dev/null); do
    ps -p "$pid" -o command= | grep -qE "http.server|server.py" && kill "$pid"
  done
done
sleep 1
# 端口被别的程序占着（不是 EmulatorJS）：换一个空着的端口，不然浏览器打开的是那个程序
if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  for p in 28766 28767 28768 28769 28770 28771 28772 28773 28774 28775; do
    if ! lsof -iTCP:$p -sTCP:LISTEN >/dev/null 2>&1; then PORT=$p; break; fi
  done
  echo "Port 28765 is used by another program, using port $PORT instead."
fi
python3 server.py $PORT &
sleep 1
open "http://127.0.0.1:$PORT/index.html"
echo "EmulatorJS is open in your browser: http://127.0.0.1:$PORT/index.html"
echo "Keep this window open while playing. Close it when you are done."
wait
