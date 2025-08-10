'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Loader, ShieldQuestion } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Question, Difficulty } from '../admin/QuestionManagement';
import { Badge } from '../ui/badge';

const TIME_PER_QUESTION = 15; // segundos

// Helper function to shuffle an array
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const seedQuestions = async () => {
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    if (snapshot.empty) {
        console.log("No questions found, seeding database...");
        const questionsToSeed: Omit<Question, 'id'>[] = [
            {
                question: 'En "Naruto", ¿quién es el maestro del Equipo 7?',
                options: ['Jiraiya', 'Kakashi Hatake', 'Might Guy', 'Iruka Umino'],
                answer: 'Kakashi Hatake',
                difficulty: 'Fácil',
                image: 'https://placehold.co/600x300.png',
            },
            {
                question: '¿Cuál es el nombre del titán que posee Eren Jaeger en "Attack on Titan"?',
                options: ['Titán Colosal', 'Titán Acorazado', 'Titán de Ataque', 'Titán Bestia'],
                answer: 'Titán de Ataque',
                difficulty: 'Normal',
                image: 'https://placehold.co/600x300.png',
            },
            {
                question: 'En "Dragon Ball Z", ¿quién es el primer enemigo que alcanza la forma de Super Saiyan?',
                options: ['Vegeta', 'Goku', 'Freezer', 'Broly'],
                answer: 'Goku',
                difficulty: 'Normal',
                image: 'https://placehold.co/600x300.png',
            },
            {
                question: '¿Qué objeto busca el protagonista en "One Piece" para convertirse en el Rey de los Piratas?',
                options: ['El All Blue', 'El One Piece', 'El Poneglyph', 'La Fruta del Diablo'],
                answer: 'El One Piece',
                difficulty: 'Fácil',
                image: 'https://placehold.co/600x300.png',
            },
            {
                question: 'En "Demon Slayer", ¿cuál es el nombre de la hermana de Tanjiro Kamado?',
                options: ['Kanao Tsuyuri', 'Shinobu Kocho', 'Nezuko Kamado', 'Mitsuri Kanroji'],
                answer: 'Nezuko Kamado',
                difficulty: 'Fácil',
                image: 'https://placehold.co/600x300.png',
            },
            {
                question: 'En "Code Geass", ¿cuál es el poder que Lelouch obtiene de C.C.?',
                options: ['Death Note', 'Geass', 'Stand', 'Nen'],
                answer: 'Geass',
                difficulty: 'Difícil',
                image: 'https://placehold.co/600x300.png',
            }
        ];
        
        for (const q of questionsToSeed) {
            await addDoc(questionsRef, q);
        }
    }
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        await seedQuestions();
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        // Shuffle questions
        setQuestions(shuffleArray(questionsData));
      } catch(e) {
        console.error("Failed to fetch questions", e)
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  
  const shuffledOptions = useMemo(() => {
    if (currentQuestion) {
      return shuffleArray(currentQuestion.options);
    }
    return [];
  }, [currentQuestion]);


  useEffect(() => {
    if (isAnswered || loading) return;
    if (timeLeft === 0) {
      setIsAnswered(true);
      setTimeout(nextQuestion, 2000);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, loading]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);

    if (answer === currentQuestion.answer) {
      setScore((prev) => prev + 100 + timeLeft * 10);
    }

    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // End of quiz
      router.push(`/summary/${gameId}?score=${score}`);
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
              Cargando preguntas...
          </div>
      )
  }
  
  if(!currentQuestion) {
      return (
          <Card className="w-full max-w-4xl shadow-2xl shadow-primary/10">
              <CardHeader>
                <CardTitle>No hay preguntas</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No se encontraron preguntas. Un administrador debe añadir preguntas para poder jugar.</p>
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
          <div className="text-2xl font-bold text-accent">{score} pts</div>
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
