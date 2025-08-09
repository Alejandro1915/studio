import { SignupForm } from '@/components/auth/SignupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Crear una Cuenta</CardTitle>
          <CardDescription>
            Elige tu apodo, ingresa tu correo y contraseña para unirte a la batalla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
           <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="underline">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
