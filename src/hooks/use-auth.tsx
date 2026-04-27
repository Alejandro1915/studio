'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from './use-toast';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { achievementsList, Achievement } from '@/lib/achievements';

interface User {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'admin' | 'user';
  score?: number;
  score_easy?: number;
  score_normal?: number;
  score_hard?: number;
  score_survival?: number;
  unlockedAchievements?: string[];
}

interface GameStats {
  score: number;
  mode: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  updateProfileData: (data: { name?: string, photoURL?: string }) => Promise<void>;
  checkAndAwardAchievements: (stats: GameStats) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthCookie = (uid: string) => {
  document.cookie = `auth-session=${uid}; path=/; max-age=3600; SameSite=Lax`;
};

const removeAuthCookie = () => {
  document.cookie = "auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUser = async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const fullUser: User = {
        uid: firebaseUser.uid,
        name: userData.name || firebaseUser.displayName,
        email: userData.email || firebaseUser.email,
        photoURL: userData.photoURL || firebaseUser.photoURL,
        role: userData.role,
        score: userData.score,
        score_easy: userData.score_easy,
        score_normal: userData.score_normal,
        score_hard: userData.score_hard,
        score_survival: userData.score_survival,
        unlockedAchievements: userData.unlockedAchievements || [],
      }
      setUser(fullUser);
    } else {
      const { uid, displayName, email, photoURL } = firebaseUser;
      const newUser: User = {
        uid,
        name: displayName,
        email,
        photoURL: photoURL || null,
        role: 'user',
        score: 0,
        score_easy: 0,
        score_normal: 0,
        score_hard: 0,
        score_survival: 0,
        unlockedAchievements: [],
      };
      await setDoc(doc(db, "users", uid), newUser);
      setUser(newUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setAuthCookie(firebaseUser.uid);
        await fetchUser(firebaseUser);
      } else {
        removeAuthCookie();
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Validación de acceso de admin (el middleware maneja auth básico, nosotros manejamos el rol)
  useEffect(() => {
    if (!loading && user && pathname.startsWith('/admin') && user.role !== 'admin') {
      toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para ver esta página.' });
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router, toast]);

  const handleAuthAction = async (action: () => Promise<any>, successMessage: string, successPath?: string) => {
    try {
      await action();
      toast({ title: 'Éxito', description: successMessage });
      if (successPath) {
        router.push(successPath);
      }
    } catch (error: any) {
      let errorMessage = "Ocurrió un error inesperado.";
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = "Credenciales inválidas. Revisa tu correo y contraseña.";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña debe tener al menos 6 caracteres.";
          break;
        default:
          errorMessage = error.message;
      }
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    }
  };

  const login = async (email: string, password: string) => {
    await handleAuthAction(() => signInWithEmailAndPassword(auth, email, password), '¡Bienvenido de nuevo!', '/dashboard');
  };

  const signup = async (name: string, email: string, password: string) => {
    await handleAuthAction(async () => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const newUser: Omit<User, 'uid'> = { 
        name, email, photoURL: null, role: 'user', 
        score: 0, score_easy: 0, score_normal: 0, score_hard: 0, score_survival: 0, 
        unlockedAchievements: [] 
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    }, 'Cuenta creada correctamente.', '/dashboard');
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await handleAuthAction(() => signInWithPopup(auth, provider), 'Sesión iniciada con Google.', '/dashboard');
  };

  const logout = async () => {
    await handleAuthAction(() => signOut(auth), 'Has cerrado la sesión.', '/');
  };

  const updateProfileData = async (data: { name?: string, photoURL?: string }) => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await handleAuthAction(async () => {
      await updateDoc(userDocRef, data);
      await updateProfile(auth.currentUser!, { displayName: data.name, photoURL: data.photoURL });
      await fetchUser(auth.currentUser!);
    }, 'Perfil actualizado.');
  };

  const checkAndAwardAchievements = async (stats: GameStats) => {
    if (!user) return;
    const achievementsToAward: Achievement[] = [];
    const firstPoints = achievementsList.find(a => a.id === 'first-points');
    if (firstPoints && !user.unlockedAchievements?.includes('first-points') && stats.score > 0) {
      achievementsToAward.push(firstPoints);
    }
    if (achievementsToAward.length > 0) {
      const userDocRef = doc(db, 'users', user.uid);
      const ids = achievementsToAward.map(a => a.id);
      await updateDoc(userDocRef, { unlockedAchievements: arrayUnion(...ids) });
      setUser(prev => prev ? { ...prev, unlockedAchievements: [...(prev.unlockedAchievements || []), ...ids] } : null);
      achievementsToAward.forEach(a => toast({ title: '🏆 ¡Logro!', description: a.name }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loginWithGoogle, signup, updateProfileData, checkAndAwardAchievements }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
}