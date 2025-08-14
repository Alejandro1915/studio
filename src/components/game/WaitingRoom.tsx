'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import type { Game } from '@/app/game/[gameId]/page';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Play, UserPlus } from 'lucide-react';

const TOTAL_QUESTIONS = 10;

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


export default function WaitingRoom({ game }: { game: Game }) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const isHost = user?.uid === game.hostId;
    const isPlayerInGame = game.players.some(p => p.uid === user?.uid);
    const canStart = isHost && game.players.length >= 2;

    useEffect(() => {
        const joinGame = async () => {
            if (user && !isPlayerInGame && game.players.length < 2) {
                const gameRef = doc(db, 'games', game.id);
                try {
                    await updateDoc(gameRef, {
                        players: arrayUnion({ uid: user.uid, name: user.name, photoURL: user.photoURL, score: 0 })
                    });
                    toast({ title: "¡Te has unido!", description: "Esperando a que el anfitrión inicie la partida." });
                } catch (error) {
                    console.error("Error joining game:", error);
                    toast({ variant: 'destructive', title: 'Error', description: 'No se pudo unir a la partida.' });
                    router.push('/dashboard');
                }
            }
        };
        joinGame();
    }, [user, isPlayerInGame, game.id, router, toast, game.players.length]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: '¡Enlace copiado!', description: 'Comparte este enlace con tu amigo para que se una.' });
    };

    const handleStartGame = async () => {
        if (!canStart || !isHost) return;

        try {
            const querySnapshot = await getDocs(collection(db, 'questions'));
            const allQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const gameQuestions = shuffleArray(allQuestions).slice(0, TOTAL_QUESTIONS);

            const gameRef = doc(db, 'games', game.id);
            const initialScores = game.players.reduce((acc, player) => {
                acc[player.uid] = 0;
                return acc;
            }, {} as {[key: string]: number});
            
            await updateDoc(gameRef, {
                status: 'in-progress',
                questions: gameQuestions,
                currentQuestionIndex: 0,
                scores: initialScores,
                startedAt: serverTimestamp(),
            });
        } catch(error) {
            console.error("Error starting game:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo iniciar la partida.' });
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
                 <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <Users className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-4xl font-headline text-primary">Sala de Espera</CardTitle>
                <CardDescription className="text-lg">
                    Invita a tu amigo y prepárate para el duelo.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-center">
                    <Button variant="outline" onClick={handleCopyLink}>
                        <Copy className="mr-2"/>
                        Copiar Enlace de Invitación
                    </Button>
                </div>
                <div className="space-y-4">
                    <h3 className="text-center text-xl font-semibold">Jugadores Conectados ({game.players.length}/2)</h3>
                     <div className="flex justify-center items-start gap-8 p-4 bg-muted/50 rounded-lg min-h-[140px]">
                        {game.players.map(player => (
                            <div key={player.uid} className="flex flex-col items-center gap-2 text-center w-24">
                                <Avatar className="w-20 h-20 border-4 border-primary/50">
                                    <AvatarImage src={player.photoURL || undefined} />
                                    <AvatarFallback>{player.name?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-lg truncate w-full">{player.name}</span>
                                {player.uid === game.hostId && <span className="text-xs text-primary font-bold">(Anfitrión)</span>}
                            </div>
                        ))}
                        {game.players.length < 2 && (
                             <div className="flex flex-col items-center gap-2 text-center w-24">
                                <Avatar className="w-20 h-20 border-4 border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted">
                                    <UserPlus className="w-10 h-10 text-muted-foreground" />
                                </Avatar>
                                <span className="font-semibold text-lg text-muted-foreground">Esperando...</span>
                            </div>
                        )}
                     </div>
                </div>
            </CardContent>
            <CardFooter>
                {isHost && (
                    <Button onClick={handleStartGame} disabled={!canStart} className="w-full" size="lg">
                        <Play className="mr-2" />
                        {game.players.length < 2 ? 'Esperando al oponente...' : '¡Iniciar Partida!'}
                    </Button>
                )}
                {!isHost && (
                    <div className="text-center w-full text-muted-foreground">Esperando a que el anfitrión inicie la partida...</div>
                )}
            </CardFooter>
        </Card>
    );
}
