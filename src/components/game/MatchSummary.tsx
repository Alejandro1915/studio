'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Trophy, Home } from 'lucide-react';
import { useEffect } from 'react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Mock data for other players
const otherPlayers = [
  { name: 'OtakuSlayer', score: 1250 },
  { name: 'WeebLord', score: 1100 },
  { name: 'SenpaiSays', score: 980 },
];

export default function MatchSummary({ gameId }: { gameId: string }) {
  const searchParams = useSearchParams();
  const finalScore = parseInt(searchParams.get('score') || '0');
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user && finalScore > 0) {
      const updateUserScore = async () => {
        const userRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userRef, {
            score: increment(finalScore)
          });
          toast({
            title: "¡Puntuación actualizada!",
            description: `Se han añadido ${finalScore} puntos a tu total.`,
          })
        } catch (error) {
          console.error("Error updating score: ", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo actualizar tu puntuación total."
          })
        }
      };
      updateUserScore();
    }
  }, [user, finalScore, toast]);


  const allPlayers = [
    ...otherPlayers.map(p => ({ ...p, isCurrentUser: false })),
  ];

  if (user) {
    allPlayers.push({
      name: user.name || 'Tú',
      score: finalScore,
      isCurrentUser: true,
    });
  }
  
  const rankedPlayers = allPlayers
    .sort((a,b) => b.score - a.score)
    .map((p, i) => ({...p, rank: i + 1}));


  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Trophy className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="text-4xl font-headline text-primary">¡Partida Terminada!</CardTitle>
        <CardDescription className="text-lg">Estos son los resultados finales de la partida #{gameId}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">Puesto</TableHead>
              <TableHead>Jugador</TableHead>
              <TableHead className="text-right">Puntaje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankedPlayers.map((player) => (
              <TableRow key={player.name} className={player.isCurrentUser ? 'bg-primary/20' : ''}>
                <TableCell className="font-medium text-2xl text-center">{player.rank}</TableCell>
                <TableCell className="font-bold">{player.name}</TableCell>
                <TableCell className="text-right text-lg font-mono">{player.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" size="lg">
          <Link href="/dashboard">
            <Home className="mr-2 h-5 w-5" />
            Volver al Lobby
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
