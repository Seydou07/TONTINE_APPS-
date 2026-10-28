'use client';

import { Fragment, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Camera, Check, CheckCircle2, Coins, HandHeart, Info, Minus, Package, Plus } from 'lucide-react';
import { mockCurrentUser } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Toggle } from '@/components/ui/Toggle';
import { btnPrimary, card, choiceCard, chip, input, label, textarea } from '@/components/ui/classes';
import { IconTile, SummaryRow } from '@/components/ui/misc';
import { MobileMoneyCheckout } from '@/features/payment/components/MobileMoneyCheckout';
import { formatFcfa } from '@/lib/format';

/** Frais d'activation d'un cercle (payés par le fondateur). */
const ACTIVATION_FEE = 2000;

type Family = 'TONTINE' | 'SOLIDARITY';
type Mode = 'CASH' | 'NATURE';

const FAMILIES = [
  {
    key: 'TONTINE' as const,
    label: 'Tontine',
    desc: 'Chaque membre cotise et reçoit la cagnotte à son tour, en espèces ou en nature.',
    icon: Coins,
  },
  {
    key: 'SOLIDARITY' as const,
    label: 'Caisse de solidarité',
    desc: "Un fonds commun pour aider les membres en cas de besoin, sans rotation.",
    icon: HandHeart,
  },
];

const MODES = [
  { key: 'CASH' as const, label: 'En espèces', desc: 'La cagnotte est versée en argent', icon: Banknote },
  { key: 'NATURE' as const, label: 'En nature', desc: 'Moto, vivres, pagnes, ciment…', icon: Package },
];

const FREQUENCIES = [
  { key: 'DAILY', label: 'Journalière' },
  { key: 'WEEKLY', label: 'Hebdomadaire' },
  { key: 'MONTHLY', label: 'Mensuelle' },
  { key: 'CUSTOM', label: 'Personnalisée' },
];

const KYC_OPTIONS = [
  { key: 'REQUIRE_NONE', label: 'Aucun document', desc: 'Pour des membres de confiance uniquement' },
  { key: 'REQUIRE_CNIB', label: 'CNIB obligatoire', desc: "Une pièce d'identité valide est demandée" },
  { key: 'REQUIRE_CNIB_SELFIE', label: 'CNIB + selfie (recommandé)', desc: 'Vérification la plus sûre' },
];

const LEAVING_RULES = [
  { key: 'BUYOUT_REQUIRED', label: 'Rachat du tour obligatoire', desc: 'Le nouvel entrant rachète les cotisations passées' },
  { key: 'REDUCE_POOL', label: 'Réduction de la cagnotte', desc: "La cagnotte s'ajuste au nombre de membres restants" },
];

const EXCLUSION_OPTIONS = ['2', '3', '4', '5'];
const STEPS = ['Type', 'Paramètres', 'Règles', 'Résumé'];

export function CreateCircleView() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [family, setFamily] = useState<Family>('TONTINE');
  const [mode, setMode] = useState<Mode>('CASH');
  const [natureDescription, setNatureDescription] = useState('');
  const [naturePhoto, setNaturePhoto] = useState<File | null>(null);

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [customDays, setCustomDays] = useState('3');
  const [tontineAmount, setTontineAmount] = useState('10000');
  const [solidarityAmount, setSolidarityAmount] = useState('2000');
  const [managementFee, setManagementFee] = useState('500');
  const [maxMembers, setMaxMembers] = useState('10');

  const [beneficiariesPerTurn, setBeneficiariesPerTurn] = useState(1);
  const [exclusionThreshold, setExclusionThreshold] = useState('3');
  const [depositRequired, setDepositRequired] = useState(false);
  const [kycRequirement, setKycRequirement] = useState('REQUIRE_CNIB_SELFIE');
  const [leavingRule, setLeavingRule] = useState('BUYOUT_REQUIRED');
  const [conditions, setConditions] = useState('');

  const [created, setCreated] = useState<{ name: string; inviteCode: string } | null>(null);

  const usesTontine = family === 'TONTINE';
  // Données : tontine en nature = CircleType.NATURE + contributionMode NATURE.
  const circleType = usesTontine ? (mode === 'NATURE' ? 'NATURE' : 'TONTINE_ONLY') : 'SOLIDARITY_ONLY';
  const typeLabel = usesTontine ? (mode === 'NATURE' ? 'Tontine en nature' : 'Tontine en espèces') : 'Caisse de solidarité';

  const tontine = usesTontine ? parseFloat(tontineAmount) || 0 : 0;
  const solidarity = !usesTontine ? parseFloat(solidarityAmount) || 0 : 0;
  const fee = parseFloat(managementFee) || 0;
  const total = tontine + solidarity + fee;
  const frequencyText =
    frequency === 'CUSTOM' ? `Tous les ${customDays} jours` : FREQUENCIES.find((f) => f.key === frequency)?.label ?? '';

  const canContinueStep1 = !(usesTontine && mode === 'NATURE' && !natureDescription.trim());

  const handleCreate = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const code = prefix + Math.floor(1000 + Math.random() * 9000).toString();
    // TODO: POST /circles avec { type: circleType, contributionMode: mode, ... } via l'API Venega.
    void circleType;
    setCreated({ name: name.trim(), inviteCode: code });
  };

  const goBack = () => (step > 1 ? setStep(step - 1) : router.back());

  // ── Cercle créé : activation par paiement des frais ──
  if (created) {
    return (
      <>
        <PageHeader title="Cercle créé" subtitle={created.name} backHref="/circles" />
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6">
          <section className={`${card} p-5 text-center`}>
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint text-primary">
              <CheckCircle2 size={30} aria-hidden />
            </span>
            <h2 className="text-[20px] font-bold text-ink">Votre cercle est prêt</h2>
            <p className="mt-1 text-[15px] text-muted">
              <strong className="text-ink">{created.name}</strong> apparaît dans vos cercles, en attente
              d&apos;activation. Réglez les frais d&apos;activation pour le mettre en service.
            </p>
            <div className="mt-4 rounded-[14px] bg-primary-tint p-4">
              <p className="text-[13px] text-primary-dark">Code d&apos;invitation</p>
              <p className="font-mono text-[22px] font-bold tracking-widest text-primary-dark">{created.inviteCode}</p>
            </div>
          </section>

          <MobileMoneyCheckout
            title="Activer le cercle"
            amount={ACTIVATION_FEE}
            phone={mockCurrentUser.phoneNumber}
            details={[
              { label: 'Cercle', value: created.name },
              { label: 'Objet', value: "Frais d'activation" },
            ]}
            successText={`Le cercle « ${created.name} » est activé. Partagez le code d'invitation avec vos membres.`}
            done={{ href: '/circles', label: 'Voir mes cercles' }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Créer un cercle" subtitle={`Étape ${step} sur ${STEPS.length}`} onBack={goBack} />

      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">
        {/* Étapes */}
        <ol className="mb-6 flex items-start" aria-label="Étapes">
          {STEPS.map((s, idx) => {
            const done = idx < step - 1;
            const current = idx === step - 1;
            return (
              <Fragment key={s}>
                <li className="flex w-16 flex-col items-center" aria-current={current ? 'step' : undefined}>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold ${
                      done || current ? 'bg-primary text-white' : 'border border-line bg-white text-muted'
                    }`}
                  >
                    {done ? <Check size={14} strokeWidth={3} aria-hidden /> : idx + 1}
                  </span>
                  <span className={`mt-1.5 text-[12px] ${current ? 'font-semibold text-ink' : 'text-muted'}`}>{s}</span>
                </li>
                {idx < STEPS.length - 1 && (
                  <li aria-hidden className={`mt-3.5 h-0.5 flex-1 ${done ? 'bg-primary' : 'bg-line'}`} />
                )}
              </Fragment>
            );
          })}
        </ol>

        {/* ÉTAPE 1 — TYPE */}
        {step === 1 && (
          <div className="space-y-5">
            <StepTitle title="Quel type de cercle ?" text="Ce choix détermine le fonctionnement du cercle." />

            <div className="space-y-2.5" role="radiogroup" aria-label="Type de cercle">
              {FAMILIES.map((f) => {
                const active = family === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setFamily(f.key)}
                    className={`${choiceCard(active)} flex items-center gap-3`}
                  >
                    <IconTile icon={f.icon} tone={f.key === 'TONTINE' ? 'green' : 'amber'} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-ink">{f.label}</p>
                      <p className="mt-0.5 text-[13px] text-muted">{f.desc}</p>
                    </div>
                    <RadioMark active={active} />
                  </button>
                );
              })}
            </div>

            {usesTontine && (
              <Field label="La cagnotte est remise…">
                <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Forme de la cagnotte">
                  {MODES.map((m) => {
                    const active = mode === m.key;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setMode(m.key)}
                        className={choiceCard(active)}
                      >
                        <Icon size={20} className={active ? 'text-primary' : 'text-muted'} aria-hidden />
                        <p className="mt-2 text-[15px] font-semibold text-ink">{m.label}</p>
                        <p className="text-[13px] text-muted">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}

            {usesTontine && mode === 'NATURE' && (
              <div className="space-y-4">
                <Field label="Description du lot" htmlFor="nature-desc">
                  <textarea
                    id="nature-desc"
                    value={natureDescription}
                    onChange={(e) => setNatureDescription(e.target.value)}
                    rows={3}
                    placeholder="Ex. Moto Yamaha 125 cc, ou 5 sacs de riz de 25 kg + 5 L d'huile"
                    className={textarea}
                  />
                </Field>
                <Field label="Photo du lot (facultatif)">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-[14px] border border-dashed p-4 transition-colors ${
                      naturePhoto ? 'border-primary bg-[#F0F7F4]' : 'border-line-strong bg-white hover:bg-fill'
                    }`}
                  >
                    {naturePhoto ? (
                      <CheckCircle2 size={20} className="text-primary" aria-hidden />
                    ) : (
                      <Camera size={20} className="text-muted" aria-hidden />
                    )}
                    <span className="min-w-0 truncate text-[14px] text-ink">
                      {naturePhoto ? naturePhoto.name : 'Prendre ou importer une photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => setNaturePhoto(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </Field>
              </div>
            )}

            <button type="button" onClick={() => setStep(2)} disabled={!canContinueStep1} className={btnPrimary}>
              Continuer
            </button>
          </div>
        )}

        {/* ÉTAPE 2 — PARAMÈTRES */}
        {step === 2 && (
          <div className="space-y-5">
            <StepTitle title="Paramètres du cercle" text="Nom, montants et fréquence des cotisations." />

            <Field label="Nom du cercle" htmlFor="c-name">
              <input
                id="c-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Tontine Commerçants Dassasgho"
                className={input}
              />
            </Field>

            {usesTontine ? (
              <AmountField id="c-tontine" label="Cotisation par tour" value={tontineAmount} onChange={setTontineAmount} />
            ) : (
              <AmountField id="c-solid" label="Cotisation à la caisse" value={solidarityAmount} onChange={setSolidarityAmount} />
            )}

            <AmountField
              id="c-fee"
              label="Frais de gestion du président (facultatif)"
              value={managementFee}
              onChange={setManagementFee}
            />

            <div className="rounded-[14px] bg-primary-tint p-4 text-center">
              <p className="text-[14px] text-primary-dark">Total par membre et par tour</p>
              <p className="text-[24px] font-bold text-primary-dark">{formatFcfa(total)}</p>
              <p className="text-[13px] text-primary-dark/80">Frais de gestion inclus</p>
            </div>

            <Field label="Fréquence des cotisations">
              <div className="grid grid-cols-2 gap-2.5">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={frequency === f.key}
                    onClick={() => setFrequency(f.key)}
                    className={chip(frequency === f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </Field>

            {frequency === 'CUSTOM' && (
              <Field label="Intervalle (en jours)" htmlFor="c-days">
                <input
                  id="c-days"
                  inputMode="numeric"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="Ex. 14"
                  className={input}
                />
              </Field>
            )}

            <Field label="Nombre maximum de membres" htmlFor="c-max">
              <input
                id="c-max"
                inputMode="numeric"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="Ex. 10"
                className={input}
              />
            </Field>

            <button type="button" onClick={() => setStep(3)} disabled={!name.trim()} className={btnPrimary}>
              Continuer
            </button>
          </div>
        )}

        {/* ÉTAPE 3 — RÈGLES */}
        {step === 3 && (
          <div className="space-y-5">
            <StepTitle
              title="Règles du cercle"
              text="Elles protègent le cercle et s'appliquent à tous les membres, vous compris."
            />

            {usesTontine && (
              <div className={`${card} flex items-center justify-between gap-4 p-4`}>
                <div>
                  <p className="text-[15px] font-semibold text-ink">Bénéficiaires par tour</p>
                  <p className="text-[13px] text-muted">Nombre de membres qui reçoivent la cagnotte</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Diminuer"
                    onClick={() => setBeneficiariesPerTurn((n) => Math.max(1, n - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-primary-dark"
                  >
                    <Minus size={16} aria-hidden />
                  </button>
                  <span className="w-6 text-center text-[17px] font-bold text-ink" aria-live="polite">
                    {beneficiariesPerTurn}
                  </span>
                  <button
                    type="button"
                    aria-label="Augmenter"
                    onClick={() => setBeneficiariesPerTurn((n) => n + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-primary-dark"
                  >
                    <Plus size={16} aria-hidden />
                  </button>
                </div>
              </div>
            )}

            <div className={`${card} flex items-center justify-between gap-4 p-4`}>
              <div>
                <p id="deposit-label" className="text-[15px] font-semibold text-ink">
                  Dépôt de garantie à l&apos;entrée
                </p>
                <p className="text-[13px] text-muted">Une avance remboursée quand le membre quitte le cercle</p>
              </div>
              <Toggle checked={depositRequired} onChange={setDepositRequired} labelledBy="deposit-label" />
            </div>

            <Field label="Retards tolérés avant exclusion">
              <div className="grid grid-cols-4 gap-2.5">
                {EXCLUSION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={exclusionThreshold === opt}
                    onClick={() => setExclusionThreshold(opt)}
                    className={chip(exclusionThreshold === opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[13px] text-muted">Au-delà, vous pourrez proposer son exclusion au vote du bureau.</p>
            </Field>

            <Field label="Conditions d'adhésion (facultatif)" htmlFor="c-cond">
              <textarea
                id="c-cond"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                rows={3}
                placeholder="Ex. Cotisation avant le 5 de chaque mois. Prévenir le bureau en cas d'empêchement."
                className={textarea}
              />
            </Field>

            <Field label="Documents demandés aux membres">
              <div className="space-y-2.5">
                {KYC_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.key}
                    active={kycRequirement === o.key}
                    title={o.label}
                    desc={o.desc}
                    onClick={() => setKycRequirement(o.key)}
                  />
                ))}
              </div>
            </Field>

            {usesTontine && (
              <Field label="Si un membre quitte le cercle">
                <div className="space-y-2.5">
                  {LEAVING_RULES.map((r) => (
                    <OptionCard
                      key={r.key}
                      active={leavingRule === r.key}
                      title={r.label}
                      desc={r.desc}
                      onClick={() => setLeavingRule(r.key)}
                    />
                  ))}
                </div>
              </Field>
            )}

            <button type="button" onClick={() => setStep(4)} className={btnPrimary}>
              Continuer
            </button>
          </div>
        )}

        {/* ÉTAPE 4 — RÉSUMÉ */}
        {step === 4 && (
          <div className="space-y-5">
            <StepTitle title="Vérifiez avant de créer" text="Vous pourrez modifier ces réglages plus tard." />

            <dl className={`${card} divide-y divide-line px-4`}>
              <SummaryRow label="Nom">{name || '—'}</SummaryRow>
              <SummaryRow label="Type">{typeLabel}</SummaryRow>
              {usesTontine && mode === 'NATURE' && natureDescription && (
                <SummaryRow label="Lot">
                  <span className="block max-w-[220px] truncate">{natureDescription}</span>
                </SummaryRow>
              )}
              {usesTontine ? (
                <SummaryRow label="Cotisation par tour">{formatFcfa(tontine)}</SummaryRow>
              ) : (
                <SummaryRow label="Cotisation">{formatFcfa(solidarity)}</SummaryRow>
              )}
              {fee > 0 && <SummaryRow label="Frais de gestion">{formatFcfa(fee)}</SummaryRow>}
              <SummaryRow label="Fréquence">{frequencyText}</SummaryRow>
              <SummaryRow label="Membres maximum">{maxMembers || '—'}</SummaryRow>
              {usesTontine && (
                <SummaryRow label="Bénéficiaires par tour">
                  {beneficiariesPerTurn} membre{beneficiariesPerTurn > 1 ? 's' : ''}
                </SummaryRow>
              )}
              <SummaryRow label="Exclusion après">{exclusionThreshold} retards</SummaryRow>
              <SummaryRow label="Dépôt de garantie">{depositRequired ? 'Oui' : 'Non'}</SummaryRow>
            </dl>

            <div className="flex items-start gap-3 rounded-[14px] bg-amber-tint p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-amber-dark" aria-hidden />
              <p className="text-[14px] text-amber-dark">
                Un code d&apos;invitation sera créé. Le cercle sera actif après le paiement des frais d&apos;activation
                ({formatFcfa(ACTIVATION_FEE)}).
              </p>
            </div>

            <button type="button" onClick={handleCreate} className={btnPrimary}>
              Créer le cercle
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-[20px] font-bold text-ink">{title}</h2>
      <p className="mt-1 text-[14px] text-muted">{text}</p>
    </div>
  );
}

function Field({ label: text, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={label}>
          {text}
        </label>
      ) : (
        <p className={label}>{text}</p>
      )}
      {children}
    </div>
  );
}

function AmountField({
  id,
  label: text,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={text} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
          className={`${input} pr-16`}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-muted">
          F CFA
        </span>
      </div>
    </Field>
  );
}

function RadioMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        active ? 'border-primary bg-primary text-white' : 'border-line-strong bg-white'
      }`}
    >
      {active && <Check size={12} strokeWidth={3} />}
    </span>
  );
}

function OptionCard({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`${choiceCard(active)} flex items-center gap-3`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <p className="text-[13px] text-muted">{desc}</p>
      </div>
      <RadioMark active={active} />
    </button>
  );
}
