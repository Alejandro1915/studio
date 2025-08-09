'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Trophy, Loader2, Medal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface User {
  id: string;
  name: string;
  photoURL?: string;
  score: number;
}

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Medal className="w-7 h-7 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-7 h-7 text-gray-400" />;
    if (rank === 3) return <Medal className="w-7 h-7 text-orange-500" />;
    return <span className="text-lg w-7 text-center">{rank}</span>;
}


export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('score', 'desc'), limit(100));
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto bg-yellow-400/10 p-4 rounded-full w-fit mb-4">
            <Trophy className="w-12 h-12 text-yellow-400" />
        </div>
        <CardTitle className="text-4xl font-headline text-yellow-400">Clasificación Global</CardTitle>
        <CardDescription className="text-lg">
          Los mejores jugadores de Animuizu. ¡Sigue jugando para subir de puesto!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">Puesto</TableHead>
              <TableHead>Jugador</TableHead>
              <TableHead className="text-right">Puntaje Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id} className={currentUser?.uid === user.id ? 'bg-primary/20 hover:bg-primary/30' : ''}>
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
                <TableCell className="text-right text-xl font-bold font-mono">{user.score.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
