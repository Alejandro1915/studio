'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Loader2, Search, Send } from 'lucide-react';

interface FoundUser {
    id: string;
    name: string;
    photoURL?: string;
}

export default function InviteFriendDialog({ setIsInviteOpen }: { setIsInviteOpen: (isOpen: boolean) => void }) {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [foundUsers, setFoundUsers] = useState<FoundUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim() || !currentUser) return;
        setIsLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('name', '>=', searchQuery),
                where('name', '<=', searchQuery + '\uf8ff'),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as FoundUser))
                .filter(u => u.id !== currentUser.uid); // Exclude self
            setFoundUsers(users);
        } catch (error) {
            console.error("Error searching users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo buscar jugadores.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleInvite = async (invitedUser: FoundUser) => {
        if (!currentUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para crear una sala.' });
            return;
        }
        setIsCreatingRoom(true);
        try {
            const gameRef = await addDoc(collection(db, 'games'), {
                hostId: currentUser.uid,
                players: [{ uid: currentUser.uid, name: currentUser.name, photoURL: currentUser.photoURL, score: 0 }],
                status: 'waiting',
                createdAt: serverTimestamp(),
                // We could add an 'invites' field here in the future
            });
            toast({ title: 'Sala Creada', description: 'Redirigiendo a la sala de espera...' });
            router.push(`/game/${gameRef.id}`);
            setIsInviteOpen(false);
        } catch (error) {
            console.error("Error creating game room:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la sala de juego.' });
        } finally {
            setIsCreatingRoom(false);
        }
    }


    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Invitar a un Amigo</DialogTitle>
                <DialogDescription>
                    Busca a un jugador por su apodo y envíale un desafío.
                </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
                <Input
                    placeholder="Apodo del jugador..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
            </div>
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {foundUsers.length > 0 ? (
                    foundUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user.photoURL} />
                                    <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-bold">{user.name}</span>
                            </div>
                            <Button size="sm" onClick={() => handleInvite(user)} disabled={isCreatingRoom}>
                               {isCreatingRoom ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Invitar
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-sm text-muted-foreground pt-4">
                        {searchQuery ? 'No se encontraron jugadores.' : 'Escribe un nombre para buscar.'}
                    </p>
                )}
            </div>
        </DialogContent>
    );
}
