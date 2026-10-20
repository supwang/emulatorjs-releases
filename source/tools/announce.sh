#!/bin/bash
# Tell the apps about a new version: copy latest.json of release v<version> in the public download
# repository to its main branch. Do this after the files are also on Baidu Netdisk.
#   bash tools/announce.sh 1.0.9
set -e
V="$1"; PUB=supwang/emulatorjs-releases; DIR=/home/claude/emulatorjs-releases
[ -n "$V" ] || { echo "usage: announce.sh <version>"; exit 1; }
ID=$(gh api "repos/$PUB/releases/tags/v$V" --jq '.assets[] | select(.name=="latest.json") | .id')
[ -n "$ID" ] || { echo "release v$V has no latest.json"; exit 1; }
git -C "$DIR" fetch -q origin main && git -C "$DIR" reset -q --hard origin/main
gh api -H "Accept: application/octet-stream" "repos/$PUB/releases/assets/$ID" > "$DIR/latest.json"
python3 -c "import json,sys; j=json.load(open(sys.argv[1])); assert j['version']==sys.argv[2], j['version']; print('latest.json', j['version'], sorted(j['files']))" "$DIR/latest.json" "$V"
git -C "$DIR" add latest.json
git -C "$DIR" commit -q -m "EmulatorJS $V"
git -C "$DIR" push -q origin HEAD:main
echo "announced $V"
