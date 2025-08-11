import UserProfile from "@/components/auth/UserProfile";
import { Suspense } from "react";

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Suspense fallback={<div>Cargando perfil...</div>}>
        <UserProfile userId={params.userId} />
      </Suspense>
    </div>
  );
}