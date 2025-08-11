'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Loader, ShieldQuestion, Heart } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { collection, getDocs, doc, updateDoc, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Question, Difficulty } from '../admin/QuestionManagement';
import { Badge } from '../ui/badge';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/app/game/[gameId]/page';

const TIME_PER_QUESTION = 15; // segundos
const TOTAL_QUESTIONS_RANDOM = 10;
const INITIAL_LIVES = 3;

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getDifficultyBadgeVariant = (difficulty: Difficulty) => {
    switch(difficulty) {
        case 'Fácil': return 'default';
        case 'Normal': return 'secondary';
        case 'Difícil': return 'destructive';
        default: return 'outline';
    }
}

export default function QuizArea({ gameId }: { gameId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(INITIAL_LIVES);
  
  const isSurvivalMode = gameId === 'survival';

  useEffect(() => {
    const setupGame = async () => {
      try {
        if (gameId === 'random') {
          const difficulty = searchParams.get('difficulty') as Difficulty | null;
          const questionsRef = collection(db, 'questions');
          
          let q;
          if (difficulty && ['Fácil', 'Normal', 'Difícil'].includes(difficulty)) {
            q = query(questionsRef, where('difficulty', '==', difficulty));
          } else {
            q = query(questionsRef);
          }
          
          const querySnapshot = await getDocs(q);
          const allQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
          
          if (allQuestions.length === 0) {
              const allDocsSnapshot = await getDocs(collection(db, 'questions'));
              const fallbackQuestions = allDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
              setQuestions(shuffleArray(fallbackQuestions).slice(0, TOTAL_QUESTIONS_RANDOM));
          } else {
            setQuestions(shuffleArray(allQuestions).slice(0, TOTAL_QUESTIONS_RANDOM));
          }
        } else if (isSurvivalMode) {
          const easyQuery = query(collection(db, 'questions'), where('difficulty', '==', 'Fácil'), limit(5));
          const normalQuery = query(collection(db, 'questions'), where('difficulty', '==', 'Normal'), limit(10));
          const hardQuery = query(collection(db, 'questions'), where('difficulty', '==', 'Difícil'), limit(15));
          
          const [easySnapshot, normalSnapshot, hardSnapshot] = await Promise.all([
            getDocs(easyQuery),
            getDocs(normalQuery),
            getDocs(hardQuery)
          ]);

          const easyQuestions = easySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
          const normalQuestions = normalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
          const hardQuestions = hardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));

          setQuestions([
              ...shuffleArray(easyQuestions), 
              ...shuffleArray(normalQuestions), 
              ...shuffleArray(hardQuestions)
            ]);

        } else {
          // Private match logic remains the same
          const gameRef = doc(db, 'games', gameId);
          const gameSnap = await getDoc(gameRef);
          if (gameSnap.exists()) {
            const gameData = { id: gameSnap.id, ...gameSnap.data() } as Game;
            setGame(gameData);
            setQuestions(gameData.questions || []);
            setCurrentQuestionIndex(gameData.currentQuestionIndex || 0);
            if (user && gameData.scores && gameData.scores[user.uid]) {
              setScore(gameData.scores[user.uid]);
            }
          }
        }
      } catch(e) {
        console.error("Failed to setup game", e);
      } finally {
        setLoading(false);
      }
    };
    setupGame();
  }, [gameId, user, searchParams, isSurvivalMode]);

  const currentQuestion = questions[currentQuestionIndex];
  
  const shuffledOptions = useMemo(() => {
    if (currentQuestion) {
      return shuffleArray(currentQuestion.options);
    }
    return [];
  }, [currentQuestion]);

  const handleIncorrectAnswer = () => {
    if (isSurvivalMode) {
        setLives(prev => prev - 1);
        if (lives - 1 <= 0) {
            endGame();
        }
    }
  }

  const endGame = () => {
    const difficulty = searchParams.get('difficulty');
    const mode = isSurvivalMode ? 'survival' : (difficulty ? `random&difficulty=${difficulty}` : 'random');

    if (gameId !== 'random' && !isSurvivalMode) {
      const gameRef = doc(db, 'games', gameId);
      updateDoc(gameRef, { status: 'finished' });
    } else {
      router.push(`/summary/${gameId}?score=${score}${isSurvivalMode ? '&mode=survival' : (difficulty ? `&difficulty=${difficulty}` : '')}`);
    }
  }

  useEffect(() => {
    if (isAnswered || loading || !currentQuestion) return;
    if (timeLeft === 0) {
      setIsAnswered(true);
      setSelectedAnswer(null);
      handleIncorrectAnswer();
      setTimeout(nextQuestion, 2000);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, loading, currentQuestion]);

  const handleAnswer = async (answer: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);
    
    let points = 0;
    if (answer === currentQuestion.answer) {
      points = 100 + timeLeft * 10;
      setScore((prev) => prev + points);
    } else {
        handleIncorrectAnswer();
    }
    
    if (gameId !== 'random' && !isSurvivalMode && user) {
        const gameRef = doc(db, 'games', gameId);
        const newScores = { ...game?.scores, [user.uid]: (score + points) };
        await updateDoc(gameRef, { scores: newScores });
    }

    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = async () => {
    if (isSurvivalMode && lives <= 1 && selectedAnswer !== currentQuestion.answer && timeLeft === 0) {
        return; // Don't advance if it's the last life and answer was wrong
    }

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      if (gameId !== 'random' && !isSurvivalMode) {
        const gameRef = doc(db, 'games', gameId);
        await updateDoc(gameRef, { currentQuestionIndex: nextIndex });
      }
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
        endGame();
    }
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-secondary hover:bg-primary/20';
    }
    if (option === currentQuestion.answer) {
      return 'bg-green-500/80 hover:bg-green-500 text-white';
    }
    if (option === selectedAnswer && option !== currentQuestion.answer) {
      return 'bg-red-500/80 hover:bg-red-500 text-white';
    }
    return 'bg-secondary opacity-50';
  };
  
  const getButtonIcon = (option: string) => {
    if (!isAnswered) return null;
    if (option === currentQuestion.answer) return <CheckCircle />;
    if (option === selectedAnswer && option !== currentQuestion.answer) return <XCircle />;
    return null;
  }
  
  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center gap-4 text-xl">
              <Loader className="w-12 h-12 animate-spin text-primary" />
              Preparando la partida...
          </div>
      )
  }
  
  if(!currentQuestion && !loading) {
      return (
          <Card className="w-full max-w-4xl shadow-2xl shadow-primary/10">
              <CardHeader>
                <CardTitle>No hay preguntas</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No se encontraron preguntas para esta dificultad. Es posible que un administrador deba añadirlas.</p>
                <Button onClick={() => router.push('/dashboard')} className="mt-4">Volver al Lobby</Button>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="w-full max-w-4xl shadow-2xl shadow-primary/10">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
                <CardTitle className="font-headline text-xl text-primary">Pregunta {currentQuestionIndex + 1}/{questions.length}</CardTitle>
                <Badge variant={getDifficultyBadgeVariant(currentQuestion.difficulty)}>
                    <ShieldQuestion className="w-4 h-4 mr-2" />
                    {currentQuestion.difficulty}
                </Badge>
            </div>
            <div className="flex items-center gap-4">
                {isSurvivalMode && (
                    <div className="flex items-center gap-1">
                        {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
                           <Heart key={i} className={cn("w-6 h-6 text-red-500 transition-colors", i < lives ? 'fill-red-500' : 'fill-none opacity-50')} />
                        ))}
                    </div>
                )}
                <div className="text-2xl font-bold text-accent">{score} pts</div>
            </div>
        </div>
        <Progress value={(timeLeft / TIME_PER_QUESTION) * 100} className="w-full h-2" />
        <div className="flex items-center justify-center text-lg text-muted-foreground mt-2">
            <Clock className="w-5 h-5 mr-2" />
            Tiempo restante: {timeLeft}s
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
            <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                {currentQuestion.image && (
                    <div className="mb-6 rounded-lg overflow-hidden aspect-video relative">
                        <Image src={currentQuestion.image} alt={currentQuestion.question} layout="fill" objectFit="cover" data-ai-hint="anime quiz" />
                    </div>
                )}
                <h2 className="text-2xl md:text-3xl font-bold mb-8 min-h-[4rem]">{currentQuestion.question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shuffledOptions.map((option) => (
                        <Button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={isAnswered}
                            className={cn("text-lg h-auto py-4 whitespace-normal justify-between transition-all duration-300", getButtonClass(option))}
                        >
                            <span>{option}</span>
                            {getButtonIcon(option)}
                        </Button>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
