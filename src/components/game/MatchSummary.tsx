'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Trophy, Home, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Difficulty } from '../admin/QuestionManagement';


const getOtherPlayers = (difficulty: Difficulty | null) => {
    switch (difficulty) {
        case 'Fácil':
            return [
                { name: 'PrincipianteKun', score: 850 },
                { name: 'WaifuWatcher', score: 720 },
                { name: 'BakaBrawler', score: 650 },
            ];
        case 'Difícil':
             return [
                { name: 'OtakuSama', score: 1850 },
                { name: 'WeebLord', score: 1700 },
                { name: 'SenpaiSensei', score: 1680 },
            ];
        case 'Normal':
        default:
             return [
                { name: 'AnimeEnjoyer', score: 1250 },
                { name: 'ShonenFan', score: 1100 },
                { name: 'IsekaiTraveler', score: 980 },
            ];
    }
}


export default function MatchSummary({ gameId, finalScores }: { gameId: string, finalScores?: { [key: string]: number } }) {
  const searchParams = useSearchParams();
  const randomScore = parseInt(searchParams.get('score') || '0');
  const difficulty = searchParams.get('difficulty') as Difficulty | null;
  const mode = searchParams.get('mode');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isSurvival = gameId === 'survival' || mode === 'survival';
  const isRandom = gameId === 'random';

  useEffect(() => {
    if (user && randomScore > 0 && (isRandom || isSurvival)) {
      const updateUserScore = async () => {
        const userRef = doc(db, 'users', user.uid);
        try {
          const updates: {[key: string]: any} = {
            score: increment(randomScore)
          };

          if (isSurvival) {
            updates.score_survival = increment(randomScore);
          } else if (isRandom && difficulty) {
            if (difficulty === 'Fácil') updates.score_easy = increment(randomScore);
            else if (difficulty === 'Normal') updates.score_normal = increment(randomScore);
            else if (difficulty === 'Difícil') updates.score_hard = increment(randomScore);
          }

          await updateDoc(userRef, updates);

          toast({
            title: "¡Puntuación actualizada!",
            description: `Se han añadido ${randomScore} puntos a tu total.`,
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
  }, [user, randomScore, gameId, toast, isRandom, isSurvival, difficulty]);

  const rankedPlayers = useMemo(() => {
    let allPlayers: { name: string; score: number; isCurrentUser: boolean }[] = [];

    if (isRandom) {
      const otherPlayers = getOtherPlayers(difficulty);
      allPlayers = [
        ...otherPlayers.map(p => ({ ...p, isCurrentUser: false })),
      ];
      if (user) {
        allPlayers.push({
          name: user.name || 'Tú',
          score: randomScore,
          isCurrentUser: true,
        });
      }
    } else if(isSurvival) {
        if (user) {
             allPlayers.push({
                name: user.name || 'Tú',
                score: randomScore,
                isCurrentUser: true,
            });
        }
    }
    else if (finalScores && user) {
       // This part would be improved by fetching player names from user IDs
      allPlayers = Object.entries(finalScores).map(([uid, score]) => ({
          name: uid === user.uid ? (user.name || 'Tú') : `Jugador...${uid.slice(-4)}`,
          score: score,
          isCurrentUser: uid === user.uid
      }));
    }

    return allPlayers
      .sort((a,b) => b.score - a.score)
      .map((p, i) => ({...p, rank: i + 1}));
  }, [finalScores, randomScore, user, difficulty, isRandom, isSurvival]);

  const cardIcon = isSurvival ? <ShieldAlert className="w-12 h-12 text-primary" /> : <Trophy className="w-12 h-12 text-primary" />;
  const cardTitle = isSurvival ? '¡Has sido derrotado!' : '¡Partida Terminada!';
  const cardDescription = isSurvival ? 'Te quedaste sin vidas. Esta es tu puntuación final.' : 'Estos son los resultados finales de la partida';


  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            {cardIcon}
        </div>
        <CardTitle className="text-4xl font-headline text-primary">{cardTitle}</CardTitle>
        <CardDescription className="text-lg">{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {isSurvival && user ? (
             <div className="text-center">
                <p className="text-xl">Puntuación Final</p>
                <p className="text-5xl font-bold font-mono text-primary my-2">{randomScore}</p>
             </div>
        ) : (
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
        )}
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
