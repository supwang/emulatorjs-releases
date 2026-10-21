package site.couchvs.emulatorjs;

/** Runs Node.js (nodejs-mobile) once per app process, on its own thread with a big stack. */
final class NodeRunner {
    static {
        System.loadLibrary("node");
        System.loadLibrary("native-lib");
    }
    private static boolean started = false;

    private static native int startNode(String[] args);

    /** Whether Node.js is already running in this app process (the activity can be created again while it runs). */
    static synchronized boolean isStarted() { return started; }

    static synchronized void start(final String[] args) {
        if (started) return;   // Node can only be started once in a process
        started = true;
        Thread t = new Thread(null, new Runnable() {
            @Override public void run() { startNode(args); }
        }, "node", 16 * 1024 * 1024);
        t.setDaemon(true);
        t.start();
    }

    private NodeRunner() {}
}
