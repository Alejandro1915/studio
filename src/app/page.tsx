'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] overflow-hidden bg-grid-white/[0.05] w-full">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <motion.div
        className="container mx-auto flex flex-col items-center justify-center text-center px-6 sm:px-8 py-12 md:p-8 z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-4 w-full">
          <h1 className="font-headline text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary via-accent to-primary break-words">
            Animuizu
          </h1>
        </motion.div>
        <motion.p
          variants={itemVariants}
          className="max-w-2xl mx-auto my-6 text-base sm:text-lg md:text-xl text-muted-foreground px-6"
        >
          La batalla de trivia de anime en tiempo real definitiva. Desafía a tus amigos y sube en la clasificación. ¿Tienes lo que se necesita para ser un maestro Otaku?
        </motion.p>
        <motion.div variants={itemVariants}>
          <Button asChild size="lg" className="mt-8 rounded-full text-lg px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow duration-300">
            <Link href="/dashboard">
              Comenzar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
