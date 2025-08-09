import Leaderboard from "@/components/game/Leaderboard";
import { Suspense } from "react";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Suspense fallback={<div>Cargando clasificación...</div>}>
        <Leaderboard />
      </Suspense>
    </div>
  );
}
