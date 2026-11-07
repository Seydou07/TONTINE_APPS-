'use client';

import { useEffect, useState } from 'react';
import { Check, HeartHandshake, Link2, UserRound } from 'lucide-react';
import { MiniAvatar } from './PhoneFrame';
import { useInView, useTicker, useTweened } from './motion';

/*
 * Cagnotte d'aide publique : un lien partagé, des dons qui arrivent (avec
 * nom ou anonymes, sans compte) et la barre qui se remplit.
 * Tous les montants et noms sont un exemple d'illustration.
 */

const GOAL = 300_000;
const BASE = 142_000;
const DONS = [
  { name: 'Anonyme', amount: 5_000 },
  { name: 'Boukary Ilboudo', amount: 10_000 },
  { name: 'Anonyme', amount: 2_000 },
  { name: 'Rasmata Compaoré', amount: 25_000 },
  { name: 'Salif Kaboré', amount: 3_000 },
];

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

export function AppealDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [count, setCount] = useState(DONS.length);

  // À l'entrée à l'écran, on repart de zéro pour voir les dons arriver.
  useEffect(() => {
    if (inView && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setCount(0);
  }, [inView]);

  useTicker(inView, 1600, () => setCount((c) => (c > DONS.length ? 0 : c + 1)));

  const shown = Math.min(count, DONS.length);
  const total = BASE + DONS.slice(0, shown).reduce((s, d) => s + d.amount, 0);
  const display = useTweened(total);
  const copied = count === 0;

  return (
    <div ref={ref} className="rounded-[24px] border border-line bg-white p-4 shadow-[0_24px_50px_-28px_rgba(7,75,54,0.35)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-amber-tint text-amber-dark">
            <HeartHandshake size={20} />
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-ink">Reconstruire la boutique d’Adama</p>
            <p className="text-[12.5px] text-muted">Cagnotte d’aide · identité vérifiée</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-fill px-2.5 py-1 text-[11px] font-semibold text-muted">Exemple</span>
      </div>

      <div className="mt-4">
        <p className="text-[26px] font-bold tabular-nums text-ink">
          {fmt(display)} <span className="text-[14px] font-semibold text-muted">F CFA</span>
        </p>
        <p className="text-[13px] text-muted">collectés sur un objectif de {fmt(GOAL)} F CFA</p>
        <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-fill">
          <div className="lp-bar h-full w-full rounded-full bg-amber" style={{ transform: `scaleX(${total / GOAL})` }} />
        </div>
      </div>

      {/* Lien partagé */}
      <div className="mt-4 flex items-center gap-2 rounded-[14px] border border-line bg-fill p-1.5 pl-3">
        <Link2 size={16} className="shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink">…/c/K7P2QD</span>
        <span
          className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[12.5px] font-semibold ${
            copied ? 'bg-primary text-white' : 'bg-white text-ink ring-1 ring-line'
          }`}
        >
          {copied ? <Check size={14} /> : null}
          {copied ? 'Lien copié' : 'Partager'}
        </span>
      </div>

      {/* Dons */}
      <p className="mt-4 text-[13px] font-semibold text-ink">Derniers dons</p>
      <ul className="mt-2 h-[146px] space-y-1.5 overflow-hidden">
        {DONS.slice(0, shown)
          .map((d, i) => ({ ...d, i }))
          .reverse()
          .slice(0, 3)
          .map((d) => (
            <li key={d.i} className="lp-pop flex items-center gap-2.5 rounded-[12px] border border-line px-3 py-2">
              {d.name === 'Anonyme' ? (
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-fill text-muted">
                  <UserRound size={14} />
                </span>
              ) : (
                <MiniAvatar name={d.name} size={26} />
              )}
              <span className="flex-1 text-[13px] text-ink">
                {d.name === 'Anonyme' ? 'Don anonyme' : d.name}              </span>
              <span className="text-[13px] font-semibold text-amber-dark">+{fmt(d.amount)} F</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
