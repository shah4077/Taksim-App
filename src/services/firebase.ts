import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
// @ts-expect-error - getReactNativePersistence ships in firebase's React Native
// build (resolved via Metro's "react-native" package export condition) but is
// missing from the default (web) firebase/auth type declarations that `tsc`
// resolves. It exists at runtime; this is a known upstream typing gap.
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Firebase web app config for the `taksim-app-bca6e` project. These values are
 * not secrets: the web API key is designed to ship inside client bundles and
 * be publicly readable. Access is controlled by Firebase security rules and by
 * which sign-in providers are enabled in the console, not by keeping the key
 * hidden. See README.md for the project setup steps.
 *
 * `measurementId` is intentionally omitted — it only applies to Firebase
 * Analytics, which this app does not use (see docs/privacy.html, which states
 * that Taksim runs no analytics).
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDKFS7m0syncQBaqH40phBQTQ8HjtRwArQ',
  authDomain: 'taksim-app-bca6e.firebaseapp.com',
  projectId: 'taksim-app-bca6e',
  storageBucket: 'taksim-app-bca6e.firebasestorage.app',
  messagingSenderId: '331143922750',
  appId: '1:331143922750:web:690ee8ef9076ece743fd6f',
};

/** Guards the email auth paths if the config above is ever stripped or reset to placeholders. */
export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('YOUR_');

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  auth =
    Platform.OS === 'web'
      ? getAuth(app)
      : initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
}

export { app, auth };
