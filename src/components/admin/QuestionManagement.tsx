'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2, MoreVertical } from 'lucide-react'
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


const QuestionForm = ({ question, onSave, onOpenChange }: { question?: Question | null, onSave: () => void, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof questionSchema>>({
        resolver: zodResolver(questionSchema),
        defaultValues: question ? { ...question } : {
            question: '',
            options: ['', '', '', ''],
            answer: '',
            difficulty: 'Normal',
            image: ''
        },
        mode: 'onChange'
    });

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
                            <FormControl><Input {...field} /></FormControl>
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


export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
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
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta pregunta? Esto no se puede deshacer.")) return;
    
    try {
        const questionRef = doc(db, 'questions', questionId);
        await deleteDoc(questionRef);
        toast({ title: "Éxito", description: "Pregunta eliminada correctamente." });
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la pregunta.' });
        console.error("Error al eliminar la pregunta:", error);
    }
  }

  const handleAddClick = () => {
      setSelectedQuestion(null);
      setIsDialogOpen(true);
  }

  const handleEditClick = (question: Question) => {
      setSelectedQuestion(question);
      setIsDialogOpen(true);
  }

  const handleDialogSave = () => {
    fetchQuestions();
    setIsDialogOpen(false);
    setSelectedQuestion(null);
  }
  
  const handleDialogChange = (open: boolean) => {
      setIsDialogOpen(open);
      if(!open) {
          setSelectedQuestion(null);
      }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Gestión de Preguntas</CardTitle>
            <CardDescription>Añade, edita o elimina las preguntas del quiz.</CardDescription>
        </div>
         <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button onClick={handleAddClick}>
                    <PlusCircle className="mr-2" />
                    Añadir Pregunta
                </Button>
            </DialogTrigger>
            {isDialogOpen && <QuestionForm question={selectedQuestion} onSave={handleDialogSave} onOpenChange={handleDialogChange}/>}
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
            <p>Cargando preguntas...</p>
        ) : (
            <div className="space-y-4">
                {questions.map((q) => (
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
