import { Award, ShieldCheck, Star, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Rarity = "Común" | "Raro" | "Épico" | "Legendario";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  Icon: LucideIcon;
}

export const achievementsList: Achievement[] = [
  {
    id: "first-points",
    name: "Primeros Puntos",
    description: "Consigue tus primeros puntos en cualquier modo de juego.",
    rarity: "Común",
    Icon: Star,
  },
  {
    id: "first-win",
    name: "Primera Victoria",
    description: "Gana tu primera partida en cualquier modo.",
    rarity: "Común",
    Icon: Trophy,
  },
  {
    id: "survival-rookie",
    name: "Superviviente Novato",
    description: "Consigue más de 2,000 puntos en el modo Supervivencia.",
    rarity: "Raro",
    Icon: ShieldCheck,
  },
  {
    id: "otaku-master",
    name: "Maestro Otaku",
    description: "Alcanza un puntaje global de 10,000 puntos.",
    rarity: "Épico",
    Icon: Award,
  },
];
