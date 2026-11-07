import React from 'react';
import { cn } from '@/lib/cn';

/** Tableau dense, défilable horizontalement sur tablette. */
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-left text-base', className)}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn('whitespace-nowrap border-b border-line bg-canvas px-3 py-2 text-xs first:pl-4 last:pr-4 font-semibold uppercase tracking-wide text-ink-muted', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('border-b border-line px-3 py-3 align-middle text-ink first:pl-4 last:pr-4', className)}>{children}</td>;
}

export function Tr({
  children,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer hover:bg-brand-tint/50', selected && 'bg-brand-tint/70')}
    >
      {children}
    </tr>
  );
}

/**
 * Colonne d'actions : sur téléphone, reste collée à droite pendant le défilement horizontal
 * du tableau, pour que les boutons soient visibles sans faire défiler.
 */
export const ACTIONS_CELL = 'sticky right-0 z-[1] bg-white shadow-[-1px_0_0_#DDE3E0] lg:static lg:shadow-none';
