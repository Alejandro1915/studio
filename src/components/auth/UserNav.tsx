'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User as UserIcon, Shield, Edit, Swords, Check, X, Mail } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

interface Invitation {
    id: string;
    fromName: string;
    gameId: string;
    status: 'pending' | 'accepted' | 'declined';
}

export function UserNav() {
  const { user, loading, logout } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const invitesRef = collection(db, 'invitations');
    const q = query(invitesRef, where('toUid', '==', user.uid), where('status', '==', 'pending'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const invites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation));
        setInvitations(invites);
    });

    return () => unsubscribe();
  }, [user]);

  const handleInvitation = async (invitation: Invitation, accept: boolean) => {
      if (!user) return;

      const gameRef = doc(db, 'games', invitation.gameId);
      const inviteRef = doc(db, 'invitations', invitation.id);

      if (accept) {
          try {
              // Add the player to the game
              await updateDoc(gameRef, {
                  players: arrayUnion({ uid: user.uid, name: user.name, photoURL: user.photoURL, score: 0 })
              });
              
              // Delete the invitation since it's been handled
              await deleteDoc(inviteRef);

              toast({ title: "¡Desafío aceptado!", description: "Uniéndote a la partida..." });
              router.push(`/game/${invitation.gameId}`);
          } catch(e) {
              console.error("Error accepting invitation: ", e);
              toast({ variant: 'destructive', title: 'Error', description: 'No se pudo unir a la partida. Puede que ya no exista.'});
              // Clean up the invite if joining fails
              await deleteDoc(inviteRef).catch(err => console.error("Failed to cleanup invite", err));
          }
      } else {
          await deleteDoc(inviteRef);
          toast({ title: 'Invitación Rechazada' });
      }
  }

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Iniciar Sesión</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name ?? ''} />}
            <AvatarFallback>{user.name?.[0].toUpperCase() ?? user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
           {invitations.length > 0 && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name ?? 'Usuario'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {invitations.length > 0 && (
            <>
                <DropdownMenuLabel className="flex items-center gap-2 text-primary">
                    <Mail className="w-4 h-4" /> Invitaciones Pendientes <Badge variant="destructive" className="ml-auto">{invitations.length}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuGroup className="max-h-48 overflow-y-auto">
                    {invitations.map(invite => (
                        <DropdownMenuItem key={invite.id} className="flex justify-between items-center gap-2" onSelect={(e) => e.preventDefault()}>
                            <span>Te desafía <span className="font-bold">{invite.fromName}</span></span>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:text-green-500" onClick={() => handleInvitation(invite, true)}>
                                    <Check className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-500" onClick={() => handleInvitation(invite, false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
            </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href={`/profile/${user.uid}`}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Ver Perfil</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <Link href="/profile/edit">
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar Perfil</span>
             </Link>
          </DropdownMenuItem>
          {user.role === 'admin' && (
             <DropdownMenuItem asChild>
                <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Panel de Admin</span>
                </Link>
             </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
