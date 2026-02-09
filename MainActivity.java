package com.paixaoflix.app;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.webkit.JavascriptInterface;

public class MainActivity extends Activity {
    private WebView myWebView;
    private View mCustomView;
    private WebChromeClient.CustomViewCallback mCustomViewCallback;
    private FrameLayout fullscreenContainer;
    
    // URL final do PaixãoFlix
    private static final String PAIXAOFLIX_URL = "https://visorfinances.github.io/lista-paixaoflix/";

    public class WebAppInterface {
        Activity mActivity;
        WebAppInterface(Activity activity) { 
            mActivity = activity; 
        }
        
        @JavascriptInterface
        public void lockOrientation() {
            mActivity.runOnUiThread(() -> {
                mActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
                System.out.println("📱 Orientação bloqueada em paisagem (Android)");
            });
        }

        @JavascriptInterface
        public void setPlayerActive(boolean active) {
            mActivity.runOnUiThread(() -> {
                if (active) {
                    mActivity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    System.out.println("🎬 Player ativo - tela permanecerá ligada");
                } else {
                    mActivity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    System.out.println("⏹️ Player inativo - tela pode desligar");
                }
            });
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Fullscreen imersivo
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, 
                          WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_main);

        myWebView = findViewById(R.id.webview);
        WebSettings settings = myWebView.getSettings();
        
        // Ativar recursos modernos e performance
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW); // Importante para Archive.org
        
        // Otimização para Smart TV / GPU
        myWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        settings.setUserAgentString(settings.getUserAgentString().replace("Version/", "PaixaoFlixTV/"));

        myWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false; // Permite que tudo carregue dentro do WebView
            }
        });

        myWebView.setWebChromeClient(new WebChromeClient() {
            // ESSENCIAL PARA O PLAYER FICAR EM TELA CHEIA
            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (mCustomView != null) {
                    onHideCustomView();
                    return;
                }
                mCustomView = view;
                mCustomViewCallback = callback;
                ((ViewGroup) getWindow().getDecorView()).addView(mCustomView, new FrameLayout.LayoutParams(-1, -1));
                myWebView.setVisibility(View.GONE);
                System.out.println("🎬 Player em modo fullscreen");
            }

            @Override
            public void onHideCustomView() {
                ((ViewGroup) getWindow().getDecorView()).removeView(mCustomView);
                mCustomView = null;
                mCustomViewCallback.onCustomViewHidden();
                myWebView.setVisibility(View.VISIBLE);
                System.out.println("📱 Saindo do modo fullscreen");
            }
        });

        myWebView.loadUrl(PAIXAOFLIX_URL);
    }

    // Gerenciamento de memória
    @Override
    protected void onPause() {
        super.onPause();
        if (myWebView != null) {
            myWebView.onPause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (myWebView != null) {
            myWebView.onResume();
        }
    }
    
    @Override
    protected void onDestroy() {
        // Limpar recursos para evitar memory leaks
        if (myWebView != null) {
            myWebView.stopLoading();
            myWebView.loadUrl("about:blank");
            myWebView.onPause();
            myWebView.removeAllViews();
            myWebView.destroyDrawingCache();
            myWebView.destroy();
            System.out.println("🧹 WebView limpo da memória");
        }
        super.onDestroy();
    }
}
