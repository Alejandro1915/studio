'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useToast } from '@/hooks/use-toast'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { cn } from '@/lib/utils'

export interface Question {
  id?: string;
  question: string;
  options: string[];
  answer: string;
  image?: string;
}

const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(10, "La pregunta debe tener al menos 10 caracteres."),
  options: z.array(z.string().min(1, "La opción no puede estar vacía.")).min(4, "Debe haber 4 opciones.").max(4, "Solo puede haber 4 opciones."),
  answer: z.string().min(1, "Debes seleccionar una respuesta correcta."),
  image: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
}).refine(data => data.options.includes(data.answer), {
    message: "La respuesta correcta debe ser una de las opciones.",
    path: ["answer"],
});


const QuestionForm = ({ question, onSave, onOpenChange }: { question?: Question | null, onSave: () => void, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof questionSchema>>({
        resolver: zodResolver(questionSchema),
        defaultValues: question || {
            question: '',
            options: ['', '', '', ''],
            answer: '',
            image: ''
        },
        mode: 'onChange' // Use onChange for better feedback
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "options"
    });

    const onSubmit = async (data: z.infer<typeof questionSchema>) => {
        try {
            if (data.id) {
                const questionRef = doc(db, 'questions', data.id);
                await updateDoc(questionRef, data);
                toast({ title: 'Éxito', description: 'Pregunta actualizada correctamente.' });
            } else {
                await addDoc(collection(db, 'questions'), data);
                toast({ title: 'Éxito', description: 'Pregunta creada correctamente.' });
            }
            onSave();
            onOpenChange(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la pregunta.' });
            console.error(error);
        }
    };

    const currentAnswer = form.watch("answer");

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
                    
                    <FormField
                        control={form.control}
                        name="answer"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Opciones (marca la correcta)</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-2"
                                    >
                                        {fields.map((item, index) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name={`options.${index}`}
                                                render={({ field: optionField }) => (
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <div className="flex items-center gap-2 w-full">
                                                                <RadioGroupItem 
                                                                    value={optionField.value} 
                                                                    id={`option-${index}`} 
                                                                    disabled={!optionField.value}
                                                                />
                                                                <Input 
                                                                    {...optionField} 
                                                                    placeholder={`Opción ${index + 1}`} 
                                                                    onChange={(e) => {
                                                                        const oldValue = optionField.value;
                                                                        const newValue = e.target.value;
                                                                        optionField.onChange(newValue);
                                                                        // If this was the selected answer, update the answer value
                                                                        if (currentAnswer === oldValue) {
                                                                            form.setValue("answer", newValue, { shouldValidate: true });
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </FormControl>
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

                    <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
                        {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Pregunta'}
                    </Button>
                </form>
            </Form>
        </DialogContent>
    )
}


export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  const fetchQuestions = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'questions'));
    const questionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    setQuestions(questionsData);
    setLoading(false);
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id: string) => {
      if (!window.confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) return;
      try {
          await deleteDoc(doc(db, "questions", id));
          toast({ title: "Éxito", description: "Pregunta eliminada correctamente." });
          fetchQuestions();
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la pregunta.' });
          console.error(error);
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Gestión de Preguntas</CardTitle>
            <CardDescription>Añade, edita o elimina las preguntas del quiz.</CardDescription>
        </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddClick}>
                    <PlusCircle className="mr-2" />
                    Añadir Pregunta
                </Button>
            </DialogTrigger>
            {isDialogOpen && <QuestionForm question={selectedQuestion} onSave={fetchQuestions} onOpenChange={setIsDialogOpen}/>}
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
            <p>Cargando preguntas...</p>
        ) : (
            <div className="space-y-4">
                {questions.map(q => (
                    <div key={q.id} className="border p-4 rounded-lg flex justify-between items-center">
                        <p className="font-medium">{q.question}</p>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleEditClick(q)}>
                                <Edit className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id!)} >
                                <Trash2 className="w-4 h-4 text-destructive" />
                           </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  )
}
