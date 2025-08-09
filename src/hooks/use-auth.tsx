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
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from './use-toast';

interface User {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const { uid, displayName, email, photoURL } = firebaseUser;
        setUser({ uid, name: displayName, email, photoURL });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const handleAuthAction = async (action: Promise<any>, successMessage: string, successPath: string) => {
    try {
      await action;
      toast({ title: 'Éxito', description: successMessage });
      router.push(successPath);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const login = async (email: string, password: string) => {
    await handleAuthAction(
      signInWithEmailAndPassword(auth, email, password),
      'Has iniciado sesión correctamente.',
      '/dashboard'
    );
  };

  const signup = async (email: string, password: string) => {
    await handleAuthAction(
      createUserWithEmailAndPassword(auth, email, password),
      'Cuenta creada correctamente. ¡Bienvenido!',
      '/dashboard'
    );
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await handleAuthAction(
      signInWithPopup(auth, provider),
      'Has iniciado sesión con Google correctamente.',
      '/dashboard'
    );
  };

  const logout = async () => {
    await handleAuthAction(
      signOut(auth),
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
