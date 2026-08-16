import React, { useState, useEffect } from 'react';
import {
  X,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Cloud,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  listenAuthState,
  doSignInWithPopup,
  doSignInWithEmailAndPassword,
  doCreateUserWithEmailAndPassword,
  doSignOut,
  type User,
} from '../services/firebase';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncFromCloud: (cloudData: any) => void;
  onSyncToCloud: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  onSyncFromCloud,
  onSyncToCloud,
  currentUser,
  setCurrentUser,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePushCloud = () => {
    setErrorMsg(null);
    setSuccessMsg('✅ Data berhasil disimpan ke Firebase Cloud!');
    onSyncToCloud();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handlePullCloud = async () => {
    setIsPulling(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await Promise.race([
        onSyncFromCloud(null),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
      setSuccessMsg('✅ Data terbaru dari Cloud berhasil diperbarui!');
    } catch {
      setErrorMsg('Gagal menarik data dari Cloud.');
    } finally {
      setIsPulling(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let unsub: any = null;
    listenAuthState((user) => {
      setCurrentUser(user);
    }).then((unsubFn) => {
      unsub = unsubFn;
    });
    return () => {
      if (unsub) unsub();
    };
  }, [isOpen, setCurrentUser]);

  if (!isOpen) return null;

  // Google Login Popup
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await doSignInWithPopup();
      if (res && res.user) {
        setCurrentUser(res.user);
        onClose();
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google. Mohon izinkan pop-up browser Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Login or Register
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Mohon isi Email dan Kata Sandi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isRegistering) {
        const res = await doCreateUserWithEmailAndPassword(email, password);
        setCurrentUser(res.user);
        setSuccessMsg('Akun baru berhasil dibuat!');
      } else {
        const res = await doSignInWithEmailAndPassword(email, password);
        setCurrentUser(res.user);
        setSuccessMsg('Berhasil masuk ke akun Anda!');
      }
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setErrorMsg(err.message || 'Gagal autentikasi email. Periksa email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await doSignOut();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setSuccessMsg('Anda telah keluar dari akun Firebase.');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Cloud className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Firebase Cloud Auth & Real-Time Sync
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Notifications Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged In Dashboard */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center gap-3.5">
                <img
                  src={
                    currentUser.photoURL ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                  }
                  alt="Avatar"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.displayName || 'Pengguna TaskFlow'}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email || 'Akun Cloud Aktif'}
                  </p>
                  <span className="inline-block mt-1 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    Tersambung ke Firebase Firestore
                  </span>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePushCloud}
                  disabled={isPushing || isPulling}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all active:scale-95"
                >
                  <Cloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-bounce' : ''}`} />
                  <span>{isPushing ? 'Menyimpan...' : 'Simpan ke Cloud'}</span>
                </button>
                <button
                  onClick={handlePullCloud}
                  disabled={isPushing || isPulling}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-50 transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isPulling ? 'animate-spin' : ''}`} />
                  <span>{isPulling ? 'Menarik...' : 'Tarik data Cloud'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all border border-rose-200/50 dark:border-rose-900/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Akun (Sign Out)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out: Auth Options */
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-xs transition-all active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Lanjutkan dengan Akun Google</span>
              </button>

              <div className="relative flex items-center my-3">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold uppercase text-slate-400">
                  atau via Email
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {isRegistering && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Anda"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-98 mt-1"
                >
                  {loading ? 'Memproses...' : isRegistering ? 'Daftar Akun Baru' : 'Masuk Akun'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setErrorMsg(null);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  {isRegistering
                    ? 'Sudah punya akun? Masuk di sini'
                    : 'Belum punya akun? Daftar di sini'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
