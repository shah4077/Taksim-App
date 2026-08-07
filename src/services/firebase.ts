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
 * These values are placeholders. Create a free Firebase project at
 * https://console.firebase.google.com, enable Authentication ->
 * Sign-in method -> Email/Password and Anonymous, then replace the values
 * below (or supply them via app.config.js/env vars) with your project's
 * config. See README.md for full setup steps.
 */
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY';

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
