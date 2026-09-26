package com.thevoid.snake;

import android.app.Activity;
import android.os.Bundle;
import android.util.Base64;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;
import android.view.WindowManager;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.zip.GZIPInputStream;

public class MainActivity extends Activity {
    private static final String SERVER_BASE = "https://snake-online-server-pixel1igel.onrender.com/";

    private String loadGameHtml() throws Exception {
        InputStream in = getAssets().open("game.html.gz.b64");
        ByteArrayOutputStream raw = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) != -1) raw.write(buf, 0, n);
        in.close();

        byte[] compressed = Base64.decode(raw.toString("UTF-8"), Base64.DEFAULT);
        GZIPInputStream gz = new GZIPInputStream(new java.io.ByteArrayInputStream(compressed));
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        while ((n = gz.read(buf)) != -1) out.write(buf, 0, n);
        gz.close();
        return out.toString("UTF-8");
    }

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        WebView w = new WebView(this);
        w.setWebViewClient(new WebViewClient());
        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);

        try {
            w.loadDataWithBaseURL(SERVER_BASE, loadGameHtml(), "text/html", "UTF-8", null);
        } catch (Exception e) {
            w.loadData("<html><body style='background:#111;color:white;font-family:sans-serif'><h2>Ошибка загрузки игры</h2><pre>"
                    + e.getMessage() + "</pre></body></html>", "text/html", "UTF-8");
        }
        setContentView(w);
    }

    @Override public void onBackPressed() { }
}
