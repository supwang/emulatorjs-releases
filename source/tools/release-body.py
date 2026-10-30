#!/usr/bin/env python3
"""Public release page text: tools/public-release-body.md plus "what's new" from release-notes/<version>.json
   (English under the English part, Chinese under the Chinese part).
   python3 tools/release-body.py 1.2.0 > body.md"""
import json, os, sys
ver = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
body = open(os.path.join(here, "public-release-body.md"), encoding="utf-8").read()
p = os.path.join(here, "..", "release-notes", ver + ".json")
if os.path.exists(p):
    n = json.load(open(p, encoding="utf-8"))
    en = "**What's new in %s**\n" % ver + "".join("- %s\n" % x for x in n.get("en", [])) + "\n"
    zh = "**%s 更新了什么**\n" % ver + "".join("- %s\n" % x for x in n.get("zh-CN", [])) + "\n"
    i = body.index("**Which file?**")
    body = body[:i] + en + body[i:]
    j = body.index("**下载哪个？**")
    body = body[:j] + zh + body[j:]
sys.stdout.write(body)
