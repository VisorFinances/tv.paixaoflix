## 📱 Guia de Build do APK PaixãoFlix Pro Max

## 🚀 Configurações Rápidas

### 1. Android Studio Setup
```bash
# Criar novo projeto Android Studio
# File → New → New Project → Empty Activity
# Package Name: com.paixaoflix.app
# Language: Java
# Minimum SDK: API 21 (Android 5.0)
```

### 2. Estrutura de Arquivos
```
app/
├── src/main/
│   ├── java/com/paixaoflix/app/
│   │   ├── MainActivity.java          # ✅ Já configurado com orientação
│   │   └── WebViewActivity.java    # Opcional
│   ├── res/
│   │   ├── layout/
│   │   │   └── activity_main.xml
│   │   ├── values/
│   │   │   ├── strings.xml
│   │   │   └── styles.xml
│   │   └── mipmap/
│   │       └── ic_launcher.png
│   └── assets/
│       └── www/                    # Copiar arquivos web aqui
│           ├── index.html
│           ├── style.css
│           ├── paixaoflix.js
│           └── performance-optimizations.js
├── AndroidManifest.xml              # ✅ Já configurado
└── build.gradle                    # Configurar abaixo
```

### 3. Orientação de Tela Automática

#### MainActivity.java - Comandos Essenciais
```java
// Comando para forçar modo paisagem ao abrir o player
setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);

// Comando para voltar ao modo retrato (em pé) ao fechar o player
setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

// Interface JavaScript para comunicação bidirecional
public class WebAppInterface {
    @JavascriptInterface
    public void lockOrientation() {
        mActivity.runOnUiThread(() -> {
            mActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        });
    }
    
    @JavascriptInterface
    public void unlockOrientation() {
        mActivity.runOnUiThread(() -> {
            mActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        });
    }
}
```

#### JavaScript - Screen Orientation API
```javascript
// Bloquear orientação em paisagem
await screen.orientation.lock('landscape');

// Desbloquear orientação
screen.orientation.unlock();

// Fallback para Android WebView
if (window.Android && window.Android.lockOrientation) {
    window.Android.lockOrientation();
}
```

### 4. Botão de Orientação no Player
```html
<!-- Botão adicionado automaticamente -->
<button class="orientation-btn" id="orientation-btn" title="Girar Tela">
    <i class="fas fa-mobile-alt"></i>
</button>
```

```css
.orientation-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: var(--text-primary);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
}

.orientation-btn.locked {
    background: var(--accent-yellow);
    border-color: var(--accent-yellow);
    color: var(--bg-primary);
}
```

### 3. build.gradle (app level)
```gradle
android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"
    
    defaultConfig {
        applicationId "com.paixaoflix.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
        
        // Otimizações para streaming
        multiDexEnabled true
        ndk {
            abiFilters 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            shrinkResources true
        }
        debug {
            debuggable true
            minifyEnabled false
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    
    // Dependências essenciais
    dependencies {
        implementation 'androidx.appcompat:appcompat:1.6.1'
        implementation 'androidx.webkit:webkit:1.6.1'
        implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
        implementation 'com.google.android.material:material:1.8.0'
    }
}
```

### 4. activity_main.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#000000">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_centerInParent="true" />

</RelativeLayout>
```

### 5. strings.xml
```xml
<resources>
    <string name="app_name">PaixãoFlix Pro Max</string>
    <string name="error_network">Sem conexão com a internet</string>
    <string name="error_server">Servidor indisponível</string>
    <string name="loading">Carregando...</string>
</resources>
```

### 6. styles.xml
```xml
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowBackground">@android:color/black</item>
    </style>
</resources>
```

## 🔨 Comandos de Build

### Build Debug
```bash
./gradlew assembleDebug
```

### Build Release
```bash
./gradlew assembleRelease
```

### Gerar APK Assinado
```bash
# 1. Gerar keystore (primeira vez)
keytool -genkey -v -keystore paixaoflix-release.keystore -alias paixaoflix -keyalg RSA -keysize 2048 -validity 10000

# 2. Assinar APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore paixaoflix-release.keystore app-release-unsigned.apk paixaoflix-release.apk
```

## ⚡ Otimizações de Performance

### 1. ProGuard (proguard-rules.pro)
```
# Manter classes essenciais do WebView
-keep public class android.webkit.** { *; }
-keep public class android.webkit.WebViewClient { *; }
-keep public class android.webkit.WebChromeClient { *; }

# Manter classes do app
-keep class com.paixaoflix.app.** { *; }

# Otimizar para streaming
-optimizations !code/simplification/arithmetic
-optimizations !code/simplification/cast
```

### 2. Gradle Properties (gradle.properties)
```
# Otimizações de build
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.configureondemand=true

# Otimizações Android
android.useAndroidX=true
android.enableJetifier=true
```

## 📱 Testes em Dispositivos

### 1. Emulador Android TV
```bash
# Criar AVD para Android TV
avdmanager create avd -n "PaixaoFlix-TV" -k "system-images;android-33;google_apis;x86_64" -d "tv"

# Iniciar emulador
emulator -avd "PaixaoFlix-TV" -skin 1080x1920
```

### 2. Dispositivos Reais
- ✅ **Mi Box S/Pro** - Testar controle remoto
- ✅ **Fire TV Stick** - Testar Alexa integration
- ✅ **Smart TVs TCL/Philco** - Testar navegação por setas
- ✅ **Android Boxes genéricos** - Testar performance

## 🐛 Debug Comum

### Problema: Tela preta ao abrir vídeos
```java
// Adicionar no MainActivity.java
settings.setDomStorageEnabled(true);
settings.setMediaPlaybackRequiresUserGesture(false);
settings.setAllowFileAccess(true);
```

### Problema: App fecha sozinho (Memory Leak)
```java
// Adicionar no onDestroy()
@Override
protected void onDestroy() {
    if (myWebView != null) {
        myWebView.stopLoading();
        myWebView.loadUrl("about:blank");
        myWebView.onPause();
        myWebView.removeAllViews();
        myWebView.destroyDrawingCache();
        myWebView.destroy();
        myWebView = null;
    }
    super.onDestroy();
}
```

### Problema: Controle remoto não funciona
```xml
<!-- Adicionar no AndroidManifest.xml -->
<uses-feature android:name="android.hardware.touchscreen" android:required="false" />
<uses-feature android:name="android.hardware.gamepad" android:required="false" />
```

## 📦 Publicação na Play Store

### 1. Preparar Release
```bash
# 1. Limpar projeto
./gradlew clean

# 2. Gerar release build
./gradlew assembleRelease

# 3. Otimizar APK
zipalign -v 4 app-release-unsigned.apk app-release-aligned.apk

# 4. Assinar
apksigner sign --ks paixaoflix-release.keystore --out app-release.apk app-release-aligned.apk
```

### 2. Upload para Play Console
1. Acessar [Play Console](https://play.google.com/console)
2. Criar novo app
3. Fazer upload do APK assinado
4. Preencher descrição:
   - **Nome**: PaixãoFlix Pro Max
   - **Categoria**: Entretenimento
   - **Conteúdo**: +12 (violência, linguagem)
   - **Dispositivos**: Android TV, Smartphone, Tablet

## 🚀 Performance Tips

### 1. Reduzir Tamanho do APK
```gradle
android {
    buildTypes {
        release {
            shrinkResources true
            minifyEnabled true
            crunchPngs true
        }
    }
}
```

### 2. Otimizar Imagens
```bash
# Otimizar recursos
./gradlew optimizeReleaseResources
```

### 3. Configurar_ABI_Filters
```gradle
defaultConfig {
    ndk {
        abiFilters 'armeabi-v7a', 'arm64-v8a'
    }
}
```

## 📋 Checklist Final

- [ ] MainActivity.java configurado com otimizações
- [ ] AndroidManifest.xml com permissões corretas
- [ ] build.gradle com dependências mínimas
- [ ] Arquivos web copiados para assets/www/
- [ ] APK assinado com keystore válido
- [ ] Testado em emulador Android TV
- [ ] Testado em dispositivo real
- [ ] Performance otimizada (ProGuard ativo)
- [ ] Tamanho do APK < 50MB
- [ ] Controle remoto funcionando
- [ ] Streaming de vídeo funcionando

---

## 🎯 Resultado Esperado

APK profissional com:
- ✅ Streaming 4K/HD otimizado
- ✅ Controle remoto 100% funcional
- ✅ Navegação Smart TV fluida
- ✅ Cache inteligente para offline
- ✅ Performance nível Netflix/Prime Video
- ✅ Interface imersiva fullscreen
- ✅ Suporte a todos os dispositivos Android

O PaixãoFlix Pro Max estará pronto para publicação na Play Store! 🚀
