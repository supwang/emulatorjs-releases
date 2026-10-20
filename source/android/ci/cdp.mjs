// Runs a JavaScript expression in the app's page (Chrome DevTools protocol over adb) and prints the result.
// node cdp.mjs <local port forwarded to the WebView> "<expression>"
const [port, expr] = process.argv.slice(2);
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = pages.find(p => p.type === "page" && /index\.html/.test(p.url)) || pages[0];
if (!page) { console.log("NO PAGE " + JSON.stringify(pages)); process.exit(2); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
const msg = await new Promise(res => { ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id === 1) res(m); }; });
ws.close();
const r = msg.result && msg.result.result;
console.log(r && "value" in r ? (typeof r.value === "string" ? r.value : JSON.stringify(r.value)) : JSON.stringify(msg));
process.exit(0);
