import AdminDashboard from "@/components/admin/AdminDashboard";
import { Suspense } from "react";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl md:text-5xl font-headline text-primary mb-2">Panel de Administrador</h1>
      <p className="text-lg text-muted-foreground mb-8">Gestiona usuarios, preguntas y más.</p>
      <Suspense fallback={<div>Cargando panel...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
