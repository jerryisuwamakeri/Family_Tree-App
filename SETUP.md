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

3. Start the Metro JS bundler:
   ```
   npm start
   ```

4. In a second terminal, build and launch the app:
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

## Server URL

If you change your backend URL, edit this one line:

  src/api/client.js  →  export const BASE_URL = 'https://your-server.com';
