import { Achievement, Rarity } from '@/lib/achievements';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

const rarityColors: Record<Rarity, string> = {
    "Común": "border-gray-400",
    "Raro": "border-blue-400",
    "Épico": "border-purple-500",
    "Legendario": "border-yellow-400",
};

export function AchievementCard({ achievement, isUnlocked }: { achievement: Achievement, isUnlocked: boolean }) {
    const { name, description, Icon, rarity } = achievement;
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className={cn(
                        "transition-all duration-300 border-2",
                        isUnlocked ? rarityColors[rarity] : "border-muted-foreground/20",
                        isUnlocked ? 'shadow-lg' : 'shadow-none',
                        isUnlocked && rarity === 'Épico' ? 'shadow-purple-500/20' : '',
                        isUnlocked && rarity === 'Legendario' ? 'shadow-yellow-400/20' : '',
                    )}>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                            <div className={cn(
                                "relative w-16 h-16 flex items-center justify-center rounded-full",
                                isUnlocked ? 'bg-primary/10' : 'bg-muted'
                            )}>
                                <Icon className={cn(
                                    "w-8 h-8",
                                    isUnlocked ? 'text-primary' : 'text-muted-foreground'
                                )} />
                                {!isUnlocked && <Lock className="absolute w-4 h-4 bottom-1 right-1 text-muted-foreground" />}
                            </div>
                             <h3 className={cn(
                                "font-headline text-lg",
                                !isUnlocked && 'text-muted-foreground'
                             )}>
                                {name}
                             </h3>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-bold">{name} ({rarity})</p>
                    <p>{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
