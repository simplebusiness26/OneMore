# ONE MORE SECOND

The first spin-off in the **ONE MORE** arcade identity.

## Core loop

Every round gives the player one second to solve a tiny challenge. Succeed and the score increases by one second. Fail or react too slowly and the run ends immediately with **ONE MORE?**.

## Included challenges

- Safe tile
- Direction reaction
- Exact tap count
- Colour match
- Memory flash
- Stop-the-marker timing

Challenge types unlock as the run grows, keeping the first few seconds readable and introducing harder mental switches later.

## Features

- Mobile-first portrait UI
- 1-second challenge timer
- Local high score
- Haptic feedback where supported
- Automatic pause when the app is backgrounded
- Offline PWA support
- Android WebView wrapper
- No ads, tracking, account, API key, or backend required
- GitHub Actions APK build

## Run the web game

Serve `web/` with any static HTTP server. The service worker is intentionally skipped for `file://` previews.

## Build Android locally

The Android project uses Gradle 8.9 / Android Gradle Plugin 8.7 and API 35.

```sh
cd android
gradle assembleDebug
```

The Gradle build syncs the `web/` files into Android assets automatically before compiling.
