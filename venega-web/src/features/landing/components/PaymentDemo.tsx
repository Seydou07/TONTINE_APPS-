'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronLeft, Lock, Smartphone } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { OPERATOR_LIST, OperatorBadge } from './OperatorBadge';
import { useInView, useTicker } from './motion';

/*
 * « Comment ça marche » : le parcours de paiement de l'app, animé étape par
 * étape (choix de l'opérateur → Payer → Confirmer → validation chez
 * l'opérateur → paiement validé). Montant et numéro : exemple.
 */

const STEPS = [
  { title: 'Choisissez l’opérateur', text: 'Orange Money, Moov Money ou Wave, puis « Payer 10 000 F CFA » : le montant exact est sur le bouton.' },
  { title: 'Confirmez le paiement', text: 'Montant, opérateur et numéro sont rappelés avant tout débit.' },
  { title: 'Validez chez l’opérateur', text: 'Votre code secret se tape uniquement dans la fenêtre de votre opérateur, jamais dans Venega.' },
  { title: 'C’est enregistré', text: 'Le paiement est vérifié et apparaît aussitôt dans l’historique du cercle, visible par tous les membres.' },
];

const OPS = OPERATOR_LIST;

const FRAMES_PER_STEP = 4;

export function PaymentDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [frame, setFrame] = useState(1);
  useTicker(inView, 950, () => setFrame((f) => (f + 1) % (STEPS.length * FRAMES_PER_STEP)));

  const step = Math.floor(frame / FRAMES_PER_STEP);
  const sub = frame % FRAMES_PER_STEP;

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
      <ol className="space-y-3">
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li key={s.title} data-reveal style={{ ['--lp-delay' as string]: `${i * 90}ms` }}>
              <button
                type="button"
                onClick={() => setFrame(i * FRAMES_PER_STEP + 1)}
                aria-current={active ? 'step' : undefined}
                className={`relative flex w-full items-start gap-4 overflow-hidden rounded-[20px] border bg-white p-4 text-left transition-colors md:p-5 ${
                  active ? 'border-primary/40' : 'border-line hover:border-line-strong'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold transition-colors ${
                    active ? 'bg-primary text-white' : done ? 'bg-primary-tint text-primary-dark' : 'bg-fill text-muted'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[16px] font-bold text-ink md:text-[17px]">{s.title}</span>
                  <span className="mt-0.5 block text-[14.5px] leading-snug text-muted">{s.text}</span>
                </span>
                {/* Minuteur de l'étape */}
                {active && inView && (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]">
                    <span
                      key={`timer-${frame - sub}`}
                      className="lp-timer block h-full w-full bg-primary"
                      style={{ animationDuration: `${(FRAMES_PER_STEP - sub) * 950}ms` }}
                    />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div data-reveal="zoom" className="relative">
        <PhoneFrame label="Parcours de paiement Mobile Money dans l'application Venega.">
          <div className="flex h-full flex-col bg-[#F4F5F7] px-3.5 pt-11">
            <div key={step} className="lp-screen-in flex-1">
              {step === 0 && <ScreenSelect sub={sub} />}
              {step === 1 && <ScreenConfirm sub={sub} />}
              {step === 2 && <ScreenUssd />}
              {step === 3 && <ScreenDone />}
            </div>
          </div>
          {/* Fenêtre de l'opérateur */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 rounded-t-[22px] border-t border-line bg-white px-4 pb-6 pt-4 shadow-[0_-12px_30px_-12px_rgba(18,38,30,0.25)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: step === 2 && sub >= 1 ? 'translateY(0)' : 'translateY(105%)' }}
          >
            <div className="flex items-center gap-2.5">
              <OperatorBadge op="orange" size={34} />
              <div className="leading-tight">
                <p className="text-[13px] font-bold text-ink">Orange Money</p>
                <p className="text-[11px] text-muted">Paiement à VENEGA · 10 000 F CFA</p>
              </div>
            </div>
            <p className="mt-3 text-[12px] font-semibold text-ink">Entrez votre code secret</p>
            <div className="mt-1.5 flex h-11 items-center justify-center gap-3 rounded-[12px] border border-line bg-fill">
              {[0, 1, 2, 3].map((d) => (
                <span
                  key={d}
                  className="h-2.5 w-2.5 rounded-full bg-ink transition-opacity duration-200"
                  style={{ opacity: sub >= 2 && d < (sub === 2 ? 2 : 4) ? 1 : 0.12 }}
                />
              ))}
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-muted">
              <Lock size={12} /> Fenêtre de l’opérateur : Venega ne voit pas ce code.
            </p>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}

function ScreenHeader({ title, back }: { title: string; back?: boolean }) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      {back && <ChevronLeft size={18} className="text-muted" />}
      <p className="text-[16px] font-bold text-ink">{title}</p>
    </div>
  );
}

function Summary() {
  return (
    <div className="rounded-[14px] border border-line bg-white p-3 text-[12px]">
      <Row label="Cercle" value="Tontine du marché" />
      <Row label="Type" value="Cotisation · tour 3" />
      <Row label="Montant" value="10 000 F CFA" strong />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted">{label}</span>
      <span className={strong ? 'font-bold text-ink' : 'font-medium text-ink'}>{value}</span>
    </div>
  );
}

function ScreenSelect({ sub }: { sub: number }) {
  return (
    <>
      <ScreenHeader title="Paiement Mobile Money" />
      <Summary />
      <p className="mb-2 mt-4 text-[12px] font-semibold text-ink">Choisissez l’opérateur</p>
      <div className="space-y-2">
        {OPS.map((op, i) => {
          const selected = i === 0 && sub >= 1;
          return (
            <div
              key={op.key}
              className={`relative flex items-center gap-2.5 rounded-[12px] border bg-white p-2.5 ${selected ? 'border-primary' : 'border-line'}`}
            >
              <span className="flex w-[48px] justify-center">
                <OperatorBadge op={op.key} size={28} />
              </span>
              <span className="flex-1 text-[12.5px] font-semibold text-ink">{op.label}</span>
              <span className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-line-strong">
                <span
                  className="absolute inset-[-2px] rounded-full border-[5px] border-primary transition-opacity duration-300"
                  style={{ opacity: selected ? 1 : 0 }}
                />
              </span>
            </div>
          );
        })}
      </div>
      <div
        className={`mt-4 flex h-11 items-center justify-center rounded-[12px] bg-primary text-[13px] font-semibold text-white transition-opacity duration-300 ${sub === 3 ? 'lp-press' : ''}`}
        style={{ opacity: sub >= 1 ? 1 : 0.45 }}
      >
        Payer 10 000 F CFA
      </div>
    </>
  );
}

function ScreenConfirm({ sub }: { sub: number }) {
  return (
    <>
      <ScreenHeader title="Confirmer le paiement" back />
      <p className="text-[12.5px] leading-snug text-muted">
        Vous êtes sur le point de payer <b className="text-ink">10 000 F CFA</b> depuis le numéro{' '}
        <b className="text-ink">+226 70 •• •• 12</b>.
      </p>
      <div className="mt-3 rounded-[14px] border border-line bg-white p-3 text-[12px]">
        <Row label="Opérateur" value="Orange Money" />
        <Row label="Numéro" value="+226 70 •• •• 12" />
        <Row label="Montant" value="10 000 F CFA" strong />
      </div>
      <div className={`mt-4 flex h-11 items-center justify-center rounded-[12px] bg-primary text-[13px] font-semibold text-white ${sub === 3 ? 'lp-press' : ''}`}>
        Confirmer le paiement
      </div>
      <div className="mt-2 flex h-11 items-center justify-center rounded-[12px] border border-line bg-white text-[13px] font-semibold text-ink">
        Modifier
      </div>
    </>
  );
}

function ScreenUssd() {
  return (
    <>
      <div className="flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-amber-tint text-amber-dark">
          <Smartphone size={18} />
        </span>
        <div>
          <p className="text-[15px] font-bold text-ink">Validez sur votre téléphone</p>
          <p className="text-[11.5px] text-muted">10 000 F CFA via Orange Money</p>
        </div>
      </div>
      <ol className="mt-3 space-y-2 text-[12px] text-ink">
        {['Composez le code indiqué.', 'Vérifiez le montant et le bénéficiaire « Venega ».', 'Saisissez votre code secret Orange Money.'].map((t, i) => (
          <li key={t} className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[10px] font-bold text-primary-dark">
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>
    </>
  );
}

function ScreenDone() {
  return (
    <div className="flex h-full flex-col items-center pt-16 text-center">
      <span className="lp-pop flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint text-primary">
        <CheckCircle2 size={34} />
      </span>
      <p className="mt-4 text-[17px] font-bold text-ink">Paiement validé</p>
      <p className="mt-1 px-4 text-[12.5px] text-muted">10 000 F CFA ont bien été reçus.</p>
      <div className="mt-6 w-full rounded-[14px] border border-line bg-white p-3 text-left text-[12px]">
        <p className="font-semibold text-ink">Historique du cercle</p>
        <div className="lp-pop mt-2 flex items-center justify-between rounded-[10px] bg-primary-tint/60 px-2.5 py-2" style={{ animationDelay: '250ms' }}>
          <span className="text-ink">Vous · Orange Money</span>
          <span className="font-bold text-primary-dark">+10 000 F</span>
        </div>
      </div>
    </div>
  );
}
