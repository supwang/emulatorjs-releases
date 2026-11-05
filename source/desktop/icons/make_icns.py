# Mac 图标文件：16、32 像素用苹果的老格式（is32/il32 + 透明度 s8mk/l8mk），大尺寸用 PNG。
# （electron-builder 自己做的图标把 16、32 像素存成 PNG（icp4/icp5），有的地方——比如系统设置的「本地网络」列表——会显示成一堆乱码像素）
import io, struct, sys
from PIL import Image
src = Image.open(sys.argv[1]).convert("RGBA")
def png(sz):
    b = io.BytesIO(); src.resize((sz, sz), Image.LANCZOS).save(b, "PNG"); return b.getvalue()
def rle(chan):   # 只用「原样照抄」的段（每段最多 128 字节），格式合法
    out = bytearray()
    for i in range(0, len(chan), 128):
        seg = chan[i:i + 128]; out.append(len(seg) - 1); out += seg
    return bytes(out)
def legacy(sz):
    im = src.resize((sz, sz), Image.LANCZOS)
    r, g, b, a = im.split()
    data = rle(r.tobytes()) + rle(g.tobytes()) + rle(b.tobytes())
    return data, a.tobytes()
def chunk(t, d): return t + struct.pack(">I", len(d) + 8) + d
body = b""
d16, m16 = legacy(16); d32, m32 = legacy(32)
body += chunk(b"is32", d16) + chunk(b"s8mk", m16) + chunk(b"il32", d32) + chunk(b"l8mk", m32)
for t, sz in [(b"ic11", 32), (b"ic12", 64), (b"ic07", 128), (b"ic13", 256), (b"ic08", 256), (b"ic14", 512), (b"ic09", 512), (b"ic10", 1024)]:
    body += chunk(t, png(sz))
open(sys.argv[2], "wb").write(b"icns" + struct.pack(">I", len(body) + 8) + body)
print("ok", len(body) + 8)
