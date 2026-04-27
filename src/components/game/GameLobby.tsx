'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices, Users, Swords, Trophy, Loader2, Star, Brain, Skull, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import InviteFriendDialog from "./InviteFriendDialog";

export default function GameLobby() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    
    const gameModes = [
        {
            title: "Partida Fácil",
            description: "Preguntas sencillas para empezar a calentar.",
            icon: <Star className="w-8 h-8 text-green-400" />,
            action: () => router.push('/game/random?difficulty=Fácil'),
            cta: "Jugar Fácil",
            disabled: false,
        },
        {
            title: "Partida Normal",
            description: "Un desafío balanceado para el otaku promedio.",
            icon: <Brain className="w-8 h-8 text-blue-400" />,
            action: () => router.push('/game/random?difficulty=Normal'),
            cta: "Jugar Normal",
            disabled: false,
        },
        {
            title: "Partida Difícil",
            description: "Demuestra tu conocimiento con las preguntas más retadoras.",
            icon: <Skull className="w-8 h-8 text-red-500" />,
            action: () => router.push('/game/random?difficulty=Difícil'),
            cta: "Jugar Difícil",
            disabled: false,
        },
        {
            title: "Modo Supervivencia",
            description: "Responde todo lo que puedas con 3 vidas.",
            icon: <Heart className="w-8 h-8 text-red-500" />,
            action: () => router.push('/game/survival'),
            cta: "¡A Sobrevivir!",
            disabled: false,
        },
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
                           {mode.cta}
                        </Button>
                    </CardContent>
                </Card>
            ))}

            {/* Special cards for invite and leaderboard */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <Card className="bg-card/50 hover:bg-card/90 hover:border-primary/50 transition-all duration-300 flex flex-col">
                    <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                        <Swords className="w-8 h-8 text-accent" />
                        <div>
                            <CardTitle className="font-headline text-2xl">Desafiar Amigo</CardTitle>
                            <CardDescription>Busca a un jugador y envíale una invitación.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <DialogTrigger asChild>
                            <Button className="w-full">
                                Buscar Jugador
                            </Button>
                        </DialogTrigger>
                    </CardContent>
                </Card>
                <InviteFriendDialog setIsInviteOpen={setIsInviteOpen} />
            </Dialog>

            <Card className="bg-card/50 hover:bg-card/90 hover:border-primary/50 transition-all duration-300 flex flex-col">
                <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <div>
                        <CardTitle className="font-headline text-2xl">Clasificación</CardTitle>
                        <CardDescription>Compara tu puntaje con los mejores.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                    <Button onClick={() => router.push('/leaderboard')} className="w-full">
                        Ver Clasificación
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
