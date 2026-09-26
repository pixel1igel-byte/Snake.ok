# Snake Online — Android APK project

## Android
The Snake game is packaged as a standalone Android WebView app.

## Multiplayer server
The Android client uses a public WebSocket server configured through:
https://raw.githubusercontent.com/pixel1igel-byte/Snake.ok/main/server-config.json

The server implementation is in `SnakeAndroid/server`.

## Build
GitHub Actions builds a debug APK automatically when `SnakeAndroid/**` changes. The workflow uses Java 17, Android SDK 35 and Gradle 8.10.
