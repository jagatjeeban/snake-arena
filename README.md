# Snake Arena

Snake Arena is a mobile-first Snake application built with Expo and React Native. This guide covers development setup, code organization, validation, and build configuration.

## Technology stack

| Technology | Configured version / role |
| --- | --- |
| Expo | `~57.0.20` (SDK 57) |
| React Native | `0.86.3` |
| React | `19.2.3`, with React Compiler enabled |
| TypeScript | `~6.0.3`, with strict checking |
| Expo Router | `~57.0.19`, file-based navigation with typed routes |
| Reanimated / Worklets | `4.5.1` / `0.10.1`, UI-thread movement and shared state |
| React Native Skia | `2.6.2`, native continuous snake renderer |
| Gesture Handler | `~2.32.0`, gesture input |
| Bun | Dependency management and scripts; lockfile: `bun.lock` |

[package.json](package.json) and [app.json](app.json) are the source of truth for versions and application configuration. The app targets iOS and Android in portrait orientation; a web development command and static web output are also configured. Web behavior must be validated separately.

## Getting started

### Prerequisites

- Bun installed and available in your shell.
- Node.js meeting the [Expo SDK 57 requirements](https://docs.expo.dev/versions/v57.0.0/) (minimum `22.13.x`).
- For local iOS builds: macOS, Xcode compatible with SDK 57, and an iOS Simulator runtime.
- For local Android builds: Android Studio, Android SDK, a compatible JDK, and an emulator or connected development device.

See Expo's [local development setup](https://docs.expo.dev/guides/local-app-development/) for native toolchain configuration.

### Install and run

From the repository root, install dependencies:

```bash
bun install
```

Build and launch the development client for your target platform:

```bash
# iOS
bun run ios

# Android
bun run android
```

These commands generate native projects when absent, compile and install the app, and start Metro. The project already includes `expo-dev-client`; use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) for this workflow.

For subsequent JavaScript or TypeScript changes, start Metro and open the installed development client:

```bash
bun run start
```

Native dependency or native configuration changes require regenerating the native projects as appropriate and rebuilding the development client. See the development-build guide linked above.

To start the configured web development server:

```bash
bun run web
```

## Commands and validation

| Command | Purpose |
| --- | --- |
| `bun run start` | Start the Expo development server |
| `bun run ios` | Build and run iOS locally |
| `bun run android` | Build and run Android locally |
| `bun run web` | Start web development |
| `bun run lint` | Run Expo ESLint |
| `bunx tsc --noEmit` | Validate TypeScript without emitting files |
| `bun run test` | Bundle pure geometry/session tests with Bun, then run Node's test runner |
| `bunx expo-doctor` | Diagnose dependency and configuration issues |

Geometry and renderer/session regression tests live in `tests/`; generated test bundles are ignored in `.test-build/`. These tests exercise deterministic movement, taper, turns, and engine integration without loading native Skia. They do not replace native visual or performance checks.

Run lint, TypeScript validation, and tests before completing rendering changes. Validate affected gameplay, UI, and lifecycle flows in development builds on the relevant platforms.

## Project structure

```text
src/
  app/                    Expo Router routes and root layout
  components/             Reusable UI and game presentation
  hooks/                  Session lifecycle, board measurement, responsive layout
  features/game/
    engine/               Transitions, movement snapshots, food placement, event guards
    config/               Difficulty, controls, initial state, board geometry
    rendering/            Pure snake trail geometry and native Skia path adapter
  constants/              Shared colors, strings, font sizes, and weights
  themes/                 Reusable styling conventions
  types/                  Shared UI, engine, geometry, and session types
  utils/                  Focused reusable helpers
assets/                   Images, fonts, animations, and icon assets
```

The entry point is `expo-router/entry`. `src/app/index.tsx` selects the session difficulty and navigates to `src/app/playground.tsx`, which composes the game and handles completion navigation. Keep non-route modules outside `src/app`.

### Engine and rendering

- `useSnakeGame` coordinates the engine, input, renderer capacity, and session lifecycle. `useGameBoard` owns board measurement; components render the resulting state.
- Reanimated's `useFrameCallback` advances movement on the UI thread. The engine prepares a destination, interpolates one shared movement snapshot, then commits at cell arrival. Snake growth, food relocation, and score changes use that same arrival boundary.
- Frame-by-frame movement stays in shared values and worklets. React receives session, score, and capacity updates without driving every animation frame. Renderer acknowledgements ensure web segment slots or native logical drawing capacity are ready before movement needs them.
- `snake.native.tsx` draws a continuous body, tapered tail, highlight, oval head, and eyes in one Skia canvas. It consumes the existing snapshot, preserves cell-center endpoints, and rounds only the rendered route. `snake.tsx` and `snake-segment.tsx` remain the web/default renderer; web does not load Skia or CanvasKit.
- Native UI checks should target `snake-canvas`; individual canvas shapes are not native views and do not expose the web renderer's `snake-head` selector. Controls and accessible score remain React components. Reduced motion disables the short head rotation; essential game movement still follows the engine.
- Explicit elapsed time and seeded food selection make engine transitions reproducible. Preserve worklet compatibility and keep React hooks and device APIs outside engine functions.
- Lifecycle handling coordinates app activity, route focus, and layout changes. Pause/resume resets frame timing so background time is not replayed. Session identity checks reject stale callbacks, and completion is delivered only once per mounted session.

Keep game rules in `features/game/engine`, tuning and geometry in `features/game/config`, and lifecycle orchestration in hooks.

After installing Skia, rebuild both native development clients. Bun trusts only Skia's required binary-install script via `trustedDependencies`; do not enable unrelated lifecycle scripts. For visual checks, cover tight turns in both directions, growth at a corner, adjacent body sections, a short tail, pause/resume, restart, and nearly full boards. Measure long-snake frame times on physical devices in release builds before making performance claims.

## Native and EAS builds

`ios/` and `android/` are generated native projects and are ignored by Git. Configure native behavior through `app.json` and supported Expo config plugins rather than relying on manual edits to generated files.

[eas.json](eas.json) defines these profiles:

| Profile | Configuration |
| --- | --- |
| `development` | Internal development client; iOS targets the simulator (`ios.simulator: true`), not a physical iPhone |
| `preview` | Internal distribution |
| `production` | Automatic app-version increments; production submission profile configured |

EAS uses remote app-version management and requires CLI version `>= 20.5.1`. The app is already linked to an EAS project in `app.json`. Cloud builds require an Expo account with access to that project and any necessary signing credentials.

Example development builds:

```bash
bunx eas-cli build --profile development --platform ios
bunx eas-cli build --profile development --platform android
```

Select `preview` or `production` for the corresponding distribution build. See the official [EAS Build documentation](https://docs.expo.dev/build/introduction/) for cloud build and signing setup.

## Development conventions

Read [AGENTS.md](AGENTS.md) for architecture, code style, engine invariants, and platform validation requirements.

- Use the `@/` alias for modules under `src` across folder boundaries and reuse existing constants, types, helpers, and components.
- Install Expo and React Native dependencies through Expo's compatibility-aware installer:

  ```bash
  bunx expo install <package>
  ```

- Consult the [SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/) before changing Expo APIs. Use the [Expo documentation index](https://docs.expo.dev/llms.txt) to locate other guides.
- Preserve application identifiers and native configuration unless explicitly changing them. Keep credentials, generated native projects, and build outputs out of commits.
