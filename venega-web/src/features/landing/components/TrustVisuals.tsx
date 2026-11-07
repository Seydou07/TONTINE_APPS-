'use client';

import { BellRing, CheckCircle2, Fingerprint, Lock, ScanFace, Users } from 'lucide-react';
import { useCountUp, useInView } from './motion';

function FlowTrack({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <span aria-hidden className="relative mx-1 h-[2px] flex-1 rounded-full bg-line">
      <span className="lp-flow absolute inset-0" style={{ animationDelay: `${delayMs}ms` }}>
        <span className="absolute -top-[3px] left-0 h-2 w-2 rounded-full bg-amber" />
      </span>
    </span>
  );
}

/** Le circuit de l'argent : membres → opérateur Mobile Money → bénéficiaire. */
export function MoneyFlowVisual() {
  return (
    <div className="rounded-[16px] border border-line bg-fill/60 p-3.5">
      <div className="flex items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-line">
          <Users size={18} />
        </span>
        <FlowTrack />
        <span className="flex h-10 shrink-0 items-center rounded-[12px] bg-primary px-2.5 text-[11.5px] font-semibold text-white">
          Mobile Money
        </span>
        <FlowTrack delayMs={1100} />
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[12px] font-bold text-primary-dark ring-2 ring-primary">
          MO
        </span>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>Membres</span>
        <span>Opérateur</span>
        <span>Bénéficiaire</span>
      </div>
    </div>
  );
}

/** Code secret saisi chez l'opérateur. */
export function SecretCodeVisual() {
  return (
    <div className="rounded-[16px] border border-line bg-white p-3.5">
      <div className="flex items-center justify-between text-[11.5px]">
        <span className="font-semibold text-ink">Fenêtre de l’opérateur</span>
        <Lock size={13} className="text-primary" />
      </div>
      <div className="mt-2 flex h-10 items-center justify-center gap-3 rounded-[12px] bg-fill">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="lp-type h-2.5 w-2.5 rounded-full bg-ink" style={{ animationDelay: `${i * 350}ms` }} />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted">Venega ne voit pas ce code.</p>
    </div>
  );
}

/* Petites illustrations animées de la section « Confiance ». Valeurs : exemple. */

export function ReliabilityVisual() {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  const score = useCountUp(94, inView);
  return (
    <div ref={ref} className="rounded-[16px] border border-line bg-fill/60 p-3.5">
      <div className="flex items-end justify-between">
        <p className="text-[12px] text-muted">Fiabilité globale</p>
        <span className="rounded-full bg-primary-tint px-2 py-0.5 text-[11px] font-semibold text-primary-dark">Excellent</span>
      </div>
      <p className="text-[28px] font-bold tabular-nums text-ink">{score}%</p>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
        <div className="lp-bar h-full w-full rounded-full bg-primary" style={{ transform: `scaleX(${score / 100})` }} />
      </div>
      <div className="mt-3 grid grid-cols-3 text-center text-[11px] text-muted">
        <span>
          <b className="block text-[15px] text-ink">12</b>À temps
        </span>
        <span>
          <b className="block text-[15px] text-ink">1</b>En retard
        </span>
        <span>
          <b className="block text-[15px] text-ink">0</b>Manquées
        </span>
      </div>
    </div>
  );
}

export function KycVisual() {
  const items = ['CNIB recto', 'CNIB verso', 'Selfie'];
  return (
    <div className="space-y-1.5">
      {items.map((label, i) => (
        <div key={label} className="flex items-center gap-2.5 rounded-[12px] border border-line bg-white px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary-tint text-primary">
            <ScanFace size={15} />
          </span>
          <span className="flex-1 text-[13px] text-ink">{label}</span>
          <span data-reveal="zoom" className="inline-flex" style={{ ['--lp-delay' as string]: `${400 + i * 350}ms` }}>
            <CheckCircle2 size={18} className="text-primary" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function ReminderVisual() {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className="relative">
      <div
        data-reveal
        className="flex items-start gap-2.5 rounded-[14px] border border-line bg-white p-3 shadow-sm"
        style={{ ['--lp-delay' as string]: '300ms' }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-tint text-amber-dark">
          <BellRing size={16} className={inView ? 'lp-blink' : ''} />
        </span>
        <div className="text-[12.5px] leading-snug">
          <p className="font-semibold text-ink">Rappel de cotisation</p>
          <p className="text-muted">Tontine du marché : 10 000 F à verser avant demain.</p>
        </div>
      </div>
    </div>
  );
}

export function LockVisual() {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className="flex items-center gap-3 rounded-[16px] border border-line bg-white p-3">
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary">
        {inView && <span className="lp-halo absolute inset-0 rounded-full border-2 border-primary/40" />}
        <Fingerprint size={24} />
      </span>
      <div className="text-[12.5px] leading-snug">
        <p className="font-semibold text-ink">Déverrouiller Venega</p>
        <p className="text-muted">Empreinte, code ou schéma du téléphone</p>
      </div>
    </div>
  );
}
