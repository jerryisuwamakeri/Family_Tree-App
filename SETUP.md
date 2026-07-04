# Family Tree — Android App Setup

## What you need installed (one-time)

1. **Android Studio** → https://developer.android.com/studio
   - During install, also install: Android SDK, Android Emulator
   - After install, open SDK Manager and install: **Android SDK Platform 34**

2. **Java 17**
   - On Mac: `brew install openjdk@17`
   - On Windows: download from https://adoptium.net

3. **Set environment variables** (add to ~/.zshrc or ~/.bashrc):
   ```
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
   Then run: `source ~/.zshrc`

---

## Run the app (after setup above)

1. Open Android Studio → Virtual Device Manager → Start an emulator
   (or plug in an Android phone with USB Debugging enabled)

2. In your terminal, go into this folder:
   ```
   cd familytree-mobile
   ```

3. Install the JavaScript dependencies (required — `node_modules` is not in git).
   Run this once after cloning, and again whenever `package.json` changes:
   ```
   npm install
   ```

4. Start the Metro JS bundler:
   ```
   npm start
   ```

5. In a second terminal, build and launch the app:
   ```
   npm run android
   ```

The app will install and open on your emulator/phone automatically.

---

## Build a release APK (to share with others)

```
cd android
./gradlew assembleRelease
```

APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

Send this file to any Android phone and install it directly.

---

## Server URL (dev vs production)

Backend URLs live in **`src/config/env.js`**. The app picks automatically:

- **Development** (`npm run android` / Metro running): uses the `dev` URL.
  Default is `http://10.0.2.2:8000` — the Android emulator's alias for your
  computer's `localhost`. Testing on a **physical phone**? Change it to your
  machine's LAN IP, e.g. `http://192.168.1.20:8000`.
- **Production** (a release APK built with `gradlew assembleRelease`): uses the
  `prod` URL — `https://imammalikiabdullahifamilytree.com`.

Edit whichever URL you need in `src/config/env.js`. Nothing else references the
server URL directly.
