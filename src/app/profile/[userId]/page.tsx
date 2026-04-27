import UserProfile from "@/components/auth/UserProfile";
import { Suspense } from "react";

type Params = Promise<{ userId: string }>;

export default async function UserProfilePage(props: { params: Params }) {
  const params = await props.params;
  const userId = params.userId;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Suspense fallback={<div>Cargando perfil...</div>}>
        <UserProfile userId={userId} />
      </Suspense>
    </div>
  );
}