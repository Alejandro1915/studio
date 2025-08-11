
'use client'

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import QuizArea from "@/components/game/QuizArea";
import WaitingRoom from "@/components/game/WaitingRoom";
import MatchSummary from "@/components/game/MatchSummary";
import { useParams } from "next/navigation";

export interface Game {
    id: string;
    hostId: string;
    players: { uid: string, name: string | null, photoURL: string | null, score: number }[];
    status: 'waiting' | 'in-progress' | 'finished';
    questions?: any[];
    currentQuestionIndex?: number;
    scores?: { [key: string]: number };
}

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    if (gameId === 'random' || gameId === 'survival') {
        setGame(null);
        setLoading(false);
        return;
    }
    
    const gameRef = doc(db, 'games', gameId);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        setGame({ id: doc.id, ...doc.data() } as Game);
      } else {
        setError("La partida no existe o ha sido eliminada.");
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching game:", err);
      setError("No se pudo cargar la partida.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);

  if (loading) {
    return <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">Cargando partida...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)] text-red-500">{error}</div>;
  }

  // Random public match or survival mode
  if (!game) {
    return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <QuizArea gameId={gameId} />
        </div>
    )
  }

  // Private match flow
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {game.status === 'waiting' && <WaitingRoom game={game} />}
      {game.status === 'in-progress' && <QuizArea gameId={gameId} />}
      {game.status === 'finished' && <MatchSummary gameId={gameId} finalScores={game.scores} />}
    </div>
  );
}
