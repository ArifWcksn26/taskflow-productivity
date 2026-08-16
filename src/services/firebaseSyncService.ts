import { saveCloudUserDoc, fetchCloudUserDoc, getFirebaseServices } from './firebase';

export class FirebaseSyncService {
  public static async saveUserDataToCloud(uid: string, data: { tasks: any[]; categories: any[]; habits: any[]; members?: any[] }) {
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
        return () => {};
      }
    }
    return () => {};
  }

  // --- Real-Time Multi-User Workspace Sync ---

  public static async saveWorkspaceDataToCloud(workspaceId: string, data: { tasks: any[]; categories: any[]; members: any[] }) {
    const s = await getFirebaseServices();
    if (s && s.db) {
      try {
        const wsRef = s.dbMod.doc(s.db, 'workspaces', workspaceId);
        await s.dbMod.setDoc(
          wsRef,
          {
            ...data,
            lastUpdatedBy: new Date().toISOString(),
          },
          { merge: true }
        );
        return true;
      } catch (err) {
        console.warn('Workspace Cloud save note:', err);
      }
    }
    try {
      localStorage.setItem(`taskflow_ws_data_${workspaceId}`, JSON.stringify({ ...data, lastSyncedAt: new Date().toISOString() }));
    } catch {
      // ignore
    }
    return false;
  }

  public static async fetchWorkspaceDataFromCloud(workspaceId: string) {
    const s = await getFirebaseServices();
    if (s && s.db) {
      try {
        const wsRef = s.dbMod.doc(s.db, 'workspaces', workspaceId);
        const snap = await s.dbMod.getDoc(wsRef);
        if (snap.exists()) {
          return snap.data();
        }
      } catch (err) {
        console.warn('Workspace Cloud fetch note:', err);
      }
    }
    try {
      const localData = localStorage.getItem(`taskflow_ws_data_${workspaceId}`);
      return localData ? JSON.parse(localData) : null;
    } catch {
      return null;
    }
  }

  public static async joinWorkspaceWithGoogleAccount(
    workspaceId: string,
    googleUser: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null },
    role: 'admin' | 'editor' | 'viewer' = 'editor'
  ) {
    const s = await getFirebaseServices();
    const newMember = {
      id: `google-${googleUser.uid}`,
      name: googleUser.displayName || googleUser.email?.split('@')[0] || 'Anggota Google',
      email: googleUser.email || 'user@taskflow.pro',
      avatar: googleUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role,
      color: '#6366f1',
      isCurrentUser: true,
    };

    if (s && s.db) {
      try {
        const wsRef = s.dbMod.doc(s.db, 'workspaces', workspaceId);
        const snap = await s.dbMod.getDoc(wsRef);
        if (snap.exists()) {
          const wsData = snap.data();
          const existingMembers = wsData.members || [];
          const exists = existingMembers.some((m: any) => m.email === newMember.email || m.id === newMember.id);
          const updatedMembers = exists
            ? existingMembers.map((m: any) => (m.email === newMember.email ? { ...m, ...newMember, isCurrentUser: false } : m))
            : [...existingMembers, newMember];

          await s.dbMod.setDoc(wsRef, { members: updatedMembers }, { merge: true });
          return updatedMembers;
        }
      } catch (err) {
        console.warn('Join workspace note:', err);
      }
    }

    return [newMember];
  }

  public static async subscribeWorkspaceData(workspaceId: string, callback: (data: any) => void) {
    const s = await getFirebaseServices();
    if (s && s.db) {
      try {
        const wsRef = s.dbMod.doc(s.db, 'workspaces', workspaceId);
        return s.dbMod.onSnapshot(wsRef, (docSnap: any) => {
          if (docSnap.exists()) {
            callback(docSnap.data());
          }
        });
      } catch {
        return () => {};
      }
    }
    return () => {};
  }
}
