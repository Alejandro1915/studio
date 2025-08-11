'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page now acts as a redirector to the user's own public profile page.
export default function ProfileRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(`/profile/${user.uid}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
     <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
        <p>Redirigiendo a tu perfil...</p>
    </div>
  );
}