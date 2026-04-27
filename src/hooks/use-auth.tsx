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
import { doc, setDoc, getDoc, collection, query, where, getDocs, getCountFromServer, updateDoc, arrayUnion } from 'firebase/firestore';
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

const checkNicknameUniqueness = async (name: string, currentUserId?: string): Promise<boolean> => {
  const q = query(collection(db, "users"), where("name", "==", name));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return true;
  if (currentUserId && querySnapshot.docs[0].id === currentUserId) return true;
  return false;
}




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
      const role: 'admin' | 'user' = 'user';
      const newUser: User = {
        uid,
        name: displayName,
        email,
        photoURL,
        role,
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
  }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        await fetchUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';
    const isProfilePage = pathname === '/profile';
    const isAdminPage = pathname.startsWith('/admin');

    if (!user && !isAuthPage && !isProfilePage) {
      router.push('/login');
    }
    if (user && (pathname === '/login' || pathname === '/signup')) {
      router.push('/dashboard');
    }
    if (user && isAdminPage && user.role !== 'admin') {
      toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para ver esta página.' });
      router.push('/dashboard');
    }

  }, [user, loading, pathname, router]);

  const handleAuthAction = async (action: () => Promise<any>, successMessage: string, successPath?: string) => {
    try {
      await action();
      toast({ title: 'Éxito', description: successMessage });
      if (successPath) {
        router.push(successPath);
      }
    } catch (error: any) {
      let errorMessage = "Ocurrió un error inesperado.";
      let errorTitle = "Error";

      // Manejo específico de códigos de error de Firebase Auth
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorTitle = "Error de Acceso";
          errorMessage = "Credenciales inválidas. Por favor, revisa tu correo y contraseña.";
          break;
        case 'auth/email-already-in-use':
          errorTitle = "Error de Registro";
          errorMessage = "El correo electrónico ya está en uso. Por favor, intenta iniciar sesión.";
          break;
        case 'auth/weak-password':
          errorTitle = "Contraseña Débil";
          errorMessage = "La contraseña debe tener al menos 6 caracteres.";
          break;
        case 'auth/popup-closed-by-user':
          errorTitle = "Operación Cancelada";
          errorMessage = "La ventana de acceso se cerró antes de completar el proceso.";
          break;
        case 'auth/too-many-requests':
          errorTitle = "Acceso Bloqueado";
          errorMessage = "Demasiados intentos fallidos. Por favor, inténtalo más tarde.";
          break;
        default:
          errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: errorTitle,
        description: errorMessage
      });

      // No relanzamos el error para evitar la pantalla de Runtime Error de Next.js
      // ya que el usuario ha sido notificado mediante el toast.
    }
  };

  const login = async (email: string, password: string) => {
    await handleAuthAction(
      () => signInWithEmailAndPassword(auth, email, password),
      'Has iniciado sesión correctamente.',
      '/dashboard'
    );
  };

  const signup = async (name: string, email: string, password: string) => {
    const isNicknameUnique = await checkNicknameUniqueness(name);
    if (!isNicknameUnique) {
      toast({ variant: 'destructive', title: 'Error', description: 'Este apodo ya está en uso. Por favor, elige otro.' });
      return;
    }

    await handleAuthAction(
      async () => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        await updateProfile(firebaseUser, { displayName: name });

        const role: 'admin' | 'user' = 'user';
        const newUser: Omit<User, 'uid'> = { name, email, photoURL: null, role, score: 0, score_easy: 0, score_normal: 0, score_hard: 0, score_survival: 0, unlockedAchievements: [] };

        await setDoc(doc(db, "users", firebaseUser.uid), newUser);

      },
      'Cuenta creada correctamente. ¡Bienvenido!',
      '/dashboard'
    );
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await handleAuthAction(
      () => signInWithPopup(auth, provider),
      'Has iniciado sesión con Google correctamente.',
      '/dashboard'
    );
  };

  const logout = async () => {
    await handleAuthAction(
      () => signOut(auth),
      'Has cerrado la sesión.',
      '/'
    );
  };

  const updateProfileData = async (data: { name?: string, photoURL?: string }) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    if (data.name) {
      const isNicknameUnique = await checkNicknameUniqueness(data.name, firebaseUser.uid);
      if (!isNicknameUnique) {
        toast({ variant: 'destructive', title: 'Error', description: 'Este apodo ya está en uso. Por favor, elige otro.' });
        return;
      }
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const dataToUpdate: { [key: string]: any } = {};
    if (data.name) dataToUpdate.name = data.name;
    if (data.photoURL) dataToUpdate.photoURL = data.photoURL;

    await handleAuthAction(async () => {
      await updateDoc(userDocRef, dataToUpdate);
      await updateProfile(firebaseUser, {
        displayName: data.name,
        photoURL: data.photoURL
      });
      await fetchUser(firebaseUser); // Refresh user data
    }, 'Perfil actualizado correctamente.');
  }

  const checkAndAwardAchievements = async (stats: GameStats) => {
    if (!user) return;

    const achievementsToAward: Achievement[] = [];

    // Achievement: 'first-points'
    const firstPointsAchievement = achievementsList.find(a => a.id === 'first-points');
    if (firstPointsAchievement && !user.unlockedAchievements?.includes('first-points') && stats.score > 0) {
      achievementsToAward.push(firstPointsAchievement);
    }

    // Add logic for other achievements here...

    if (achievementsToAward.length > 0) {
      const userDocRef = doc(db, 'users', user.uid);
      const achievementIds = achievementsToAward.map(a => a.id);

      await updateDoc(userDocRef, {
        unlockedAchievements: arrayUnion(...achievementIds)
      });

      // Update user state locally
      setUser(prevUser => ({
        ...prevUser!,
        unlockedAchievements: [...(prevUser?.unlockedAchievements || []), ...achievementIds]
      }));

      // Show toast for each new achievement
      achievementsToAward.forEach(achievement => {
        toast({
          title: '🏆 ¡Logro Desbloqueado!',
          description: `Has conseguido: "${achievement.name}"`
        });
      })
    }
  }

  const value = { user, loading, login, logout, loginWithGoogle, signup, updateProfileData, checkAndAwardAchievements };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
