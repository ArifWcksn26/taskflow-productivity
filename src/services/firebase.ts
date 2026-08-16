import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';

// Default or Environment Configuration
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoTaskFlowApiKeyForLocalCloudTesting12345',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'taskflow-app.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'taskflow-app',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'taskflow-app.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: env.VITE_FIREBASE_APP_ID || '1:123456789012:web:demo1234567890',
};

let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (err) {
  console.warn('Firebase SDK Local Fallback Mode Enabled:', err);
}

// Safe wrapper for onAuthStateChanged to prevent app crashes if Firebase is unconfigured
const safeOnAuthStateChanged = (authInstance: any, callback: (user: any) => void) => {
  if (!authInstance) {
    callback(null);
    return () => {};
  }
  try {
    return onAuthStateChanged(authInstance, callback);
  } catch (err) {
    console.warn('Firebase Auth state listener error:', err);
    callback(null);
    return () => {};
  }
};

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  safeOnAuthStateChanged as onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
};

export type { User };
