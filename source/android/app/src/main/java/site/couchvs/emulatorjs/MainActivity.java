package site.couchvs.emulatorjs;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.input.InputManager;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.io.FileInputStream;
import java.util.Locale;

/** EmulatorJS for Android phones and TVs: the game page full screen, served by the built-in server. */
public class MainActivity extends Activity {
    private static final String TAG = "EJS";
    private static final int REQ_STORAGE = 1, REQ_MIC = 2, REQ_FILE = 3;

    private FrameLayout root;
    private WebView web;
    private TextView status;
    private View customView;
    private final PadBridge pads = new PadBridge();
    private final Handler ui = new Handler(Looper.getMainLooper());
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingMic;
    private WifiManager.MulticastLock multicast;
    private long lastBack = 0;
    private boolean started = false;

    private static boolean zh() { return Locale.getDefault().getLanguage().startsWith("zh"); }
    private static String t(String zh, String en) { return zh() ? zh : en; }

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(12, 15, 44));
        status = new TextView(this);
        status.setTextColor(Color.rgb(255, 243, 227));
        status.setTextSize(18);
        status.setGravity(Gravity.CENTER);
        status.setPadding(48, 48, 48, 48);
        status.setText(t("EmulatorJS 正在启动…", "EmulatorJS is starting…"));
        root.addView(status, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);
        immersive();
        InputManager im = (InputManager) getSystemService(Context.INPUT_SERVICE);
        if (im != null) im.registerInputDeviceListener(new InputManager.InputDeviceListener() {
            @Override public void onInputDeviceAdded(int id) {}
            @Override public void onInputDeviceChanged(int id) {}
            @Override public void onInputDeviceRemoved(int id) { pads.removed(id); }   // controller unplugged / switched off
        }, ui);
        try {
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null) { multicast = wm.createMulticastLock("ejs-lan"); multicast.setReferenceCounted(false); multicast.acquire(); }
        } catch (Exception e) { Log.w(TAG, "multicast", e); }
        // ROM folders are read by their normal paths: ask once for storage access (without it the app still runs)
        if (Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE}, REQ_STORAGE);
        } else start();
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        if (code == REQ_STORAGE) start();
        else if (code == REQ_MIC && pendingMic != null) {
            boolean ok = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
            if (ok) pendingMic.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE}); else pendingMic.deny();
            pendingMic = null;
        }
    }

    /** Unpack the page (first start / after an update), start the server, then show the page. */
    private void start() {
        if (started) return;
        started = true;
        Log.i(TAG, "starting (Android " + Build.VERSION.SDK_INT + ")");
        makeFolders();
        new Thread(new Runnable() {
            @Override public void run() {
                try {
                    File dir = AssetInstaller.install(MainActivity.this, new AssetInstaller.Progress() {
                        @Override public void update(final int done, final int total) {
                            ui.post(new Runnable() { @Override public void run() {
                                status.setText(t("第一次启动，正在准备游戏文件… ", "Preparing game files (first start)… ") + (done * 100 / total) + "%");
                            } });
                        }
                    });
                    Log.i(TAG, "game files ready in " + dir);
                    // port.txt is written by the server once it listens. It stays on disk after the app is closed,
                    // updated or crashes, so only trust it while Node.js runs in this process: otherwise remove it and
                    // start Node.js again (an old port.txt made the page open before any server was running).
                    final File portFile = new File(getFilesDir(), "port.txt");
                    if (!NodeRunner.isStarted()) {
                        //noinspection ResultOfMethodCallIgnored
                        portFile.delete();
                        NodeRunner.start(new String[]{"node", new File(dir, "node/main.js").getAbsolutePath(),
                                getFilesDir().getAbsolutePath(), dir.getAbsolutePath(), storageRootsJson()});
                        Log.i(TAG, "Node.js started");
                    }
                    String port = null;
                    for (int i = 0; i < 600 && (port = readPort(portFile)) == null; i++) Thread.sleep(100);
                    if (port == null || port.startsWith("error")) throw new Exception(port == null ? "server did not start" : port);
                    final String url = "http://127.0.0.1:" + port + "/index.html";
                    Log.i(TAG, "server ready: " + url);
                    ui.post(new Runnable() { @Override public void run() { showPage(url); } });
                } catch (final Exception e) {
                    Log.e(TAG, "start", e);
                    ui.post(new Runnable() { @Override public void run() {
                        status.setText(t("启动失败：", "Could not start: ") + e.getMessage());
                    } });
                }
            }
        }, "ejs-start").start();
    }

    private static String readPort(File f) {
        if (!f.exists()) return null;
        try {
            FileInputStream in = new FileInputStream(f);
            byte[] b = new byte[64];
            int n = in.read(b);
            in.close();
            String s = n > 0 ? new String(b, 0, n, "UTF-8").trim() : "";
            return s.isEmpty() ? null : s;
        } catch (Exception e) { return null; }
    }

    /** Phone storage plus memory cards / USB drives (found through the app's folder on each of them). */
    private String storageRootsJson() {
        StringBuilder sb = new StringBuilder("[");
        File[] dirs = getExternalFilesDirs(null);
        boolean first = true;
        if (dirs != null) for (File d : dirs) {
            if (d == null) continue;
            String p = d.getAbsolutePath();
            int i = p.indexOf("/Android/data/");
            if (i <= 0) continue;
            if (!first) sb.append(',');
            sb.append('"').append(p.substring(0, i).replace("\"", "")).append('"');
            first = false;
        }
        return sb.append(']').toString();
    }

    /** EmulatorJS/roms, thumbnails, system in phone storage, so people know where to put their games. */
    private void makeFolders() {
        if (Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) return;
        try {
            File base = new File("/storage/emulated/0/EmulatorJS");
            for (String s : new String[]{"roms", "thumbnails", "system"}) {
                File f = new File(base, s);
                //noinspection ResultOfMethodCallIgnored
                if (!f.exists()) f.mkdirs();
            }
        } catch (Exception e) { Log.w(TAG, "folders", e); }
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private void showPage(String url) {
        if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) WebView.setWebContentsDebuggingEnabled(true);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " EmulatorJS-Android/" + versionName());
        web.setBackgroundColor(Color.rgb(12, 15, 44));
        web.addJavascriptInterface(pads, "EJSAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("127.0.0.1".equals(u.getHost()) || "localhost".equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { Log.w(TAG, "open", e); }
                return true;
            }
            @Override public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail d) {
                // the page's process ended (out of memory etc.): start the page again instead of closing the app
                root.removeView(web);
                web.destroy();
                web = null;
                showPage(url);
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(final PermissionRequest req) {
                ui.post(new Runnable() { @Override public void run() {
                    for (String r : req.getResources()) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) {   // voice chat
                            if (Build.VERSION.SDK_INT < 23 || checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                                req.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                            } else { pendingMic = req; requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC); }
                            return;
                        }
                    }
                    req.deny();
                } });
            }
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                try { startActivityForResult(p.createIntent(), REQ_FILE); }
                catch (Exception e) { fileCallback = null; return false; }
                return true;
            }
            @Override public void onShowCustomView(View view, CustomViewCallback cb) {   // full screen
                if (customView != null) { cb.onCustomViewHidden(); return; }
                customView = view;
                root.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                immersive();
            }
            @Override public void onHideCustomView() {
                if (customView != null) { root.removeView(customView); customView = null; }
                immersive();
            }
            @Override public boolean onConsoleMessage(ConsoleMessage m) {
                if (m.messageLevel() == ConsoleMessage.MessageLevel.ERROR) Log.w("EJS-page", m.message() + " (" + m.sourceId() + ":" + m.lineNumber() + ")");
                return true;
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        status.setVisibility(View.GONE);
        web.loadUrl(url);
        web.requestFocus();
        warnOldWebView(s.getUserAgentString());
    }

    /** The game page needs a browser engine (Android System WebView) of Chrome 73 or newer; older TV boxes may have one too old. */
    private void warnOldWebView(String ua) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("Chrome/(\\d+)").matcher(ua);
        if (!m.find()) return;
        int major = Integer.parseInt(m.group(1));
        if (major >= 73) return;
        new android.app.AlertDialog.Builder(this)
                .setTitle(t("网页组件太旧", "Browser engine too old"))
                .setMessage(t("这台设备的「Android System WebView」版本是 " + major + "，太旧了，游戏可能打不开。\n请在应用商店里更新「Android System WebView」（或「Chrome」）后再打开 EmulatorJS。",
                        "This device's \"Android System WebView\" is version " + major + ", which is too old; games may not open.\nPlease update \"Android System WebView\" (or Chrome) from the app store, then open EmulatorJS again."))
                .setPositiveButton(android.R.string.ok, null)
                .show();
    }

    private String versionName() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return "?"; }
    }

    @Override
    protected void onActivityResult(int code, int result, Intent data) {
        if (code == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
            fileCallback = null;
            return;
        }
        super.onActivityResult(code, result, data);
    }

    // ---- controllers and the Back key ----
    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        if (pads.onKey(e)) return true;
        if (e.getKeyCode() == KeyEvent.KEYCODE_BACK || e.getKeyCode() == KeyEvent.KEYCODE_MENU) {
            if (e.getAction() == KeyEvent.ACTION_UP) back();
            return true;
        }
        return super.dispatchKeyEvent(e);
    }

    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent e) {
        if (pads.onMotion(e)) return true;
        return super.dispatchGenericMotionEvent(e);
    }

    /** Back: let the page close what is open (panel, lobby, game menu…); when nothing is open, press twice to leave. */
    private void back() {
        if (web == null) { finish(); return; }
        web.evaluateJavascript("(function(){try{return window.__ejsBack?!!window.__ejsBack():false}catch(e){return false}})()", new ValueCallback<String>() {
            @Override public void onReceiveValue(String handled) {
                if ("true".equals(handled)) return;
                if (customView != null) { exitFullScreen(); return; }   // nothing open in the page: leave full screen first
                long now = System.currentTimeMillis();
                if (now - lastBack < 2500) { finish(); return; }
                lastBack = now;
                Toast.makeText(MainActivity.this, t("再按一次返回键退出", "Press Back again to quit"), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void exitFullScreen() {
        if (web != null) web.evaluateJavascript("document.fullscreenElement&&document.exitFullscreen()", null);
    }

    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override
    public void onWindowFocusChanged(boolean has) {
        super.onWindowFocusChanged(has);
        if (has) immersive();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
        immersive();
    }

    @Override
    protected void onDestroy() {
        if (multicast != null && multicast.isHeld()) multicast.release();
        super.onDestroy();
    }
}
