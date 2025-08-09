import MatchSummary from "@/components/game/MatchSummary";
import { Suspense } from "react";

export default function SummaryPage({ params }: { params: { gameId: string } }) {
  return (
    <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Suspense fallback={<div>Loading summary...</div>}>
        <MatchSummary gameId={params.gameId} />
      </Suspense>
    </div>
  );
}
