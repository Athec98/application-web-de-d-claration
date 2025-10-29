import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";

// Définir le type du routeur côté client
type AppRouter = any; // Remplacer par le type de votre routeur si nécessaire

export const trpc = createTRPCReact<AppRouter>();

// Types d'inférence pour les sorties du routeur
export type RouterOutputs = inferRouterOutputs<AppRouter>;
