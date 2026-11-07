'use client';

import { useState } from 'react';
import { BadgeCheck, CheckCircle2, Coins, Eye, HandHeart, ThumbsUp, Users, type LucideIcon } from 'lucide-react';
import { MiniAvatar } from './PhoneFrame';
import { useInView, useTicker } from './motion';

/*
 * Caisse de solidarité : le cycle complet d'une aide, animé.
 * Cotisation → demande → vote des membres → validation du bureau → décaissement.
 * Noms et montants : exemple d'illustration.
 */

const STAGES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Coins, title: 'Cotisation régulière', text: 'Chaque membre alimente la caisse au rythme choisi par le groupe.' },
  { icon: HandHeart, title: 'Demande d’aide', text: 'Un membre en difficulté fait sa demande, avec le motif et le montant.' },
  { icon: ThumbsUp, title: 'Vote des membres', text: 'Les membres votent pour ou contre, depuis l’app ou le site.' },
  { icon: BadgeCheck, title: 'Validation du bureau', text: 'Les validateurs désignés donnent leur accord avant tout versement.' },
  { icon: Eye, title: 'Décaissement visible', text: 'L’aide est versée par Mobile Money et inscrite au journal de la caisse.' },
];

const CONTRIBS = ['Awa Zongo', 'Issa Sawadogo', 'Fatim Traoré'];
const VOTERS = 8;

export function SolidarityDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [frame, setFrame] = useState(0);
  useTicker(inView, 2600, () => setFrame((f) => (f + 1) % (STAGES.length + 1)));
  // Sans animation (ou avant l'entrée à l'écran côté serveur) : tout le cycle est affiché.
  const stage = inView ? Math.min(frame, STAGES.length - 1) : STAGES.length - 1;

  const votesFor = stage >= 2 ? 6 : 0;
  const votesAgainst = stage >= 2 ? 1 : 0;
  const balance = stage >= 4 ? 136_000 : 186_000;

  return (
    <div ref={ref} className="grid items-start gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
      {/* Étapes */}
      <ol className="relative">
        <span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-[2px] bg-line" />
        <span
          aria-hidden
          className="lp-bar absolute bottom-6 left-[21px] top-6 w-[2px] origin-top bg-primary"
          style={{ transform: `scaleY(${stage / (STAGES.length - 1)})`, transformOrigin: 'top' }}
        />
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const on = i <= stage;
          return (
            <li key={s.title} className="relative flex gap-4 pb-5 last:pb-0" data-reveal style={{ ['--lp-delay' as string]: `${i * 80}ms` }}>
              <button
                type="button"
                onClick={() => setFrame(i)}
                aria-label={s.title}
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                  on ? 'border-primary bg-primary text-white' : 'border-line bg-white text-muted'
                }`}
              >
                <Icon size={20} />
              </button>
              <div className={`pt-1 transition-opacity duration-500 ${i === stage ? 'opacity-100' : on ? 'opacity-80' : 'opacity-50'}`}>
                <p className="text-[16px] font-bold text-ink">{s.title}</p>
                <p className="mt-0.5 text-[14.5px] leading-snug text-muted">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Carte de la caisse */}
      <div data-reveal="right" className="rounded-[24px] border border-line bg-white p-4 shadow-[0_24px_50px_-28px_rgba(7,75,54,0.35)] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-amber-tint text-amber-dark">
              <Users size={20} />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold text-ink">Entraide des commerçantes</p>
              <p className="text-[12.5px] text-muted">Caisse de solidarité · {VOTERS} membres</p>
            </div>
          </div>
          <span className="rounded-full bg-fill px-2.5 py-1 text-[11px] font-semibold text-muted">Exemple</span>
        </div>

        <div className="mt-4 rounded-[16px] bg-primary-dark p-4 text-white">
          <p className="text-[12px] text-white/70">Solde de la caisse</p>
          <p key={balance} className="lp-pop text-[24px] font-bold tabular-nums">
            {new Intl.NumberFormat('fr-FR').format(balance)} F CFA
          </p>
        </div>

        {/* Cotisations */}
        <p className="mt-4 text-[13px] font-semibold text-ink">Dernières cotisations</p>
        <ul className="mt-2 space-y-1.5">
          {CONTRIBS.map((n, i) => (
            <li
              key={n}
              className={`flex items-center gap-2.5 rounded-[12px] border border-line px-3 py-2 ${stage === 0 ? 'lp-pop' : ''}`}
              style={{ animationDelay: `${i * 220}ms` }}
            >
              <MiniAvatar name={n} size={26} />
              <span className="flex-1 text-[13px] text-ink">{n}</span>
              <span className="text-[13px] font-semibold text-primary">+2 000 F</span>
            </li>
          ))}
        </ul>

        {/* Demande d'aide */}
        <div
          className="mt-4 rounded-[16px] border border-line p-3.5 transition-[opacity,transform] duration-500"
          style={{ opacity: stage >= 1 ? 1 : 0.35, transform: stage >= 1 ? 'none' : 'translateY(6px)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <MiniAvatar name="Mariam Ouédraogo" size={32} />
              <div className="leading-tight">
                <p className="text-[14px] font-semibold text-ink">Mariam O. · 50 000 F CFA</p>
                <p className="text-[12.5px] text-muted">Demande d’aide : frais d’hospitalisation</p>
              </div>
            </div>
            <StatusBadge stage={stage} />
          </div>

          {/* Vote */}
          <div className="mt-3">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted">Vote des membres</span>
              <span className="font-semibold text-ink tabular-nums">
                {votesFor} pour · {votesAgainst} contre
              </span>
            </div>
            <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-fill">
              <div className="lp-bar absolute inset-0 rounded-full bg-primary" style={{ transform: `scaleX(${votesFor / VOTERS})` }} />
              <div
                className="lp-bar absolute inset-0 origin-right rounded-full bg-danger/70"
                style={{ transform: `scaleX(${votesAgainst / VOTERS})`, transformOrigin: 'right center' }}
              />
            </div>
          </div>

          {/* Bureau */}
          <div className="mt-3 flex flex-wrap gap-2">
            {['Trésorière', 'Président'].map((role, i) => {
              const ok = stage >= 3;
              return (
                <span
                  key={role}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors duration-500 ${
                    ok ? 'border-primary/30 bg-primary-tint text-primary-dark' : 'border-line text-muted'
                  }`}
                  style={{ transitionDelay: `${i * 250}ms` }}
                >
                  <CheckCircle2 size={13} className="transition-opacity duration-500" style={{ opacity: ok ? 1 : 0.3 }} />
                  {role} {ok ? 'a validé' : 'en attente'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Journal */}
        {stage >= 4 ? (
          <div key="paid" className="lp-pop mt-3 flex min-h-[56px] items-center gap-2.5 rounded-[12px] bg-amber-tint px-3 py-2.5">
            <Eye size={16} className="shrink-0 text-amber-dark" />
            <p className="text-[12.5px] text-ink">
              <b>50 000 F</b> versés à Mariam O. par Orange Money · inscrit au journal, visible par tous.
            </p>
          </div>
        ) : (
          <div key="wait" className="mt-3 flex min-h-[56px] items-center gap-2.5 rounded-[12px] border border-dashed border-line-strong px-3 py-2.5">
            <Eye size={16} className="shrink-0 text-subtle" />
            <p className="text-[12.5px] text-muted">Aucun versement sans le vote des membres et l’accord du bureau.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ stage }: { stage: number }) {
  const [label, cls] =
    stage >= 4
      ? ['Versée', 'bg-primary text-white']
      : stage >= 3
        ? ['Approuvée', 'bg-primary-tint text-primary-dark']
        : stage >= 2
          ? ['Vote en cours', 'bg-amber-tint text-amber-dark']
          : ['Nouvelle', 'bg-fill text-muted'];
  return (
    <span key={label} className={`lp-pop shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}
