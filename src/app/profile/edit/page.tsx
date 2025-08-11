import { ProfileForm } from '@/components/auth/ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditProfilePage() {
  return (
    <div className="container flex h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Editar Perfil</CardTitle>
          <CardDescription>
            Actualiza tu apodo y tu foto de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}