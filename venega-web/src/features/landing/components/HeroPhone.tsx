'use client';

import { useState } from 'react';
import { CheckCircle2, Coins } from 'lucide-react';
import { MiniAvatar, MiniHero, PhoneFrame } from './PhoneFrame';
import { useTicker } from './motion';

/*
 * Maquette animée de l'écran « Tontine » de l'app : les cotisations du tour
 * arrivent une à une, puis la cagnotte est versée et la roue de rotation
 * tourne vers le bénéficiaire suivant. Personnes et montants : exemple.
 */

const MEMBERS = [
  'Awa Zongo',
  'Salif Kaboré',
  'Mariam Ouédraogo',
  'Issa Sawadogo',
  'Fatim Traoré',
  'Boukary Ilboudo',
  'Rasmata Compaoré',
  'Adama Nikiéma',
];
const N = MEMBERS.length;
const AMOUNT = 10_000;
const WHEEL = 212;
const RADIUS = 84;
const AV = 38;
const STEP_DEG = 360 / N;

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

interface State {
  /** Nombre de tours passés depuis le début (le bénéficiaire est step % N). */
  step: number;
  /** Cotisations reçues pour le tour en cours. */
  paid: number;
  payout: boolean;
}

export function HeroPhone() {
  const [s, setS] = useState<State>({ step: 2, paid: 5, payout: false });

  useTicker(true, 1500, () =>
    setS((prev) => {
      if (prev.payout) return { step: prev.step + 1, paid: 4, payout: false };
      if (prev.paid + 1 >= N) return { ...prev, paid: N, payout: true };
      return { ...prev, paid: prev.paid + 1 };
    }),
  );

  const b = s.step % N;
  const beneficiary = MEMBERS[b]!;
  const lastPayer = MEMBERS[(b + s.paid) % N]!;
  const rotation = -s.step * STEP_DEG;

  return (
    <PhoneFrame label="Écran Tontine de l'application Venega : les cotisations arrivent et la roue passe au bénéficiaire suivant.">
      <MiniHero eyebrow="Tontine en argent" title="Tontine du marché" subtitle={`${N} membres · ${fmt(AMOUNT)} F CFA par tour`} />

      {/* Notification de cotisation */}
      <div className="pointer-events-none absolute inset-x-3 bottom-4 z-20">
        {s.paid > 4 || s.payout ? (
          <div
            key={`${s.step}-${s.paid}-${s.payout}`}
            className="lp-pop flex items-center gap-2.5 rounded-[14px] border border-line bg-white px-3 py-2 shadow-md"
          >
            {s.payout ? (
              <>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-tint text-amber-dark">
                  <Coins size={16} />
                </span>
                <div className="min-w-0 text-[11.5px] leading-tight">
                  <p className="font-semibold text-ink">Cagnotte versée</p>
                  <p className="truncate text-muted">
                    {fmt(AMOUNT * N)} F à {beneficiary}
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-primary">
                  <CheckCircle2 size={16} />
                </span>
                <div className="min-w-0 text-[11.5px] leading-tight">
                  <p className="font-semibold text-ink">Cotisation reçue</p>
                  <p className="truncate text-muted">
                    {lastPayer} · {fmt(AMOUNT)} F
                  </p>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Cagnotte du tour */}
      <div className="mx-3 -mt-3 rounded-[16px] border border-line bg-white p-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[11.5px] text-muted">Cagnotte du tour</p>
          <p className="text-[11.5px] font-semibold text-primary">
            {s.paid}/{N} ont cotisé
          </p>
        </div>
        <p className="mt-0.5 text-[19px] font-bold tabular-nums text-ink">
          {fmt(s.paid * AMOUNT)} <span className="text-[12px] font-semibold text-muted">/ {fmt(N * AMOUNT)} F CFA</span>
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-fill">
          <div className="lp-bar h-full w-full rounded-full bg-primary" style={{ transform: `scaleX(${s.paid / N})` }} />
        </div>
      </div>

      {/* Roue de rotation */}
      <div className="mx-3 mt-2.5 rounded-[16px] border border-line bg-white px-3 pb-3 pt-2.5">
        <p className="text-[12.5px] font-semibold text-ink">Tour actuel de rotation</p>
        <div className="relative mx-auto mt-1" style={{ width: WHEEL, height: WHEEL }}>
          {/* Centre */}
          <div className="absolute left-1/2 top-1/2 flex h-[94px] w-[94px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-primary-tint px-2 text-center">
            <span className="text-[10px] text-muted">Bénéficiaire</span>
            <span key={beneficiary} className="lp-pop text-[12.5px] font-bold leading-tight text-primary-dark">
              {beneficiary.split(' ')[0]}
            </span>
            <span className="text-[10px] text-primary">
              Tour {b + 1} sur {N}
            </span>
          </div>

          {/* Halo fixe en haut : le bénéficiaire y arrive après chaque rotation */}
          <span
            className="lp-halo absolute rounded-full border-2 border-primary/50"
            style={{ width: AV, height: AV, left: WHEEL / 2 - AV / 2, top: WHEEL / 2 - RADIUS - AV / 2 }}
          />

          <div
            className="lp-wheel absolute inset-0 transition-transform duration-[1100ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {MEMBERS.map((name, i) => {
              const angle = ((i * STEP_DEG - 90) * Math.PI) / 180;
              const cx = WHEEL / 2 + RADIUS * Math.cos(angle);
              const cy = WHEEL / 2 + RADIUS * Math.sin(angle);
              const isB = i === b;
              const served = i < b;
              const ring = isB ? 'border-primary' : served ? 'border-amber' : 'border-line-strong';
              return (
                <span
                  key={name}
                  className={`lp-wheel-item absolute flex items-center justify-center rounded-full border-2 bg-white transition-transform duration-[1100ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${ring}`}
                  style={{
                    width: AV,
                    height: AV,
                    left: cx - AV / 2,
                    top: cy - AV / 2,
                    transform: `rotate(${-rotation}deg)`,
                  }}
                >
                  <MiniAvatar name={name} size={AV - 6} />
                </span>
              );
            })}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-muted">
          <Legend className="bg-primary" label="Bénéficiaire" />
          <Legend className="bg-amber" label="Déjà servi" />
          <Legend className="bg-line-strong" label="En attente" />
        </div>
      </div>
    </PhoneFrame>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}
