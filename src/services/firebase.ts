import type { User } from 'firebase/auth';

const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBdY8KSDDR0auDWcgveExMV2E5Jbfk8ZWA',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'taskflow-6abe3.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'taskflow-6abe3',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'taskflow-6abe3.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '198161797840',
  appId: env.VITE_FIREBASE_APP_ID || '1:198161797840:web:a8085b960485ede57a04d5',
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
    try {
      const userRef = s.dbMod.doc(s.db, 'users', uid);
      await s.dbMod.setDoc(userRef, { ...data, lastSyncedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveCloudUserDoc Error:', err);
      return false;
    }
  }
  return false;
}

export async function fetchCloudUserDoc(uid: string) {
  const s = await getFirebaseServices();
  if (s && s.db) {
    try {
      const userRef = s.dbMod.doc(s.db, 'users', uid);
      const snap = await s.dbMod.getDoc(userRef);
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.warn('Firestore fetchCloudUserDoc Error:', err);
      return null;
    }
  }
  return null;
}

export type { User };
