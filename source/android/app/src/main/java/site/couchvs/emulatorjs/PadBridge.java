package site.couchvs.emulatorjs;

import android.util.Log;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.webkit.JavascriptInterface;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Game controllers: the app reads them itself (key and stick events) and hands their state to the page,
 * which asks for it through navigator.getGamepads() (see the small script in the page). Buttons use the
 * standard layout: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 Select, 9 Start, 10 L3, 11 R3,
 * 12-15 D-pad up/down/left/right, 16 Home. Works the same on every phone and TV.
 */
final class PadBridge {
    private static final int BUTTONS = 17;

    private static final class Pad {
        final int index;
        final String name;
        final float[] buttons = new float[BUTTONS];
        final float[] axes = new float[4];
        boolean hatUp, hatDown, hatLeft, hatRight, ltOn, rtOn;
        long timestamp;
        Pad(int index, String name) { this.index = index; this.name = name; }
    }

    private final Map<Integer, Pad> pads = new LinkedHashMap<>();   // by Android device id

    /** From a controller: the event itself says so, or the device it came from is a controller (its D-pad keys). */
    static boolean isPad(InputDevice dev, int source) {
        return padSource(source) || (dev != null && padSource(dev.getSources()));
    }
    private static boolean padSource(int s) {
        return (s & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD
                || (s & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK;
    }

    private Pad pad(int deviceId, InputDevice dev) {
        Pad p = pads.get(deviceId);
        if (p == null) {
            int idx = 0;
            boolean taken;
            do { taken = false; for (Pad q : pads.values()) if (q.index == idx) { taken = true; idx++; break; } } while (taken);
            p = new Pad(idx, dev != null ? dev.getName() : "Gamepad");
            pads.put(deviceId, p);
        }
        return p;
    }

    private static int buttonFor(int keyCode) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_BUTTON_A: return 0;
            case KeyEvent.KEYCODE_BUTTON_B: return 1;
            case KeyEvent.KEYCODE_BUTTON_X: return 2;
            case KeyEvent.KEYCODE_BUTTON_Y: return 3;
            case KeyEvent.KEYCODE_BUTTON_L1: return 4;
            case KeyEvent.KEYCODE_BUTTON_R1: return 5;
            case KeyEvent.KEYCODE_BUTTON_L2: return 6;
            case KeyEvent.KEYCODE_BUTTON_R2: return 7;
            case KeyEvent.KEYCODE_BUTTON_SELECT: return 8;
            case KeyEvent.KEYCODE_BUTTON_START: return 9;
            case KeyEvent.KEYCODE_BUTTON_THUMBL: return 10;
            case KeyEvent.KEYCODE_BUTTON_THUMBR: return 11;
            case KeyEvent.KEYCODE_DPAD_UP: return 12;
            case KeyEvent.KEYCODE_DPAD_DOWN: return 13;
            case KeyEvent.KEYCODE_DPAD_LEFT: return 14;
            case KeyEvent.KEYCODE_DPAD_RIGHT: return 15;
            case KeyEvent.KEYCODE_BUTTON_MODE: return 16;
            default: return -1;
        }
    }

    /** A key from a controller: remember it and don't let it do anything else. */
    synchronized boolean onKey(KeyEvent e) {
        if (BuildConfig.DEBUG && e.getAction() == KeyEvent.ACTION_DOWN)
            Log.d("EJS-pad", "key " + e.getKeyCode() + " source 0x" + Integer.toHexString(e.getSource()) + " device " + e.getDeviceId()
                    + " pad " + isPad(e.getDevice(), e.getSource()));
        if (!isPad(e.getDevice(), e.getSource())) return false;
        int b = buttonFor(e.getKeyCode());
        if (b < 0) {
            // Some controllers send Back for their B / Select button: treat it as B
            if (e.getKeyCode() == KeyEvent.KEYCODE_BACK) b = 1;
            else return false;
        }
        Pad p = pad(e.getDeviceId(), e.getDevice());
        if (e.getAction() == KeyEvent.ACTION_DOWN) p.buttons[b] = 1f;
        else if (e.getAction() == KeyEvent.ACTION_UP) p.buttons[b] = 0f;
        p.timestamp = e.getEventTime();
        return true;
    }

    /** Sticks, triggers and the D-pad of controllers that report it as a "hat". */
    synchronized boolean onMotion(MotionEvent e) {
        if (!isPad(e.getDevice(), e.getSource()) || e.getAction() != MotionEvent.ACTION_MOVE) return false;
        Pad p = pad(e.getDeviceId(), e.getDevice());
        p.axes[0] = e.getAxisValue(MotionEvent.AXIS_X);
        p.axes[1] = e.getAxisValue(MotionEvent.AXIS_Y);
        p.axes[2] = e.getAxisValue(MotionEvent.AXIS_Z);
        p.axes[3] = e.getAxisValue(MotionEvent.AXIS_RZ);
        float lt = Math.max(e.getAxisValue(MotionEvent.AXIS_LTRIGGER), e.getAxisValue(MotionEvent.AXIS_BRAKE));
        float rt = Math.max(e.getAxisValue(MotionEvent.AXIS_RTRIGGER), e.getAxisValue(MotionEvent.AXIS_GAS));
        // triggers: only when they cross half-way (controllers that send L2 / R2 keys keep working)
        boolean ltNow = lt > 0.5f, rtNow = rt > 0.5f;
        if (ltNow != p.ltOn) { p.buttons[6] = ltNow ? 1f : 0f; p.ltOn = ltNow; }
        if (rtNow != p.rtOn) { p.buttons[7] = rtNow ? 1f : 0f; p.rtOn = rtNow; }
        float hx = e.getAxisValue(MotionEvent.AXIS_HAT_X), hy = e.getAxisValue(MotionEvent.AXIS_HAT_Y);
        boolean up = hy < -0.5f, down = hy > 0.5f, left = hx < -0.5f, right = hx > 0.5f;
        // only touch the D-pad buttons when the hat changed (controllers that send D-pad keys instead keep working)
        if (up != p.hatUp) { p.buttons[12] = up ? 1f : 0f; p.hatUp = up; }
        if (down != p.hatDown) { p.buttons[13] = down ? 1f : 0f; p.hatDown = down; }
        if (left != p.hatLeft) { p.buttons[14] = left ? 1f : 0f; p.hatLeft = left; }
        if (right != p.hatRight) { p.buttons[15] = right ? 1f : 0f; p.hatRight = right; }
        p.timestamp = e.getEventTime();
        return true;
    }

    synchronized void removed(int deviceId) { pads.remove(deviceId); }

    /** For the page: all controllers as JSON (index, id, buttons, axes, timestamp). */
    @JavascriptInterface
    public synchronized String pads() {
        StringBuilder sb = new StringBuilder("[");
        List<Pad> list = new ArrayList<>(pads.values());
        for (int i = 0; i < list.size(); i++) {
            Pad p = list.get(i);
            if (i > 0) sb.append(',');
            sb.append("{\"index\":").append(p.index).append(",\"id\":\"").append(p.name.replace("\\", "").replace("\"", "'"))
              .append("\",\"t\":").append(p.timestamp).append(",\"b\":[");
            for (int k = 0; k < BUTTONS; k++) { if (k > 0) sb.append(','); sb.append(p.buttons[k] > 0.5f ? '1' : '0'); }
            sb.append("],\"a\":[");
            for (int k = 0; k < 4; k++) { if (k > 0) sb.append(','); sb.append(Math.round(p.axes[k] * 1000) / 1000f); }
            sb.append("]}");
        }
        return sb.append(']').toString();
    }
}
