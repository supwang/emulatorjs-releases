package site.couchvs.emulatorjs;

import android.content.Context;
import android.content.res.AssetManager;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

/** Unpacks the game page and the server (assets/ejs) into the app's folder; only again after an update. */
final class AssetInstaller {
    interface Progress { void update(int done, int total); }

    static File install(Context ctx, Progress progress) throws IOException {
        AssetManager am = ctx.getAssets();
        String version = readAll(am.open("ejs/version.txt")).trim();
        File dir = new File(ctx.getFilesDir(), "ejs");
        File marker = new File(dir, "installed-" + version);
        if (marker.exists()) return dir;
        deleteTree(dir);
        List<String> files = new ArrayList<>();
        BufferedReader r = new BufferedReader(new InputStreamReader(am.open("ejs/files.txt"), "UTF-8"));
        for (String line; (line = r.readLine()) != null; ) if (!line.trim().isEmpty()) files.add(line.trim());
        r.close();
        byte[] buf = new byte[256 * 1024];
        for (int i = 0; i < files.size(); i++) {
            String rel = files.get(i);
            File out = new File(dir, rel);
            File parent = out.getParentFile();
            if (parent != null && !parent.isDirectory() && !parent.mkdirs()) throw new IOException("mkdir " + parent);
            InputStream in = am.open("ejs/" + rel);
            OutputStream os = new FileOutputStream(out);
            for (int n; (n = in.read(buf)) > 0; ) os.write(buf, 0, n);
            os.close();
            in.close();
            if (progress != null && (i % 20 == 0 || i == files.size() - 1)) progress.update(i + 1, files.size());
        }
        if (!marker.createNewFile() && !marker.exists()) throw new IOException("marker");
        return dir;
    }

    private static String readAll(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        byte[] b = new byte[4096];
        for (int n; (n = in.read(b)) > 0; ) sb.append(new String(b, 0, n, "UTF-8"));
        in.close();
        return sb.toString();
    }

    private static void deleteTree(File f) {
        if (!f.exists()) return;
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteTree(k);
        //noinspection ResultOfMethodCallIgnored
        f.delete();
    }

    private AssetInstaller() {}
}
