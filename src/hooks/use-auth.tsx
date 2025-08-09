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
  AuthErrorCodes,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from './use-toast';
import { doc, setDoc, getDoc, collection, query, where, getDocs,getCountFromServer } from 'firebase/firestore';

interface User {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'admin' | 'user';
  score?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const checkNicknameUniqueness = async (name: string): Promise<boolean> => {
    const q = query(collection(db, "users"), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
}

const getUserRole = async (email: string | null): Promise<'admin' | 'user'> => {
    const usersCollection = collection(db, "users");
    const snapshot = await getCountFromServer(usersCollection);
    const userCount = snapshot.data().count;

    if (userCount === 0 || (email && email.endsWith('@mast.otak.co'))) {
        return 'admin';
    }
    return 'user';
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const { name, email, photoURL, role, score } = userDoc.data();
          setUser({ uid: firebaseUser.uid, name, email, photoURL: photoURL || firebaseUser.photoURL, role, score });
        } else {
          // This case handles Google sign-in for the first time
           const { uid, displayName, email, photoURL } = firebaseUser;
           const role = await getUserRole(email);
           const newUser: User = { uid, name: displayName, email, photoURL, role, score: 0 };
           await setDoc(doc(db, "users", uid), { name: displayName, email, photoURL, role, score: 0 });
           setUser(newUser);
        }
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
    const isAdminPage = pathname.startsWith('/admin');

    if (!user && !isAuthPage) {
      router.push('/login');
    }
    if(user && isAuthPage){
        router.push('/dashboard');
    }
    if(user && isAdminPage && user.role !== 'admin'){
        toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para ver esta página.' });
        router.push('/dashboard');
    }

  }, [user, loading, pathname, router]);

  const handleAuthAction = async (action: () => Promise<any>, successMessage: string, successPath: string) => {
    try {
      await action();
      toast({ title: 'Éxito', description: successMessage });
      router.push(successPath);
    } catch (error: any) {
        if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
            toast({ variant: 'destructive', title: 'Error de Registro', description: 'El correo electrónico ya está en uso. Por favor, intenta iniciar sesión.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
        throw error;
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
        
        const role = await getUserRole(email);

        await setDoc(doc(db, "users", firebaseUser.uid), { name, email, role, score: 0 });

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

  const value = { user, loading, login, logout, loginWithGoogle, signup };

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
