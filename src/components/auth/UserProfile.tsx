'use client';

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { achievementsList } from "@/lib/achievements";
import { AchievementCard } from "../achievements/AchievementCard";
import { Separator } from "../ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface UserProfileData {
  name: string | null;
  email: string | null;
  photoURL: string | null;
  score?: number;
  unlockedAchievements?: string[];
}

const ProfileSkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-6">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-5 w-32" />
            </div>
        </div>
        <Separator />
        <div>
            <Skeleton className="h-7 w-40 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)}
            </div>
        </div>
    </div>
);


export default function UserProfile({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfileData);
        } else {
          setError("Este perfil de usuario no existe.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
        <Card className="mx-auto max-w-lg w-full mt-16">
             <CardHeader>
                <CardTitle className="text-center text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p>{error}</p>
                 <Button asChild className="mt-4">
                    <Link href="/dashboard">Volver al inicio</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <Avatar className="h-28 w-28 border-4 border-primary">
                <AvatarImage src={profile.photoURL || undefined} />
                <AvatarFallback>{profile.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-4xl font-headline text-primary">{profile.name}</h1>
                <p className="text-lg text-muted-foreground">{profile.email}</p>
                <p className="text-2xl font-bold font-mono text-accent mt-1">{profile.score?.toLocaleString() || 0} puntos</p>
            </div>
            {currentUser?.uid === userId && (
                 <Button asChild className="ml-auto">
                    <Link href="/profile/edit">Editar Perfil</Link>
                </Button>
            )}
        </div>

        <Separator />

        <div className="mt-8">
            <h3 className="text-2xl font-headline text-primary mb-4">Logros Desbloqueados</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {achievementsList.map((achievement) => (
                    <AchievementCard 
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={profile.unlockedAchievements?.includes(achievement.id) || false}
                    />
                ))}
            </div>
        </div>
    </div>
  );
}