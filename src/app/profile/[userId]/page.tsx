import UserProfile from "@/components/auth/UserProfile";
import { Suspense } from "react";

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Suspense fallback={<div>Cargando perfil...</div>}>
        <UserProfile userId={userId} />
      </Suspense>
    </div>
  );
}