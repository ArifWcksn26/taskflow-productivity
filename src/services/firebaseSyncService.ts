import { ensureFirebaseInit, doc, getDoc, setDoc, onSnapshot } from './firebase';

export class FirebaseSyncService {
  public static async saveUserDataToCloud(uid: string, data: { tasks: any[]; categories: any[]; habits: any[] }) {
    const { db } = ensureFirebaseInit();
    if (!db) {
      // Local fallback simulation
      try {
        localStorage.setItem(`taskflow_cloud_data_${uid}`, JSON.stringify({ ...data, lastSyncedAt: new Date().toISOString() }));
      } catch {
        // ignore
      }
      return true;
    }
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(
        userRef,
        {
          ...data,
          lastSyncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.warn('Firebase Cloud save note:', e);
      return false;
    }
  }

  public static async fetchUserDataFromCloud(uid: string) {
    const { db } = ensureFirebaseInit();
    if (!db) {
      try {
        const localData = localStorage.getItem(`taskflow_cloud_data_${uid}`);
        return localData ? JSON.parse(localData) : null;
      } catch {
        return null;
      }
    }
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.warn('Firebase Cloud fetch note:', e);
      return null;
    }
  }

  public static subscribeUserData(uid: string, callback: (data: any) => void) {
    const { db } = ensureFirebaseInit();
    if (!db) return () => {};
    try {
      const userRef = doc(db, 'users', uid);
      return onSnapshot(userRef, (docSnap: any) => {
        if (docSnap.exists()) {
          callback(docSnap.data());
        }
      });
    } catch (e) {
      console.warn('Firebase Subscription note:', e);
      return () => {};
    }
  }
}
