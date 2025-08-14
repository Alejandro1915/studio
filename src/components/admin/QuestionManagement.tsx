'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2, MoreVertical, Sparkles, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useToast } from '@/hooks/use-toast'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image'
import { generateQuestion, GenerateQuestionOutput } from '@/ai/flows/generate-question-flow'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'


export type Difficulty = 'Fácil' | 'Normal' | 'Difícil';

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: Difficulty;
  image?: string;
}

const difficultyLevels: Difficulty[] = ['Fácil', 'Normal', 'Difícil'];

const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(10, "La pregunta debe tener al menos 10 caracteres."),
  options: z.array(
    z.string().min(1, "La opción no puede estar vacía.")
  ).min(4, "Debe haber 4 opciones.").max(4, "Solo puede haber 4 opciones."),
  answer: z.string().min(1, "Debes seleccionar una respuesta correcta."),
  difficulty: z.enum(difficultyLevels, { required_error: "Debes seleccionar una dificultad." }),
  image: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
}).refine(data => data.options.includes(data.answer), {
    message: "La respuesta correcta debe ser una de las opciones.",
    path: ["answer"],
});


const QuestionForm = ({ question, onSave, onOpenChange, generatedData }: { question?: Question | null, onSave: () => void, onOpenChange: (open: boolean) => void, generatedData?: GenerateQuestionOutput | null }) => {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof questionSchema>>({
        resolver: zodResolver(questionSchema),
        defaultValues: generatedData || (question ? { ...question } : {
            question: '',
            options: ['', '', '', ''],
            answer: '',
            difficulty: 'Normal',
            image: ''
        }),
        mode: 'onChange'
    });
    
    useEffect(() => {
      if (generatedData) {
        form.reset(generatedData)
      }
    }, [generatedData, form]);

    const watchedOptions = form.watch('options');

    const onSubmit = async (data: z.infer<typeof questionSchema>) => {
        try {
            const dataToSave = {
              question: data.question,
              options: data.options,
              answer: data.answer,
              difficulty: data.difficulty,
              image: data.image,
            };

            if (question?.id) {
                const questionRef = doc(db, 'questions', question.id);
                await updateDoc(questionRef, dataToSave);
                toast({ title: 'Éxito', description: 'Pregunta actualizada correctamente.' });
            } else {
                await addDoc(collection(db, 'questions'), dataToSave);
                toast({ title: 'Éxito', description: 'Pregunta creada correctamente.' });
            }
            onSave();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la pregunta.' });
            console.error(error);
        }
    };
    
    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{question ? 'Editar Pregunta' : 'Añadir Nueva Pregunta'}</DialogTitle>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="question" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pregunta</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="difficulty" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dificultad</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un nivel de dificultad" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {difficultyLevels.map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <FormMessage />
                        </FormItem>
                    )} />

                    <FormField
                        control={form.control}
                        name="answer"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Opciones (marca la correcta)</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="space-y-2"
                                    >
                                        {[0, 1, 2, 3].map((index) => (
                                            <FormField
                                                key={index}
                                                control={form.control}
                                                name={`options.${index}`}
                                                render={({ field: optionField }) => (
                                                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3">
                                                         <FormControl>
                                                            <RadioGroupItem 
                                                                value={watchedOptions?.[index] || `option-${index}`}
                                                                checked={field.value === watchedOptions?.[index]}
                                                                disabled={!watchedOptions?.[index]}
                                                            />
                                                        </FormControl>
                                                        <div className="w-full">
                                                            <FormLabel className="sr-only" htmlFor={`option-input-${index}`}>
                                                                Opción {index + 1}
                                                            </FormLabel>
                                                            <Input 
                                                                {...optionField}
                                                                id={`option-input-${index}`}
                                                                placeholder={`Opción ${index + 1}`}
                                                            />
                                                            <FormMessage className="mt-2" />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField control={form.control} name="image" render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL de la Imagen (Opcional)</FormLabel>
                            <FormControl><Input placeholder="https://placehold.co/600x300.png" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="flex justify-between items-center">
                        <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Pregunta'}
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    )
}

const getDifficultyBadgeVariant = (difficulty: Difficulty) => {
    switch(difficulty) {
        case 'Fácil': return 'default';
        case 'Normal': return 'secondary';
        case 'Difícil': return 'destructive';
        default: return 'outline';
    }
}

const QuestionItem = ({ question, onEdit, onDelete }: { question: Question, onEdit: (question: Question) => void, onDelete: (id: string) => void }) => {
    return (
        <div className="border p-4 rounded-lg flex justify-between items-center gap-4">
             {question.image && (
                <div className="relative w-20 h-[45px] rounded-md overflow-hidden flex-shrink-0">
                    <Image src={question.image} alt="Vista previa de la pregunta" fill objectFit="cover" data-ai-hint="question preview" />
                </div>
            )}
            <p className="font-medium flex-1">{question.question}</p>
            <Badge variant={getDifficultyBadgeVariant(question.difficulty)} className="whitespace-nowrap">
                {question.difficulty}
            </Badge>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                        <span className="sr-only">Abrir menú</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(question)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(question.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

const GenerateQuestionDialog = ({ onQuestionGenerated }: { onQuestionGenerated: (data: GenerateQuestionOutput) => void }) => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!topic) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, introduce un tema.' });
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateQuestion({ topic });
            onQuestionGenerated(result);
        } catch (error) {
            console.error("Error generating question:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo generar la pregunta.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Generar Pregunta con IA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <p>Introduce un tema de anime (p. ej., "Naruto", "Studio Ghibli") y la IA creará una pregunta de trivia para ti.</p>
                <Input
                    placeholder="Tema del anime..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading}
                />
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                    {isLoading ? 'Generando...' : 'Generar Pregunta'}
                </Button>
            </div>
        </DialogContent>
    );
};


export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [generatedData, setGeneratedData] = useState<GenerateQuestionOutput | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const { toast } = useToast();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        setQuestions(questionsData);
    } catch(error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las preguntas.' });
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (questionId: string) => {
    try {
        await deleteDoc(doc(db, 'questions', questionId));
        toast({ title: "Éxito", description: "Pregunta eliminada correctamente." });
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la pregunta.' });
        console.error("Error al eliminar la pregunta:", error);
    }
  }

  const handleAddClick = () => {
      setSelectedQuestion(null);
      setGeneratedData(null);
      setIsQuestionFormOpen(true);
  }

  const handleEditClick = (question: Question) => {
      setSelectedQuestion(question);
      setGeneratedData(null);
      setIsQuestionFormOpen(true);
  }

  const handleDialogSave = () => {
    fetchQuestions();
    setIsQuestionFormOpen(false);
    setSelectedQuestion(null);
    setGeneratedData(null);
  }
  
  const handleQuestionFormOpenChange = (open: boolean) => {
      setIsQuestionFormOpen(open);
      if(!open) {
          setSelectedQuestion(null);
          setGeneratedData(null);
      }
  }

  const handleQuestionGenerated = (data: GenerateQuestionOutput) => {
      setGeneratedData(data);
      setIsGenerateDialogOpen(false);
      setSelectedQuestion(null); // Ensure we are in "add" mode
      setIsQuestionFormOpen(true);
  }
  
  const filteredQuestions = questions.filter(q => 
    difficultyFilter === 'all' || q.difficulty === difficultyFilter
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Gestión de Preguntas</CardTitle>
            <CardDescription>Añade, edita o elimina las preguntas del quiz.</CardDescription>
        </div>
        <div className="flex gap-2">
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Sparkles className="mr-2" />
                        Generar con IA
                    </Button>
                </DialogTrigger>
                <GenerateQuestionDialog onQuestionGenerated={handleQuestionGenerated} />
            </Dialog>

            <Dialog open={isQuestionFormOpen} onOpenChange={handleQuestionFormOpenChange}>
                <DialogTrigger asChild>
                    <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2" />
                        Añadir Pregunta
                    </Button>
                </DialogTrigger>
                {isQuestionFormOpen && <QuestionForm question={selectedQuestion} onSave={handleDialogSave} onOpenChange={handleQuestionFormOpenChange} generatedData={generatedData} />}
            </Dialog>
         </div>
      </CardHeader>
      <CardContent>
         <div className="mb-6">
            <Label htmlFor="difficulty-filter">Filtrar por dificultad</Label>
            <Select 
                value={difficultyFilter} 
                onValueChange={(value) => setDifficultyFilter(value as Difficulty | 'all')}
            >
                <SelectTrigger id="difficulty-filter" className="w-[180px]">
                    <SelectValue placeholder="Filtrar por dificultad" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Mostrar Todas</SelectItem>
                    <SelectItem value="Fácil">Fácil</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Difícil">Difícil</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {loading ? (
            <p>Cargando preguntas...</p>
        ) : (
            <div className="space-y-4">
                {filteredQuestions.map((q) => (
                    <QuestionItem 
                        key={q.id}
                        question={q}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  )
}
