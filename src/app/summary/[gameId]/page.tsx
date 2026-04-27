import MatchSummary from "@/components/game/MatchSummary";
import { Suspense } from "react";

export default async function SummaryPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  
  return (
    <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Suspense fallback={<div>Cargando resumen...</div>}>
        <MatchSummary gameId={gameId} />
      </Suspense>
    </div>
  );
}
