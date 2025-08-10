'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  name: z.string().min(3, { message: 'El apodo debe tener al menos 3 caracteres.' }).max(20, { message: 'El apodo no puede tener más de 20 caracteres.' }),
  email: z.string().email(),
  photoURL: z.string().url("Debe ser una URL de imagen válida.").optional().or(z.literal('')),
  score: z.number().optional(),
});

export function ProfileForm() {
  const { user, loading, updateProfileData } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      photoURL: '',
      score: 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        score: user.score || 0,
      });
    }
  }, [user, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    await updateProfileData({
        name: values.name,
        photoURL: values.photoURL,
    });
  }
  
  if (loading || !user) {
      return (
          <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-full" />
               <Skeleton className="h-10 w-24" />
          </div>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={form.watch('photoURL') || user.photoURL || undefined} />
                <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                 <p className="text-sm font-medium text-primary">{user.score?.toLocaleString() || 0} puntos</p>
            </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apodo</FormLabel>
              <FormControl>
                <Input placeholder="TuApodo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photoURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Foto de Perfil</FormLabel>
              <FormControl>
                <Input placeholder="https://tu-imagen.com/perfil.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  );
}
