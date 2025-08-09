import GameLobby from "@/components/game/GameLobby";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl md:text-5xl font-headline text-primary mb-2">Welcome Back!</h1>
      <p className="text-lg text-muted-foreground mb-8">Ready for your next challenge?</p>
      <Suspense fallback={<div>Loading...</div>}>
        <GameLobby />
      </Suspense>
    </div>
  );
}
