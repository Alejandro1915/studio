'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo electrónico no válida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await login(values.email, values.password);
  }
  
  async function onGoogleSignIn() {
    await loginWithGoogle();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión con Correo'}
        </Button>
      </form>
      <div className="relative my-4">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">O</span>
      </div>
      <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={form.formState.isSubmitting}>
        <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.6-4.8 1.6-4.53 0-8.32-3.7-8.32-8.29s3.79-8.29 8.32-8.29c2.45 0 4.13.93 5.33 2.05l2.42-2.42C18.4 1.48 15.98.5 12.48.5 5.8 0 0 5.6 0 12.3s5.8 12.3 12.48 12.3c3.2 0 5.7-1.1 7.6-3.05 1.98-1.98 2.58-4.7 2.58-7.98 0-.62-.05-1.14-.15-1.68z"></path></svg>
        Iniciar sesión con Google
      </Button>
    </Form>
  );
}
