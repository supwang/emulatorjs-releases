// 界面语言：默认跟操作系统一样，可以在左上角切换（记在浏览器里）。
// 翻译表在 data/i18n/<语言>.json：{"中文原文": "译文"}，原文里的 {0} {1} 是会变的部分（名字、数字等）。
// 页面上出现的中文文字会自动换成译文（包括后来才显示出来的提示、列表），所以程序里照常写中文就行。
(function () {
  var LANGS = [["zh-CN", "简体中文", "cn"], ["zh-TW", "繁體中文", "hk"], ["en", "English", "us"], ["ja", "日本語", "jp"], ["ko", "한국어", "kr"],
    ["es", "Español", "es"], ["fr", "Français", "fr"], ["de", "Deutsch", "de"], ["pt", "Português", "br"], ["ru", "Русский", "ru"]];
  var IDS = LANGS.map(function (l) { return l[0]; });
  window.UI_LANGS = LANGS;
  function pick() {
    try { var s = localStorage.getItem("ejs-lang"); if (IDS.indexOf(s) >= 0) return s; } catch (e) {}
    var ls = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < ls.length; i++) {
      var l = String(ls[i] || "").toLowerCase();
      if (/^zh-(tw|hk|mo)|^zh-hant/.test(l)) return "zh-TW";
      if (/^zh/.test(l)) return "zh-CN";
      var b = l.split("-")[0];
      if (IDS.indexOf(b) >= 0) return b;
    }
    return "en";
  }
  var lang = window.UI_LANG = pick();
  document.documentElement.lang = lang;
  window.I18N = null;
  if (lang !== "zh-CN") {
    try {   // 本机服务器上的小文件：同步读取，页面一出来就是对应的语言
      var x = new XMLHttpRequest();
      x.open("GET", "data/i18n/" + lang + ".json", false);
      x.send();
      if (x.status === 200) window.I18N = JSON.parse(x.responseText);
    } catch (e) {}
  }
  var dict = window.I18N;
  var missing = window.__i18nMissing = new Set();
  if (!dict) { window.I18N_tr = function (s) { return s; }; return; }
  var CJK = /[㐀-鿿]/;
  // 带 {0} 的原文变成匹配规则；固定的字越多越优先
  var pats = [];
  Object.keys(dict).forEach(function (k) {
    if (!/\{\d\}/.test(k) || k.charAt(0) === "_") return;
    var parts = k.split(/(\{\d\})/), re = "^", idx = [];
    parts.forEach(function (p) {
      var m = /^\{(\d)\}$/.exec(p);
      if (m) { re += "([\\s\\S]+?)"; idx.push(+m[1]); }
      else re += p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    pats.push({ re: new RegExp(re + "$"), idx: idx, tpl: dict[k], w: k.replace(/\{\d\}/g, "").length });
  });
  pats.sort(function (a, b) { return b.w - a.w; });
  function lookup(t) {
    if (Object.prototype.hasOwnProperty.call(dict, t)) return dict[t];
    for (var i = 0; i < pats.length; i++) {
      var m = pats[i].re.exec(t);
      if (!m) continue;
      var vals = {};
      pats[i].idx.forEach(function (n, j) { var v = m[j + 1]; vals[n] = Object.prototype.hasOwnProperty.call(dict, v) ? dict[v] : v; });
      return pats[i].tpl.replace(/\{(\d)\}/g, function (_, n) { return vals[n] !== undefined ? vals[n] : ""; });
    }
    return null;
  }
  // 翻译一段文字：找不到译文就原样返回
  function tr(s) {
    if (!s || !CJK.test(s)) return s;
    var t = s.trim(), v = lookup(t);
    if (v === null) { missing.add(t); return s; }
    return s.replace(t, v);
  }
  window.I18N_tr = tr;
  var done = new WeakMap();   // 我们改过的文字：不要再翻译一次
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, NOSCRIPT: 1 };
  var ATTRS = ["title", "placeholder", "aria-label"];
  function skipEl(el) {
    for (; el && el.nodeType === 1; el = el.parentNode) {
      if (SKIP[el.tagName] || el.classList.contains("notr") || el.getAttribute("translate") === "no") return true;
    }
    return false;
  }
  function doText(n) {
    var v = n.nodeValue;
    if (!v || !CJK.test(v) || done.get(n) === v || skipEl(n.parentNode)) return;
    var out = tr(v);
    done.set(n, out);
    if (out !== v) n.nodeValue = out;
  }
  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute(ATTRS[i]);
      if (!a || !CJK.test(a)) continue;
      var key = "a:" + ATTRS[i], seen = done.get(el) || {};
      if (seen[key] === a) continue;
      var out = tr(a);
      seen[key] = out; done.set(el, seen);
      if (out !== a) el.setAttribute(ATTRS[i], out);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1 || skipEl(root)) return;
    doAttrs(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.nodeType === 1 && SKIP[n.tagName] ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else if (!n.classList.contains("notr")) doAttrs(n); }
  }
  function start() {
    walk(document.body);
    if (document.title && CJK.test(document.title)) document.title = tr(document.title);
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === "childList") for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
        else if (m.type === "characterData") doText(m.target);
        else if (m.type === "attributes") doAttrs(m.target);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
