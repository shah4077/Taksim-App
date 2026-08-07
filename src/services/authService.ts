import {
  createUserWithEmailAndPassword,
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

export async function signOutOfFirebase(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
