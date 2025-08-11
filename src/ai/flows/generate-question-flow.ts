'use server';
/**
 * @fileOverview Un agente de IA para generar preguntas de trivia de anime.
 *
 * - generateQuestion - Una función que maneja el proceso de generación de preguntas.
 * - GenerateQuestionInput - El tipo de entrada para la función generateQuestion.
 * - GenerateQuestionOutput - El tipo de retorno para la función generateQuestion.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { Difficulty } from '@/components/admin/QuestionManagement';

const difficultyLevels: [string, ...string[]] = ['Fácil', 'Normal', 'Difícil'];

export const GenerateQuestionInputSchema = z.object({
  topic: z.string().describe("El tema de anime para la pregunta, por ejemplo, 'Naruto' o 'Studio Ghibli'."),
});
export type GenerateQuestionInput = z.infer<typeof GenerateQuestionInputSchema>;

export const GenerateQuestionOutputSchema = z.object({
  question: z.string().describe('La pregunta de trivia generada.'),
  options: z.array(z.string()).length(4).describe('Un array de 4 posibles respuestas.'),
  answer: z.string().describe('La respuesta correcta de las opciones.'),
  difficulty: z.enum(difficultyLevels as [Difficulty, ...Difficulty[]]).describe('La dificultad de la pregunta.'),
});
export type GenerateQuestionOutput = z.infer<typeof GenerateQuestionOutputSchema>;

export async function generateQuestion(input: GenerateQuestionInput): Promise<GenerateQuestionOutput> {
  return generateQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionPrompt',
  input: {schema: GenerateQuestionInputSchema},
  output: {schema: GenerateQuestionOutputSchema},
  prompt: `Eres un experto en anime y manga, especializado en crear preguntas de trivia desafiantes y divertidas.
  
  Tu tarea es generar UNA pregunta de trivia sobre el siguiente tema: {{{topic}}}.

  La pregunta debe tener el siguiente formato:
  - Una pregunta clara y concisa.
  - Cuatro (4) opciones de respuesta.
  - Una de las opciones debe ser la respuesta correcta.
  - Una clasificación de dificultad ('Fácil', 'Normal', o 'Difícil').

  Asegúrate de que la respuesta correcta esté incluida en las cuatro opciones.
  
  Aquí tienes un ejemplo de la estructura de salida que debes proporcionar:
  {
    "question": "¿Quién es el protagonista principal de 'Attack on Titan'?",
    "options": ["Levi Ackerman", "Eren Yeager", "Mikasa Ackerman", "Armin Arlert"],
    "answer": "Eren Yeager",
    "difficulty": "Fácil"
  }
  
  Genera una nueva pregunta basada en el tema proporcionado.`,
});

const generateQuestionFlow = ai.defineFlow(
  {
    name: 'generateQuestionFlow',
    inputSchema: GenerateQuestionInputSchema,
    outputSchema: GenerateQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
