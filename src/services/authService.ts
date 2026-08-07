import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

export interface AppUser {
  uid: string;
  mode: 'guest' | 'email';
  email?: string;
}

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Guest sessions are fully local and never touch the network. */
export function createGuestUser(): AppUser {
  return { uid: `guest-${randomId()}`, mode: 'guest' };
}

export async function signUpWithEmail(email: string, password: string): Promise<AppUser> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return { uid: credential.user.uid, mode: 'email', email: credential.user.email ?? email };
}

export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return { uid: credential.user.uid, mode: 'email', email: credential.user.email ?? email };
}

/**
 * Emails a reset link for `email`. Firebase hosts the page where the new
 * password is actually chosen, so the app never handles the new password.
 *
 * Resolves even when no account exists for the address, so callers can show one
 * neutral confirmation either way — distinguishing the two would let anyone use
 * this screen to test which email addresses are registered. The project has
 * Firebase's email enumeration protection enabled, which already accepts
 * unknown addresses silently; the `auth/user-not-found` catch below keeps that
 * guarantee if the setting is ever turned off.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (e) {
    if ((e as { code?: string }).code !== 'auth/user-not-found') {
      throw e;
    }
  }
}

export async function signOutOfFirebase(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
