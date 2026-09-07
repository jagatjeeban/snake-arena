# Project Environment

Inspected 2026-09-07 with Argent's environment inspector.

```json
{
  "is_react_native": true,
  "is_expo": true,
  "is_native_ios": false,
  "is_native_android": false,
  "expo_sdk": 57,
  "react_native": "0.86.3",
  "reanimated": "4.5.1",
  "worklets": "0.10.1",
  "package_manager": "bun",
  "platform_support": ["ios", "android", "web"],
  "app_id": "com.jagatjeeban.snakearena",
  "url_scheme": "snakearena",
  "node_modules_present": true,
  "native_directories": {"ios": true, "ios_pods": true, "android": false},
  "native_strategy": "CNG; native directories are gitignored",
  "metro": {"port": 8081, "existing_workspace_server": true},
  "commands": {
    "start": "bun run start",
    "ios": "bunx expo run:ios --device <udid>",
    "android": "bunx expo run:android --device <serial>",
    "lint": "bunx expo lint",
    "typecheck": "bunx tsc --noEmit",
    "test": "bun run test"
  },
  "existing_build": "Debug-iphoneos/snakearena.app in Xcode DerivedData",
  "android_avds": ["Resizable_Experimental_API_34"]
}
```

User requested validation on the connected iPhone 16 using Argent. Hardware is app-scoped; launch `com.jagatjeeban.snakearena` before interaction. Argent's physical iPhone backend does not support debugger/profiler tools or screen recording. Existing Metro was user-started; leave it running.
