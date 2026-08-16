import type { User } from 'firebase/auth';

const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoTaskFlowApiKeyForLocalCloudTesting12345',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'taskflow-app.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'taskflow-app',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'taskflow-app.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: env.VITE_FIREBASE_APP_ID || '1:123456789012:web:demo1234567890',
};

let firebaseServicesPromise: Promise<{
  app: any;
  auth: any;
  db: any;
  googleProvider: any;
  authMod: any;
  dbMod: any;
} | null> | null = null;

export async function getFirebaseServices() {
  if (!firebaseServicesPromise) {
    firebaseServicesPromise = (async () => {
      try {
        const [appMod, authMod, dbMod] = await Promise.all([
          import('firebase/app'),
          import('firebase/auth'),
          import('firebase/firestore'),
        ]);
        const app = appMod.getApps().length > 0 ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
        const auth = authMod.getAuth(app);
        const db = dbMod.getFirestore(app);
        const googleProvider = new authMod.GoogleAuthProvider();
        return { app, auth, db, googleProvider, authMod, dbMod };
      } catch (err) {
        console.warn('Firebase SDK Dynamic Load Fallback:', err);
        return null;
      }
    })();
  }
  return firebaseServicesPromise;
}

export const ensureFirebaseInit = async () => {
  return await getFirebaseServices();
};

export async function doSignInWithPopup() {
  const s = await getFirebaseServices();
  if (s && s.auth && s.googleProvider) {
    return s.authMod.signInWithPopup(s.auth, s.googleProvider);
  }
  throw new Error('Firebase Auth unavailable');
}

export async function doSignInWithEmailAndPassword(email: string, pass: string) {
  const s = await getFirebaseServices();
  if (s && s.auth) {
    return s.authMod.signInWithEmailAndPassword(s.auth, email, pass);
  }
  throw new Error('Firebase Auth unavailable');
}

export async function doCreateUserWithEmailAndPassword(email: string, pass: string) {
  const s = await getFirebaseServices();
  if (s && s.auth) {
    return s.authMod.createUserWithEmailAndPassword(s.auth, email, pass);
  }
  throw new Error('Firebase Auth unavailable');
}

export async function doSignOut() {
  const s = await getFirebaseServices();
  if (s && s.auth) {
    return s.authMod.signOut(s.auth);
  }
}

export async function listenAuthState(callback: (user: any) => void) {
  const s = await getFirebaseServices();
  if (s && s.auth) {
    return s.authMod.onAuthStateChanged(s.auth, callback);
  }
  callback(null);
  return () => {};
}

// Firestore Wrappers
export async function saveCloudUserDoc(uid: string, data: any) {
  const s = await getFirebaseServices();
  if (s && s.db) {
    const userRef = s.dbMod.doc(s.db, 'users', uid);
    await s.dbMod.setDoc(userRef, { ...data, lastSyncedAt: new Date().toISOString() }, { merge: true });
    return true;
  }
  return false;
}

export async function fetchCloudUserDoc(uid: string) {
  const s = await getFirebaseServices();
  if (s && s.db) {
    const userRef = s.dbMod.doc(s.db, 'users', uid);
    const snap = await s.dbMod.getDoc(userRef);
    return snap.exists() ? snap.data() : null;
  }
  return null;
}

export type { User };
