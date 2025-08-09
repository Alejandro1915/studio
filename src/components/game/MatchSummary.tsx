'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Trophy, Home } from 'lucide-react';

const mockPlayers = [
  { rank: 2, name: 'OtakuSlayer', score: 1250, isCurrentUser: false },
  { rank: 3, name: 'WeebLord', score: 1100, isCurrentUser: false },
  { rank: 4, name: 'SenpaiSays', score: 980, isCurrentUser: false },
];

export default function MatchSummary({ gameId }: { gameId: string }) {
  const searchParams = useSearchParams();
  const finalScore = searchParams.get('score');
  const { user } = useAuth();
  
  const currentUserData = {
      rank: 1,
      name: user?.name || 'Tú',
      score: parseInt(finalScore || '0'),
      isCurrentUser: true,
  };

  const allPlayers = [...mockPlayers, currentUserData].sort((a,b) => b.score - a.score).map((p, i) => ({...p, rank: i + 1}));


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
            {allPlayers.map((player) => (
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
