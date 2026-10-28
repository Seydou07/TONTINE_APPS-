/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Logo Venega d'origine (vert + ambre), jamais recoloré.
 * Sur fond vert : toujours posé sur une carte blanche arrondie (`onDark`).
 */
export function BrandLogo({ size = 48, onDark = false, className }: { size?: number; onDark?: boolean; className?: string }) {
  const img = <img src="/venega-logo.png" alt="Venega" width={size} height={size} style={{ width: size, height: size }} className="object-contain" />;
  if (!onDark) return <span className={cn('inline-flex', className)}>{img}</span>;
  return <span className={cn('inline-flex rounded-lg bg-white p-1.5', className)}>{img}</span>;
}
