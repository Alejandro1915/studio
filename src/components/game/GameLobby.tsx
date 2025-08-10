'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices, Users, Swords, Trophy, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function GameLobby() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    const handleCreateRoom = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para crear una sala.' });
            return;
        }
        setIsCreatingRoom(true);
        try {
            const gameRef = await addDoc(collection(db, 'games'), {
                hostId: user.uid,
                players: [{ uid: user.uid, name: user.name, photoURL: user.photoURL, score: 0 }],
                status: 'waiting',
                createdAt: serverTimestamp(),
            });
            router.push(`/game/${gameRef.id}`);
        } catch (error) {
            console.error("Error creating game room:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la sala de juego.' });
            setIsCreatingRoom(false);
        }
    };
    
    const gameModes = [
        {
            title: "Partida Aleatoria",
            description: "Entra en una partida con otros jugadores de todo el mundo.",
            icon: <Dices className="w-8 h-8 text-primary" />,
            action: () => router.push('/game/random'),
            cta: "Unirse a Partida",
            disabled: false,
        },
        {
            title: "Desafiar a un Amigo",
            description: "Crea una sala privada e invita a tus amigos a un duelo.",
            icon: <Swords className="w-8 h-8 text-accent" />,
            action: handleCreateRoom,
            cta: isCreatingRoom ? "Creando Sala..." : "Crear Sala",
            disabled: isCreatingRoom,
            iconAction: isCreatingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : null
        },
        {
            title: "Clasificación Global",
            description: "Mira cómo te comparas con los mejores jugadores.",
            icon: <Trophy className="w-8 h-8 text-yellow-400" />,
            action: () => router.push('/leaderboard'),
            cta: "Ver Clasificaciones",
            disabled: false,
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModes.map((mode) => (
                <Card key={mode.title} className="bg-card/50 hover:bg-card/90 hover:border-primary/50 transition-all duration-300 flex flex-col">
                    <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                        {mode.icon}
                        <div>
                            <CardTitle className="font-headline text-2xl">{mode.title}</CardTitle>
                            <CardDescription>{mode.description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Button onClick={mode.action} className="w-full" disabled={mode.disabled}>
                           {mode.iconAction} {mode.cta}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
