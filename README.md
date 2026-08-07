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
- Both guest and email login work out of the box.

## Email authentication

Email sign-up/sign-in is wired to the `taksim-app-bca6e` Firebase project, with its
**Web** app config committed in `src/services/firebase.ts`. Those values are not
secrets — a Firebase web API key is meant to ship inside client bundles, and access is
governed by security rules and by which providers are enabled in the console.

To point the app at a different Firebase project:

1. Create a free project at the [Firebase console](https://console.firebase.google.com).
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Project settings → General → Your apps**, add a **Web** app (the `</>` icon —
   *not* Android, which yields a `google-services.json` this JS-SDK setup cannot use).
4. Replace the `firebaseConfig` object in `src/services/firebase.ts` with its values.

If the config is ever stripped, `isFirebaseConfigured` turns off the email paths and the
app tells the user to continue as a guest instead, so it stays usable either way.

Firebase Analytics is deliberately not installed — `docs/privacy.html` states that the
app runs no analytics.

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
