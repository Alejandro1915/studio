'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Trophy, Loader2, Medal, Star, Brain, Skull, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  photoURL?: string;
  score: number;
}

type LeaderboardMode = 'global' | 'easy' | 'normal' | 'hard' | 'survival';

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Medal className="w-7 h-7 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-7 h-7 text-gray-400" />;
    if (rank === 3) return <Medal className="w-7 h-7 text-orange-500" />;
    return <span className="text-lg w-7 text-center">{rank}</span>;
}

const LeaderboardTable = ({ users, scoreField, currentUser }: { users: User[], scoreField: keyof User, currentUser: any }) => {
    const router = useRouter();
    const sortedUsers = [...users]
        .filter(u => (u[scoreField] || 0) > 0)
        .sort((a, b) => (b[scoreField] || 0) - (a[scoreField] || 0));

    if (sortedUsers.length === 0) {
        return <p className="text-center text-muted-foreground py-8">Nadie ha jugado en este modo todavía. ¡Sé el primero!</p>
    }
    
    const handleRowClick = (userId: string) => {
        router.push(`/profile/${userId}`);
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px] text-center">Puesto</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead className="text-right">Puntaje</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedUsers.map((user, index) => (
                <TableRow 
                    key={user.id} 
                    className={`cursor-pointer ${currentUser?.uid === user.id ? 'bg-primary/20 hover:bg-primary/30' : 'hover:bg-muted/50'}`}
                    onClick={() => handleRowClick(user.id)}
                >
                    <TableCell className="font-bold text-xl text-center">
                        <div className='flex items-center justify-center'>
                            <RankIcon rank={index + 1} />
                        </div>
                    </TableCell>
                    <TableCell className="flex items-center gap-4 py-4">
                    <Avatar className='h-12 w-12'>
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className='font-bold text-lg'>{user.name}</span>
                    </TableCell>
                    <TableCell className="text-right text-xl font-bold font-mono">{(user[scoreField] as number || 0).toLocaleString()}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, limit(100));
        const userSnapshot = await getDocs(q);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users for leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-xl h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            Cargando la clasificación...
        </div>
    )
  }

  const tabs = [
      { value: 'global', label: 'Global', icon: <Trophy className="w-5 h-5" />, scoreField: 'score' },
      { value: 'easy', label: 'Fácil', icon: <Star className="w-5 h-5" />, scoreField: 'score_easy' },
      { value: 'normal', label: 'Normal', icon: <Brain className="w-5 h-5" />, scoreField: 'score_normal' },
      { value: 'hard', label: 'Difícil', icon: <Skull className="w-5 h-5" />, scoreField: 'score_hard' },
      { value: 'survival', label: 'Supervivencia', icon: <Heart className="w-5 h-5" />, scoreField: 'score_survival' }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto bg-yellow-400/10 p-4 rounded-full w-fit mb-4">
            <Trophy className="w-12 h-12 text-yellow-400" />
        </div>
        <CardTitle className="text-4xl font-headline text-yellow-400">Clasificación</CardTitle>
        <CardDescription className="text-lg">
          Compara tu puntaje con los mejores jugadores de Animuizu.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <Tabs defaultValue="global" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                  {tabs.map(tab => (
                      <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                          {tab.icon}
                          {tab.label}
                      </TabsTrigger>
                  ))}
              </TabsList>
               {tabs.map(tab => (
                  <TabsContent key={tab.value} value={tab.value}>
                      <LeaderboardTable 
                        users={users} 
                        scoreField={tab.scoreField as keyof User} 
                        currentUser={currentUser} 
                      />
                  </TabsContent>
              ))}
          </Tabs>
      </CardContent>
    </Card>
  );
}