'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices, Users, Swords, Trophy } from "lucide-react";

const gameModes = [
    {
        title: "Partida Aleatoria",
        description: "Entra en una partida con otros jugadores de todo el mundo.",
        icon: <Dices className="w-8 h-8 text-primary" />,
        href: "/game/123",
        cta: "Unirse a Partida"
    },
    {
        title: "Desafiar a un Amigo",
        description: "Crea una sala privada e invita a tus amigos a un duelo.",
        icon: <Swords className="w-8 h-8 text-accent" />,
        href: "#",
        cta: "Crear Sala",
        disabled: true,
    },
    {
        title: "Clasificación Global",
        description: "Mira cómo te comparas con los mejores jugadores.",
        icon: <Trophy className="w-8 h-8 text-yellow-400" />,
        href: "/leaderboard",
        cta: "Ver Clasificaciones",
        disabled: false,
    }
]

export default function GameLobby() {
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
                        <Button asChild className="w-full" disabled={mode.disabled}>
                            <Link href={mode.href}>{mode.cta}</Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
