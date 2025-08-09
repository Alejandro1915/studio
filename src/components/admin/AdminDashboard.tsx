'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserManagement from "./UserManagement"
import QuestionManagement from "./QuestionManagement"

export default function AdminDashboard() {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
        <TabsTrigger value="questions">Gestión de Preguntas</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <UserManagement />
      </TabsContent>
      <TabsContent value="questions">
        <QuestionManagement />
      </TabsContent>
    </Tabs>
  )
}
