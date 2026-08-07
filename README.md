# Taksim

Split bills, fairly and simply — for family gatherings and for friends. Bilingual (English/Arabic, with RTL support).

See [PRD.md](./PRD.md) for the full product requirements.

## Tech stack

- **React Native + Expo** (managed workflow, TypeScript)
- **React Navigation** (native-stack)
- **Zustand** + AsyncStorage for local, offline-first state
- **Firebase Authentication** (Email/Password + the basis for future account features) — **Guest login works out of the box with no setup**, it never touches Firebase
- **i18n-js** + **expo-localization** for English/Arabic, with RTL layout mirroring

## Getting started

```bash
npm install
npx expo start
```

- Press `a` to open on a connected Android device/emulator (or scan the QR code with **Expo Go**).
- Guest login works immediately. Email login requires Firebase setup (below).

## Configuring email authentication (optional)

Guest login requires zero configuration. To enable **email sign-up/sign-in**:

1. Create a free project at the [Firebase console](https://console.firebase.google.com).
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Project settings → General**, add a Web app and copy its config values.
4. Paste them into `src/services/firebase.ts`, replacing the `YOUR_...` placeholders.

Until this is done, tapping "Sign In"/"Create Account" shows a friendly message directing the user to continue as a guest instead — the app is fully usable without it.

## Project structure

```
App.tsx                     # App shell: hydration, language/RTL bootstrap, navigation
src/
  i18n/                      # English + Arabic strings, RTL helpers
  navigation/                # React Navigation stack + route types
  screens/                   # Login, Home, Settings, Family Gathering, Friends
  state/                     # Zustand stores (session, families, friends/expenses)
  services/                  # Firebase app/auth wiring
  components/                # Shared UI (Button, TextField, Card, FormSheet, ShareButtons...)
  utils/                     # Debt-simplification settlement algorithm, currency formatting
```

## Core features

- **Family Gathering**: add up to 10 families (name, total contribution, eligible members), then "Calculate Each Share" to see each family's fair share, credit/debit balance, and a minimal settlement plan (who pays whom).
- **Friends**: add participants, log expenses (equal or custom split), and view net balances with a simplified settlement plan.
- Both result screens can **share the calculation via WhatsApp or Gmail** (falls back to the system mail app if Gmail isn't installed).

## Building for the Google Play Store

This project uses [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production
```

Then submit the generated `.aab` via the [Play Console](https://play.google.com/console).

## iOS (planned next)

The codebase is platform-agnostic (no Android-only native modules), so iOS needs no rewrite:

```bash
eas build --platform ios --profile production
```

This requires an Apple Developer account and provisioning, configured via `eas build:configure`.

## Known limitations (v1)

- Guest data is local to the device; it does not migrate if the user later signs in with email.
- No real payment/money-transfer integration — the app calculates and displays who owes whom, it doesn't move funds.
- Single currency per session (selectable in Settings); no currency conversion.
