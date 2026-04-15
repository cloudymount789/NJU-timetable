# NJU-timetable

Monorepo architecture (phase A):

- `app/mobile`: React Native + Expo + TypeScript application
- `packages/contracts`: shared entities and DTO contracts
- `packages/domain`: pure business rules and use-cases
- `services/bff`: optional backend-for-frontend contract scaffold

Design and requirement sources:

- `UI/nju-timetable.pen` (visual tokens & layout reference)
- `docs/requirements document.md`
- `docs/frontend-functional-spec.md`
- `docs/monorepo-architecture-blueprint.md`
- `notes/`

## Prerequisites

- Node.js (LTS)
- For device preview: [Expo Go](https://expo.dev/go) on your phone, **or** Android Studio / Xcode simulators

## Install

From the repository root:

```bash
npm install
```

## Preview the mobile app

From the repository root:

```bash
npm run dev:mobile
```

This runs `expo start` for the `@nju/mobile` workspace. Then:

- **Android emulator**: press `a` in the terminal, or run `npm run android --workspace @nju/mobile`
- **iOS simulator** (macOS): press `i`, or run `npm run ios --workspace @nju/mobile`
- **Physical device**: scan the QR code with Expo Go (Android) or the Camera app (iOS)
- **Web** (limited; SQLite persistence falls back to in-memory): run `npm run web --workspace @nju/mobile`

The UI theme (colors, spacing, typography, tab bar, timetable grid) is aligned with `UI/nju-timetable.pen` via shared CSS-style variables and the week-timetable frame in that file.

## Quality checks

```bash
npm run typecheck
npm run test:domain
```
