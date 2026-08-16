import { saveCloudUserDoc, fetchCloudUserDoc, getFirebaseServices } from './firebase';

export class FirebaseSyncService {
  public static async saveUserDataToCloud(uid: string, data: { tasks: any[]; categories: any[]; habits: any[] }) {
    const success = await saveCloudUserDoc(uid, data);
    if (!success) {
      try {
        localStorage.setItem(`taskflow_cloud_data_${uid}`, JSON.stringify({ ...data, lastSyncedAt: new Date().toISOString() }));
      } catch {
        // ignore
      }
    }
    return true;
  }

  public static async fetchUserDataFromCloud(uid: string) {
    const cloudData = await fetchCloudUserDoc(uid);
    if (cloudData) return cloudData;
    try {
      const localData = localStorage.getItem(`taskflow_cloud_data_${uid}`);
      return localData ? JSON.parse(localData) : null;
    } catch {
      return null;
    }
  }

  public static async subscribeUserData(uid: string, callback: (data: any) => void) {
    const s = await getFirebaseServices();
    if (s && s.db) {
      try {
        const userRef = s.dbMod.doc(s.db, 'users', uid);
        return s.dbMod.onSnapshot(userRef, (docSnap: any) => {
          if (docSnap.exists()) {
            callback(docSnap.data());
          }
        });
      } catch {
        return () => { };
      }
    }
    return () => { };
  }
}
