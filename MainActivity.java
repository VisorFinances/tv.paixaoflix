package com.paixaoflix.app;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.widget.Toast;
import android.webkit.JavascriptInterface;

public class MainActivity extends Activity {
    private WebView myWebView;
    private static final String PAIXAOFLIX_URL = "https://seu-dominio.com/paixaoflix";
    private boolean isPlayerActive = false;
    
    // Interface JavaScript para comunicação com WebView
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
        public void unlockOrientation() {
            mActivity.runOnUiThread(() -> {
                mActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
                System.out.println("📱 Orientação desbloqueada (Android)");
            });
        }
        
        @JavascriptInterface
        public void setPlayerActive(boolean active) {
            isPlayerActive = active;
            mActivity.runOnUiThread(() -> {
                if (active) {
                    mActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
                } else {
                    mActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
                }
            });
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Remover barra de título para experiência imersiva
        this.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN, 
                                android.view.WindowManager.LayoutParams.FLAG_FULLSCREEN);

        setContentView(R.layout.activity_main);
        
        myWebView = (WebView) findViewById(R.id.webview);
        
        // Configurações otimizadas para streaming
        WebSettings settings = myWebView.getSettings();
        
        // Configurações essenciais
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAppCacheEnabled(true);
        
        // Performance e streaming - Modo Turbo
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        
        // Hardware acceleration nível GPU
        myWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        
        // Suporte a HLS e streaming
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // Otimizações para Smart TV
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        
        // Performance avançada
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        
        // Cache agressivo para streaming
        settings.setAppCacheMaxSize(1024 * 1024 * 50); // 50MB
        settings.setDatabasePath("/data/data/" + getPackageName() + "/cache/webview.db");
        
        // User agent otimizado para Smart TV
        String userAgent = settings.getUserAgentString();
        settings.setUserAgentString(userAgent.replace("Mobile", "SmartTV").replace("Android", "Android SmartTV"));
        
        // Prevenção de erros de mídia
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setNeedInitialFocus(false);
        
        // Adicionar interface JavaScript para comunicação bidirecional
        myWebView.addJavascriptInterface(new WebAppInterface(this), "Android");
        
        // WebViewClient para melhor performance
        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Limpar cache excessivo quando a página carregar
                if (url.contains("paixaoflix")) {
                    view.clearCache(false);
                }
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Tratamento de erro melhorado
                runOnUiThread(() -> {
                    String errorMsg = "Erro ao carregar conteúdo";
                    if (description.contains("net")) {
                        errorMsg = "Sem conexão com a internet";
                    } else if (description.contains("host")) {
                        errorMsg = "Servidor indisponível";
                    }
                    Toast.makeText(getApplicationContext(), 
                              errorMsg, 
                              Toast.LENGTH_LONG).show();
                });
            }
            
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl();
                
                // Permitir streaming de mídia
                if (url.contains(".m3u8") || url.contains(".mp4") || 
                    url.contains("archive.org") || url.contains("tmdb.org")) {
                    return false; // Deixa carregar normalmente
                }
                
                return super.shouldOverrideUrlLoading(view, request);
            }
        });
        
        // WebChromeClient para fullscreen e controles de mídia
        myWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                // Implementar barra de progresso se necessário
            }
        });
        
        // Carregar PaixãoFlix
        myWebView.loadUrl(PAIXAOFLIX_URL);
    }
    
    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
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
        }
        super.onDestroy();
    }
    
    @Override
    protected void onPause() {
        if (myWebView != null) {
            myWebView.onPause();
            myWebView.pauseTimers();
        }
        super.onPause();
    }
    
    @Override
    protected void onResume() {
        if (myWebView != null) {
            myWebView.onResume();
            myWebView.resumeTimers();
        }
        super.onResume();
    }
}
