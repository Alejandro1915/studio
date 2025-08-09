import QuizArea from "@/components/game/QuizArea";

export default function GamePage({ params }: { params: { gameId: string } }) {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <QuizArea gameId={params.gameId} />
    </div>
  );
}
