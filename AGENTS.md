# Snake Arena Agent Guide

## Expo SDK Requirement

- This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.
- Expo APIs change between SDK releases. Before writing code that touches Expo, EAS, or React Native APIs, read the `expo` version in `package.json` and consult the matching versioned documentation: currently https://docs.expo.dev/versions/v57.0.0/.
- For other Expo topics, fetch https://docs.expo.dev/llms.txt and follow its links to the relevant documentation. Do not rely on remembered APIs from earlier SDKs.
- Always use `bunx expo install <package>` for Expo and React Native dependencies so compatible versions are selected. Check available skills before adding dependencies and prefer recommended Expo modules.

## Project Overview

This repository is a Snake game named `snake-arena`.

- Expo: `~57.0.20`
- React Native: `0.86.3`
- React: `19.2.3`
- TypeScript: `~6.0.3`, with strict checking
- Package manager: Bun, with `bun.lock`
- App entry: `expo-router/entry`
- Navigation: Expo Router with typed routes
- Animation and gestures: React Native Reanimated, Worklets, and Gesture Handler
- Game state: a worklet-compatible engine coordinated by shared values, React hooks, and session events
- React Compiler: enabled in `app.json`
- Platforms: iOS, Android, and web; portrait orientation with static web output

Treat `package.json` and application configuration as the source of truth when these values change.

## Architecture

These descriptions define folder responsibilities, not a fixed inventory of files. Add or reorganize modules as the app evolves, keeping them within the appropriate responsibility. Inspect the current folder contents before reusing or importing a module; examples in this guide are not guaranteed filenames. Routine file additions do not require updating this guide unless they change an architectural responsibility or workflow.

- `src/app`: Expo Router routes and layouts, including the main screen, playground, and root layout. Keep non-route code outside this directory. Use Expo Router for navigation and follow its file-based routing conventions.
- `src/components`: Reusable UI primitives and application presentation components. Add components here as presentation needs grow, keeping gameplay rules in the engine.
- `src/hooks`: React hooks for reusable behavior, lifecycle coordination, and UI orchestration, such as game sessions, board measurement, and responsive layout. Add focused hooks as new behavior is introduced.
- `src/features/game/engine`: Game transitions, movement snapshots, food placement, renderer coordination, and session-event guards. Keep gameplay rules in the engine rather than duplicating them in UI components.
- `src/features/game/config`: Difficulty, controls, initial state, and board geometry configuration.
- `src/constants`: Shared colors, font sizes, font weights, strings, and barrel exports.
- `src/themes`: Shared theme definitions and reusable styling conventions, including typography and future theme variants. Reuse shared constants rather than duplicating design values.
- `src/utils`: Focused, reusable utility functions and data transformations for gameplay or other application needs. Keep React lifecycle behavior in hooks and avoid introducing competing implementations of engine rules.
- `src/types`: Shared component and game types, including engine, geometry, difficulty, and session types.
- `assets`: Images, fonts, animation assets, and Expo icon assets.
- `ios` and `android`: Git-ignored generated native projects. Configure native behavior through Expo configuration and supported config plugins.

## Commands

- `bun install`: Install dependencies using `bun.lock`.
- `bun run start`: Start the Expo development server.
- `bun run android`: Generate native files when necessary, build, and run Android locally.
- `bun run ios`: Generate native files when necessary, build, and run iOS locally.
- `bun run web`: Start the web app.
- `bun run lint`: Run Expo ESLint.
- `bunx tsc --noEmit`: Run TypeScript validation without emitting files.
- `bun run test`: Bundle the engine tests into `.test-build` with Bun, then execute them with `node --test`. Use this script rather than substituting `bun test`.
- `bunx expo-doctor`: Diagnose dependency and configuration issues.
- `bunx expo install --fix`: Repair SDK dependency compatibility when required by the task.
- `bunx eas-cli build --profile development --platform ios`: Build the configured iOS simulator development client in EAS. Use `--platform android` for Android.
- `bunx eas-cli build --profile preview --platform <ios|android>`: Build for internal distribution.
- `bunx eas-cli build --profile production --platform <ios|android>`: Build for store distribution.
- `bunx eas-cli submit --profile production --platform <ios|android>`: Submit a release when requested.

There are no configured formatting scripts. The `reset-project` script references a missing `scripts/reset-project.js`; do not use it as a supported workflow.

## Clean Code Requirements

- Match existing TypeScript, Expo, and React Native patterns. Keep changes focused and avoid unrelated refactors.
- Preserve user changes. Do not rewrite, revert, or reformat unrelated files.
- Keep every code file at or below 1,000 lines.
- Avoid duplicated logic; extract shared behavior into an appropriate abstraction.
- Reuse existing constants, configuration, helpers, themes, components, hooks, and types before adding new ones.
- Avoid hardcoded colors, gameplay tuning values, repeated strings, and secrets when shared values apply.
- Keep route screens focused on orchestration and composition, with game rules in the engine and lifecycle coordination in hooks.
- Keep platform-specific behavior explicit and preserve behavior on unaffected platforms.
- Keep external API payload keys unchanged unless an explicit application-model boundary requires transformation.

## Game Engine And Performance

- Preserve worklet compatibility for engine functions invoked on the UI thread, including required `"worklet"` directives. Do not introduce React hooks, device APIs, or other JS-only dependencies into these functions.
- Preserve deterministic transitions and seeded food selection. Keep time and randomness explicit so engine behavior remains reproducible in tests.
- Keep frame-by-frame movement in the existing shared-value and worklet pipeline. Avoid React state updates or JS-thread crossings on every animation frame.
- Preserve renderer-capacity coordination, movement snapshots, and arrival-time commits for food, score, and snake growth.
- Keep board geometry and difficulty rules in their shared configuration modules.
- Preserve pause/resume behavior across app backgrounding, route focus changes, and layout changes without replaying accumulated background time.
- Retain session identity checks and single-delivery completion guards. Ignore stale callbacks after restart or unmount.
- Validate changes to direction queuing, collision handling, terminal animation, and full-board behavior against existing regression tests.

## Comments And File Organization

- Add comments for functions: concise `//` comments for local helpers and JSDoc for custom, exported, or reusable functions.
- Follow `src/utils/get-tickms-decrement.ts` for JSDoc structure: use a multiline block with a purpose description, an `@param` entry describing each parameter, and an `@returns` entry describing the result. Document relevant units, defaults, nullable results, and side effects. For object or destructured parameters, document the object and its relevant properties using dot notation; a descriptive name such as `props` may represent an unnamed destructured argument. Do not repeat TypeScript types in JSDoc. Omit `@param` only for functions without parameters and `@returns` only for functions that return no value. Description-only JSDoc is insufficient for functions with inputs or a returned value.
- Group file internals with spacing and concise section comments where applicable: imports, constants, types, state, refs, hooks, handlers, effects, render helpers, styles, and exports.
- Keep groups readable and consistent with nearby files.
- File and folder names must describe their contents.

## Imports And Exports

- Group imports with blank lines and concise `//import ...` headers describing non-empty groups.
- Order package imports first: React, React Native, Expo, then other third-party packages. Follow with applicable constants/configuration, components, hooks, helpers/engine, assets, and types groups.
- Do not add empty group comments or groups for subsystems that do not exist.
- Use the `@/` alias for modules under `src` across feature or folder boundaries, and `@/assets/` for assets where appropriate.
- Use relative imports for closely related modules when consistent with the surrounding folder.
- Prefer existing barrel exports where applicable. Update them for new reusable modules when the folder already follows that pattern; avoid barrels for one-off modules.
- Use `import type` for type-only imports.

## Expo, Native, EAS, And Secrets Safety

- Prefer `app.json` and supported config plugins over direct native edits. Never create generated native projects by hand or commit them unless the task explicitly requires it.
- Expo Go only includes its bundled native modules. Adding other native code requires a development build.
- Use EAS for cloud builds, signing, submission, and requested OTA updates. Consult https://docs.expo.dev/eas/index.md and use `bunx eas-cli` for EAS commands.
- `eas.json` uses remote app-version management. The `development` profile is an internal development client with `ios.simulator: true`; it is not configured for a physical iPhone. The `preview` profile uses internal distribution, and `production` enables automatic version increments.
- Do not assume OTA updates are configured. Inspect the project and follow matching EAS Update documentation before setting them up.
- Preserve application identifiers, the `snakearena` URL scheme, EAS project ID, platform icons, and permission configuration unless the task explicitly changes them.
- Do not commit `.env` files, credentials, tokens, signing keys, provisioning profiles, keystores, Pods, Gradle caches, generated bundles, build outputs, or local machine configuration.

## Testing Expectations

- Run `bun run lint` and `bunx tsc --noEmit` before declaring a task done. Report blockers or existing findings separately from regressions; do not silently change unrelated code.
- Run `bun run test` when changing engine rules, game configuration, session behavior, or their types. Extend the existing test suite for meaningful behavior changes rather than adding another test framework.
- For gameplay changes, cover movement and direction input, food and growth, scoring and difficulty, wall/self collisions, full-board completion, pause/resume, restart, and stale-session handling as relevant.
- For visible UI, navigation, gestures, or lifecycle changes, validate the affected flow in an installed development build with Argent when available.
- Verify iOS and Android for shared platform changes and web when affected. Report platforms that could not be checked.
- Documentation-only changes do not require app runtime tests.
