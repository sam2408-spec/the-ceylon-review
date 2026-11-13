# 📱 The Ceylon Review: Android App Workspace Instructions

Your web application has been fully integrated with **Capacitor**, turning it into a native Android app! 

We have successfully:
1. Installed `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android` runtime libraries.
2. Formed standard `/public/manifest.json` Progressive Web App (PWA) identifiers.
3. Created `capacitor.config.json` establishing `com.ceylonreview.app` as the unique bundle identifier.
4. Generated a complete `/android` Gradle-based project directory right in your workspace.
5. Injected native mobile interaction CSS overrides (custom tap safe-areas, momentum scrolling, and selection overrides) into `index.css`.

---

## 🛠️ Local Developer Workflow

To open, test, edit, and compile the Android platform locally, follow this clean workflow on your machine:

### 1. Prerequisites (On your local computer)
Ensure you have the following installed:
* **Node.js** (v18 or higher)
* **Android Studio** (with the Android SDK, build tools, and an emulator configurator)

### 2. Download and Extract the Workspace
If you are exporting this project from Google AI Studio:
1. Open the settings menu in the AI Studio editor window.
2. Select **Export to ZIP** or link with a private **GitHub Repository**.
3. Extract the ZIP workspace on your computer.

### 3. Install NPM Dependencies Locally
Open your command terminal in the project directory, and restore packages:
```bash
npm install
```

### 4. Build and Synchronize System Code
Each time you make edits to your React elements or CSS templates, compile the bundle and sync the assets into the native Android folder by running:
```bash
# Compile bundle & push code into Android project assets
npm run build:android
```
This is a convenience script we added to `package.json` that runs `npm run build` and then `npx cap sync`.

---

## 🚀 Running & Testing on Android

### Method A: Via Android Studio (Recommended)
1. Launch **Android Studio**.
2. Select **Open an Existing Project** and choose the `android` folder located in this root directory.
3. Wait for the initial Gradle sync to finish successfully (the system pulls requirements automatically).
4. Connect a physical Android phone with **USB Debugging** enabled, or open a virtual Device Emulator (AVD).
5. Press the green **Run (Play)** button in Android Studio to install and launch the Ceylon Review immediately on your device!

### Method B: Live Reload Mode (Rapid Iterations)
You can test changes instantly on your device without rebuilding. Ensure your phone and development computer are on the same local Wi-Fi router:
1. Find your computer's local network IP address (e.g., `192.168.1.15`).
2. Run your Vite web server:
   ```bash
   npm run dev -- --host
   ```
3. Open `capacitor.config.json` and append a local server override:
   ```json
   {
     "appId": "com.ceylonreview.app",
     "appName": "The Ceylon Review",
     "webDir": "dist",
     "server": {
       "url": "http://192.168.1.15:3000",
       "cleartext": true
     }
   }
   ```
4. Synchronize config changes:
   ```bash
   npx cap copy
   ```
5. Press Play in Android Studio. Any code edits you save in your text editor will refresh instantly in the Android app! *(Remember to revert the `server` block before building final releases).*

---

## 📦 Producing Release Builds for App Stores

Once your layout is perfect, compile your packages inside **Android Studio**:

1. In Android Studio's top menu bar, go to:
   **Build** ➔ **Generate Signed Bundle / APK...**
2. Select **Android App Bundle (AAB)** (for direct Google Play Store uploads) or **APK** (for manually sharing installable files with friends).
3. Create or select your keystore signature configuration.
4. Choose **release** as the Build Variant.
5. Click **Finish**. Your optimized `.aab` or `.apk` bundle will be generated under `android/app/release/` and is ready for public distribution!
