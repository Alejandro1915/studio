'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices, Users, Swords } from "lucide-react";

const gameModes = [
    {
        title: "Random Match",
        description: "Jump into a game with other players from around the world.",
        icon: <Dices className="w-8 h-8 text-primary" />,
        href: "/game/123",
        cta: "Join Match"
    },
    {
        title: "Challenge a Friend",
        description: "Create a private room and invite your friends for a duel.",
        icon: <Swords className="w-8 h-8 text-accent" />,
        href: "#",
        cta: "Create Room",
        disabled: true,
    },
    {
        title: "Global Ranking",
        description: "See how you stack up against the best players.",
        icon: <Users className="w-8 h-8 text-yellow-400" />,
        href: "#",
        cta: "View Rankings",
        disabled: true,
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
