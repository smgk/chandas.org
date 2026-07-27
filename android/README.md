# Chandas Android

The Android application is a secure WebView wrapper around the same local
assets used by `chandas.org`.

- Minimum Android version: Android 7.0 (API 24)
- Target SDK: Android 16 (API 36)
- Core editing and analysis require no network permission.
- The Gradle build copies the root web assets into the application bundle.
- Sharing uses the Android system share sheet.

Build a debug APK:

```sh
./gradlew :app:assembleDebug
```

Build a release Android App Bundle:

```sh
./gradlew :app:bundleRelease
```

The release bundle must be signed through Play App Signing or a protected
release keystore before production publication.
