'use client';

import React, { createContext, useContext } from 'react';
import type { AdminSession } from './api';
import { roleCan, type Permission } from './permissions';

const Ctx = createContext<AdminSession | null>(null);

export function SessionProvider({ session, children }: { session: AdminSession; children: React.ReactNode }) {
  return <Ctx.Provider value={session}>{children}</Ctx.Provider>;
}

export function useSession(): AdminSession | null {
  return useContext(Ctx);
}

/**
 * Masque les actions non autorisées pour le rôle courant.
 * Simulé côté client : l'API devra refuser ces actions côté serveur (voir permissions.ts).
 */
export function useCan(): (permission: Permission) => boolean {
  const session = useContext(Ctx);
  return (p) => roleCan(session?.role, p);
}
