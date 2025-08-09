'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const mockQuestions = [
  {
    question: "In 'Naruto', what is the name of the tailed beast sealed inside the main character?",
    image: 'https://placehold.co/600x300.png',
    "data-ai-hint": "anime character",
    options: ['Shukaku', 'Kurama', 'Gyuki', 'Matatabi'],
    answer: 'Kurama',
  },
  {
    question: "Who is the 'Symbol of Peace' in 'My Hero Academia'?",
    options: ['Endeavor', 'Hawks', 'All Might', 'Best Jeanist'],
    answer: 'All Might',
  },
  {
    question: "What is the primary goal of the scouts in 'Attack on Titan'?",
    image: 'https://placehold.co/600x300.png',
    "data-ai-hint": "anime battle",
    options: ['To find a new home', 'To kill all titans', 'To explore the world beyond the walls', 'To overthrow the government'],
    answer: 'To explore the world beyond the walls',
  },
    {
    question: "In 'Demon Slayer', what is the name of Tanjiro's sister?",
    options: ['Nezuko', 'Kanao', 'Shinobu', 'Mitsuri'],
    answer: 'Nezuko',
  },
];

const TIME_PER_QUESTION = 15; // seconds

export default function QuizArea({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  useEffect(() => {
    if (isAnswered) return;
    if (timeLeft === 0) {
      setIsAnswered(true);
      setTimeout(nextQuestion, 2000);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

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
    if (currentQuestionIndex < mockQuestions.length - 1) {
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

  return (
    <Card className="w-full max-w-4xl shadow-2xl shadow-primary/10">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="font-headline text-xl text-primary">Question {currentQuestionIndex + 1}/{mockQuestions.length}</CardTitle>
          <div className="text-2xl font-bold text-accent">{score} pts</div>
        </div>
        <Progress value={(timeLeft / TIME_PER_QUESTION) * 100} className="w-full h-2" />
        <div className="flex items-center justify-center text-lg text-muted-foreground mt-2">
            <Clock className="w-5 h-5 mr-2" />
            Time left: {timeLeft}s
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
                        <Image src={currentQuestion.image} alt={currentQuestion.question} layout="fill" objectFit="cover" data-ai-hint={currentQuestion["data-ai-hint"]} />
                    </div>
                )}
                <h2 className="text-2xl md:text-3xl font-bold mb-8 min-h-[4rem]">{currentQuestion.question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option) => (
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
