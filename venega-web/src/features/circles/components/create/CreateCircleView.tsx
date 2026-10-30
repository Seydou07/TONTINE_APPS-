'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Check, Copy, HeartHandshake, Info, Package, Repeat, Share2 } from 'lucide-react';
import { KycRequirement, RefundRule, ReplacementRule, UnlockRule, type Circle } from '@venega/types';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Toggle } from '@/components/ui/Toggle';
import { CenteredState, Notice, ScreenBody, ScreenFooter } from '@/components/ui/blocks';
import { Chip, ChipGroup, NumberStepper, OptionCard, Segmented, SettingRow } from '@/components/ui/choice';
import { TextArea, TextField } from '@/components/ui/TextField';
import { useDemoStore } from '@/lib/demoStore';
import { formatFcfa } from '@/lib/format';
import { PhotoPicker } from '@/features/aid/components/PhotoPicker';
import { addCircle, CIRCLE_CREATION_FEE } from '../../store';

/*
 * Assistant de création d'un cercle (écran mobile CreateCircleScreen) en 4 étapes :
 * type, cotisations, règles, récapitulatif. Deux familles seulement : Tontine (argent
 * ou bien en nature) et Caisse de solidarité. Le cercle est créé inactif : il s'active
 * après le paiement des frais de création (2 000 F) depuis « Mes cercles ».
 * TODO API : `POST /circles` (docs/api-mobile.md, section 3 — champs manquants listés).
 */

type Kind = 'TONTINE' | 'SOLIDARITY';
type Mode = 'CASH' | 'NATURE';

const STEPS = ['Type', 'Cotisations', 'Règles', 'Récapitulatif'];

const frequencies = [
  { key: 'DAILY', label: 'Chaque jour' },
  { key: 'WEEKLY', label: 'Chaque semaine' },
  { key: 'MONTHLY', label: 'Chaque mois' },
  { key: 'CUSTOM', label: 'Personnalisée' },
] as const;

const frequencyLabel: Record<string, string> = {
  DAILY: 'Journalière',
  WEEKLY: 'Hebdomadaire',
  MONTHLY: 'Mensuelle',
  CUSTOM: 'Personnalisée',
};

const kycOptions = [
  { key: KycRequirement.CNIB_SELFIE, label: 'CNIB + selfie', desc: 'Vérification complète de l’identité', badge: 'Recommandé' },
  { key: KycRequirement.CNIB, label: 'CNIB uniquement', desc: 'Pièce d’identité recto et verso' },
  { key: KycRequirement.NONE, label: 'Aucun document', desc: 'Pour un cercle entre proches de confiance' },
];

const leavingOptions = [
  { key: 'BUYOUT_REQUIRED', label: 'Rachat des tours passés', desc: 'Le remplaçant rachète les cotisations déjà versées' },
  { key: 'REDUCE_POOL', label: 'Cagnotte ajustée', desc: 'La cagnotte s’adapte au nombre de membres restants' },
];

const exclusionOptions = ['2', '3', '4', '5'];

const toNumber = (v: string) => parseInt(v.replace(/\D/g, ''), 10) || 0;
const digitsOnly = (v: string, max = 9) => v.replace(/\D/g, '').slice(0, max);

export function CreateCircleView() {
  useDemoStore();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Étape 1 — type
  const [kind, setKind] = useState<Kind>('TONTINE');
  const [mode, setMode] = useState<Mode>('CASH');
  const [goalItem, setGoalItem] = useState('');
  const [goalDetails, setGoalDetails] = useState('');
  const [goalValue, setGoalValue] = useState('');
  const [goalImage, setGoalImage] = useState<string | null>(null);

  // Étape 2 — cotisations
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [frequency, setFrequency] = useState<string>('MONTHLY');
  const [customDays, setCustomDays] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);

  // Étape 3 — règles
  const [beneficiariesPerTurn, setBeneficiariesPerTurn] = useState(1);
  const [exclusionThreshold, setExclusionThreshold] = useState('3');
  const [depositRequired, setDepositRequired] = useState(false);
  const [kycRequirement, setKycRequirement] = useState<KycRequirement>(KycRequirement.CNIB_SELFIE);
  const [leavingRule, setLeavingRule] = useState('BUYOUT_REQUIRED');
  const [conditions, setConditions] = useState('');

  const [createdCircle, setCreatedCircle] = useState<Circle | null>(null);

  const isTontine = kind === 'TONTINE';
  const isNature = isTontine && mode === 'NATURE';
  const contribution = toNumber(amount);
  const fee = toNumber(managementFee);
  const value = toNumber(goalValue);
  const perMember = contribution + fee;
  const potPerTurn = isTontine ? (contribution * maxMembers) / Math.max(beneficiariesPerTurn, 1) : 0;
  const suggestedNature = isNature && value > 0 ? Math.ceil(value / maxMembers / 100) * 100 : 0;
  const typeLabel = !isTontine ? 'Caisse de solidarité' : isNature ? 'Tontine en nature' : 'Tontine en espèces';

  const stepValid =
    step === 1
      ? !isNature || goalItem.trim().length > 1
      : step === 2
        ? name.trim().length >= 3 && contribution > 0 && (frequency !== 'CUSTOM' || toNumber(customDays) > 0)
        : true;

  const buildCircle = (id: string, inviteCode: string): Circle => ({
    id,
    name: name.trim(),
    type: (isTontine ? (isNature ? 'NATURE' : 'TONTINE_ONLY') : 'SOLIDARITY_ONLY') as Circle['type'],
    tontineAmount: isTontine ? contribution : 0,
    solidarityAmount: isTontine ? 0 : contribution,
    frequency: frequency as Circle['frequency'],
    contributionMode: (isNature ? 'NATURE' : 'CASH') as Circle['contributionMode'],
    beneficiariesPerTurn: isTontine ? beneficiariesPerTurn : 1,
    inviteCode,
    memberCount: 1,
    maxMembers,
    createdAt: new Date().toISOString(),
    rules: {
      refundRule: RefundRule.AT_CYCLE_END,
      replacementRule: !isTontine
        ? ReplacementRule.NONE
        : leavingRule === 'BUYOUT_REQUIRED'
          ? ReplacementRule.PAY_PAST_TURNS
          : ReplacementRule.REDUCED_POT,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 3,
      reservePercent: 5,
      allowPublicContributions: false,
      minContribution: undefined,
      goalAmount: isNature && value > 0 ? value : undefined,
      goalItem: isNature ? goalItem.trim() : undefined,
      goalDetails: isNature && goalDetails.trim() ? goalDetails.trim() : undefined,
      goalImageUrl: isNature && goalImage ? goalImage : undefined,
      kycRequirement,
    },
    managementFee: fee,
    depositRequired,
    recalculateOnLeave: isTontine && leavingRule === 'REDUCE_POOL',
    exclusionThreshold: parseInt(exclusionThreshold, 10) || 3,
    nextPaymentRequired: false,
    conditions: conditions.trim(),
    isActive: false,
  });

  const handleCreate = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const code = prefix + Math.floor(1000 + Math.random() * 9000).toString();
    const circle = buildCircle('c' + Date.now().toString(36), code);
    addCircle(circle);
    setCreatedCircle(circle);
  };

  const goBack = () => (step > 1 ? setStep(step - 1) : router.back());
  const goNext = () => {
    if (step < STEPS.length) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    } else {
      handleCreate();
    }
  };

  if (createdCircle) {
    return <CreatedView circle={createdCircle} onDone={() => router.replace('/circles')} />;
  }

  return (
    <>
      <PageHeader
        title="Nouveau cercle"
        onBack={goBack}
        right={
          <span className="text-[14px] font-semibold text-muted">
            {step}/{STEPS.length}
          </span>
        }
      />
      <div className="mx-auto flex max-w-2xl gap-1.5 px-4 pt-3 sm:px-6" aria-hidden>
        {STEPS.map((label, i) => (
          <span key={label} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-line'}`} />
        ))}
      </div>

      <ScreenBody>
        <div>
          <p className="text-[13px] font-semibold text-primary">{STEPS[step - 1]}</p>

          {/* ── ÉTAPE 1 — TYPE ── */}
          {step === 1 && (
            <div className="space-y-6">
              <StepTitle title="Quel cercle voulez-vous créer ?" subtitle="Ce choix définit le fonctionnement du cercle." />
              <div role="radiogroup" aria-label="Type de cercle" className="space-y-2.5">
                <OptionCard
                  icon={Repeat}
                  title="Tontine"
                  description="Chaque membre cotise et reçoit la cagnotte à son tour."
                  selected={isTontine}
                  onClick={() => setKind('TONTINE')}
                />
                <OptionCard
                  icon={HeartHandshake}
                  title="Caisse de solidarité"
                  description="Un fonds commun pour aider un membre dans le besoin."
                  selected={!isTontine}
                  onClick={() => setKind('SOLIDARITY')}
                />
              </div>

              {isTontine && (
                <Section title="Que reçoit le bénéficiaire ?">
                  <Segmented<Mode>
                    label="Que reçoit le bénéficiaire ?"
                    value={mode}
                    onChange={setMode}
                    options={[
                      { key: 'CASH', label: 'De l’argent', icon: Banknote },
                      { key: 'NATURE', label: 'Un bien', icon: Package },
                    ]}
                  />
                  <p className="mt-2 text-[13px] text-muted">
                    {isNature
                      ? 'Les cotisations servent à acheter un bien, remis à tour de rôle.'
                      : 'La cagnotte est versée en mobile money au bénéficiaire du tour.'}
                  </p>
                </Section>
              )}

              {isNature && (
                <section className="space-y-4 rounded-[20px] border border-line bg-white p-4">
                  <h2 className="text-[15px] font-semibold text-ink">Le bien à remettre</h2>
                  <PhotoPicker
                    value={goalImage}
                    onChange={setGoalImage}
                    hint="Les membres verront ce qu’ils vont recevoir"
                  />
                  <TextField
                    label="Nom du bien"
                    placeholder="Ex. Moto Bajaj Boxer 100cc"
                    value={goalItem}
                    onChange={(e) => setGoalItem(e.target.value)}
                  />
                  <TextArea
                    label="Détails (facultatif)"
                    placeholder="Ex. 2 sacs de riz 25 kg, 5 L d’huile, 1 carton de savon"
                    rows={3}
                    value={goalDetails}
                    onChange={(e) => setGoalDetails(e.target.value)}
                  />
                  <TextField
                    label="Valeur estimée"
                    placeholder="0"
                    inputMode="numeric"
                    suffix="F CFA"
                    value={goalValue}
                    onChange={(e) => setGoalValue(digitsOnly(e.target.value))}
                    hint="Sert à calculer la cotisation conseillée."
                  />
                </section>
              )}
            </div>
          )}

          {/* ── ÉTAPE 2 — COTISATIONS ── */}
          {step === 2 && (
            <div className="space-y-6">
              <StepTitle title="Nom et cotisations" subtitle="Combien chaque membre verse, et à quel rythme." />
              <div className="space-y-4">
                <TextField
                  label="Nom du cercle"
                  placeholder={isTontine ? 'Ex. Tontine des commerçants de Dassasgho' : 'Ex. Mutuelle du quartier'}
                  maxLength={48}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div>
                  <TextField
                    label={isTontine ? 'Cotisation par membre et par tour' : 'Cotisation par membre'}
                    placeholder="0"
                    inputMode="numeric"
                    suffix="F CFA"
                    value={amount}
                    onChange={(e) => setAmount(digitsOnly(e.target.value))}
                  />
                  {suggestedNature > 0 && contribution !== suggestedNature && (
                    <button
                      type="button"
                      onClick={() => setAmount(String(suggestedNature))}
                      className="mt-2 flex w-full items-center justify-between gap-3 rounded-[12px] bg-primary-tint px-3.5 py-2.5 text-left"
                    >
                      <span className="text-[13px] text-primary-dark">
                        Conseillé pour {maxMembers} membres : <strong>{formatFcfa(suggestedNature)}</strong>
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold text-primary">Appliquer</span>
                    </button>
                  )}
                </div>
                <TextField
                  label="Frais de gestion (facultatif)"
                  placeholder="0"
                  inputMode="numeric"
                  suffix="F CFA"
                  value={managementFee}
                  onChange={(e) => setManagementFee(digitsOnly(e.target.value))}
                  hint="Votre commission de président, prélevée à chaque tour."
                />
              </div>

              <Section title="Fréquence">
                <ChipGroup label="Fréquence">
                  {frequencies.map((f) => (
                    <Chip key={f.key} label={f.label} selected={frequency === f.key} onClick={() => setFrequency(f.key)} />
                  ))}
                </ChipGroup>
                {frequency === 'CUSTOM' && (
                  <TextField
                    containerClassName="mt-3"
                    aria-label="Intervalle en jours"
                    placeholder="Ex. 14"
                    inputMode="numeric"
                    suffix="jours"
                    value={customDays}
                    onChange={(e) => setCustomDays(digitsOnly(e.target.value, 3))}
                    hint="Intervalle entre deux cotisations."
                  />
                )}
              </Section>

              <div className="rounded-[20px] border border-line bg-white px-4">
                <SettingRow title="Nombre de membres" description="Vous compris" last>
                  <NumberStepper value={maxMembers} onChange={setMaxMembers} min={2} max={50} label="Nombre de membres" />
                </SettingRow>
              </div>

              {contribution > 0 && (
                <div className="space-y-2 rounded-[20px] bg-fill p-4">
                  <TotalRow label="Chaque membre verse" value={formatFcfa(perMember)} />
                  {isTontine && (
                    <TotalRow
                      label={isNature ? 'Budget par tour' : 'Cagnotte par tour'}
                      value={formatFcfa(potPerTurn)}
                      strong
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ÉTAPE 3 — RÈGLES ── */}
          {step === 3 && (
            <div className="space-y-6">
              <StepTitle title="Règles du cercle" subtitle="Elles protègent le groupe et s’appliquent à tous, vous compris." />
              <div className="rounded-[20px] border border-line bg-white px-4">
                {isTontine && (
                  <SettingRow title="Bénéficiaires par tour" description="Membres servis à chaque tour">
                    <NumberStepper
                      value={beneficiariesPerTurn}
                      onChange={setBeneficiariesPerTurn}
                      min={1}
                      max={Math.max(1, Math.floor(maxMembers / 2))}
                      label="Bénéficiaires par tour"
                    />
                  </SettingRow>
                )}
                <SettingRow
                  id="deposit-title"
                  title="Dépôt de garantie"
                  description="Une cotisation versée à l’entrée, rendue en fin de cercle"
                  last
                >
                  <Toggle checked={depositRequired} onChange={setDepositRequired} labelledBy="deposit-title" />
                </SettingRow>
              </div>

              <Section title="Retards tolérés avant exclusion">
                <ChipGroup label="Retards tolérés avant exclusion">
                  {exclusionOptions.map((opt) => (
                    <Chip
                      key={opt}
                      label={`${opt} retards`}
                      selected={exclusionThreshold === opt}
                      onClick={() => setExclusionThreshold(opt)}
                    />
                  ))}
                </ChipGroup>
                <p className="mt-2 text-[13px] text-muted">Au-delà, le bureau peut voter l’exclusion du membre.</p>
              </Section>

              <Section title="Documents demandés aux membres">
                <div role="radiogroup" aria-label="Documents demandés aux membres" className="space-y-2.5">
                  {kycOptions.map((opt) => (
                    <OptionCard
                      key={opt.key}
                      title={opt.label}
                      description={opt.desc}
                      badge={opt.badge}
                      selected={kycRequirement === opt.key}
                      onClick={() => setKycRequirement(opt.key)}
                    />
                  ))}
                </div>
              </Section>

              {isTontine && (
                <Section title="Si un membre quitte le cercle">
                  <div role="radiogroup" aria-label="Si un membre quitte le cercle" className="space-y-2.5">
                    {leavingOptions.map((opt) => (
                      <OptionCard
                        key={opt.key}
                        title={opt.label}
                        description={opt.desc}
                        selected={leavingRule === opt.key}
                        onClick={() => setLeavingRule(opt.key)}
                      />
                    ))}
                  </div>
                </Section>
              )}

              <TextArea
                label="Conditions d’adhésion (facultatif)"
                placeholder="Ex. Cotisation avant le 5 de chaque mois. Prévenir le bureau en cas d’empêchement."
                rows={4}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                hint="Chaque nouveau membre devra les accepter."
              />
            </div>
          )}

          {/* ── ÉTAPE 4 — RÉCAPITULATIF ── */}
          {step === 4 && (
            <div className="space-y-4">
              <StepTitle title="Tout est correct ?" subtitle="Vous pourrez modifier ces réglages plus tard." />

              <SummaryCard title="Cercle" onEdit={() => setStep(1)}>
                {isNature && goalImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={goalImage} alt="Photo du bien" className="mb-2 h-[140px] w-full rounded-[14px] object-cover" />
                )}
                <SummaryRow label="Nom" value={name.trim()} />
                <SummaryRow label="Type" value={typeLabel} />
                {isNature && <SummaryRow label="Bien remis" value={goalItem.trim()} />}
                {isNature && value > 0 && <SummaryRow label="Valeur estimée" value={formatFcfa(value)} />}
                <SummaryRow label="Membres" value={`${maxMembers}`} last />
              </SummaryCard>

              <SummaryCard title="Cotisations" onEdit={() => setStep(2)}>
                <SummaryRow label="Cotisation" value={formatFcfa(contribution)} />
                {fee > 0 && <SummaryRow label="Frais de gestion" value={formatFcfa(fee)} />}
                <SummaryRow
                  label="Fréquence"
                  value={
                    frequency === 'CUSTOM' ? `Tous les ${toNumber(customDays)} jours` : (frequencyLabel[frequency] ?? '—')
                  }
                />
                <SummaryRow label="Total par membre" value={formatFcfa(perMember)} strong last={!isTontine} />
                {isTontine && <SummaryRow label="Cagnotte par tour" value={formatFcfa(potPerTurn)} strong last />}
              </SummaryCard>

              <SummaryCard title="Règles" onEdit={() => setStep(3)}>
                {isTontine && <SummaryRow label="Bénéficiaires par tour" value={`${beneficiariesPerTurn}`} />}
                <SummaryRow label="Retards tolérés" value={exclusionThreshold} />
                <SummaryRow label="Dépôt de garantie" value={depositRequired ? 'Oui' : 'Non'} />
                <SummaryRow
                  label="Documents"
                  value={kycOptions.find((o) => o.key === kycRequirement)?.label ?? '—'}
                  last={!isTontine}
                />
                {isTontine && (
                  <SummaryRow
                    label="En cas de départ"
                    value={leavingOptions.find((o) => o.key === leavingRule)?.label ?? '—'}
                    last
                  />
                )}
              </SummaryCard>

              <Notice icon={Info} tone="warning">
                Frais d’activation de {formatFcfa(CIRCLE_CREATION_FEE)}, à régler par mobile money une fois le cercle créé.
              </Notice>
            </div>
          )}
        </div>

        <ScreenFooter>
          <Button disabled={!stepValid} onClick={goNext}>
            {step === STEPS.length ? 'Créer le cercle' : 'Continuer'}
          </Button>
        </ScreenFooter>
      </ScreenBody>
    </>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-1">
      <h1 className="text-[22px] font-bold leading-tight text-ink">{title}</h1>
      <p className="mt-1 text-[15px] text-muted">{subtitle}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-[15px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function TotalRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px] text-muted">{label}</span>
      <span className={`text-[15px] ${strong ? 'font-bold text-primary-dark' : 'font-semibold text-ink'}`}>{value}</span>
    </div>
  );
}

function SummaryCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-line bg-white px-4 pb-1 pt-3.5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <button type="button" onClick={onEdit} className="text-[14px] font-semibold text-primary hover:underline">
          Modifier
        </button>
      </div>
      <dl>{children}</dl>
    </section>
  );
}

function SummaryRow({ label, value, strong = false, last = false }: { label: string; value: string; strong?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2.5 ${last ? '' : 'border-b border-line'}`}>
      <dt className="text-[14px] text-muted">{label}</dt>
      <dd className={`min-w-0 break-words text-right text-[15px] ${strong ? 'font-bold' : 'font-medium'} text-ink`}>
        {value}
      </dd>
    </div>
  );
}

function CreatedView({ circle, onDone }: { circle: Circle; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const message = `Rejoins mon cercle « ${circle.name} » sur Venega avec le code ${circle.inviteCode}.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(circle.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : le code reste affiché et sélectionnable.
    }
  };

  const share = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: message });
      } catch {
        // Partage annulé.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignoré
    }
  };

  return (
    <ScreenBody className="pt-8">
      <CenteredState icon={Check} title="Votre cercle est créé" text={circle.name} />

      <section className="rounded-[20px] border border-line bg-white p-5 text-center">
        <p className="text-[13px] text-muted">Code d’invitation</p>
        <p className="mt-1 select-all font-mono text-[28px] font-bold tracking-[0.12em] text-ink">{circle.inviteCode}</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button size="sm" variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
            {copied ? 'Copié' : 'Copier'}
          </Button>
          <Button size="sm" variant="secondary" icon={Share2} onClick={share}>
            Partager
          </Button>
        </div>
      </section>

      <Notice icon={Info} tone="warning">
        Le cercle s’active après le paiement des frais de {formatFcfa(CIRCLE_CREATION_FEE)}. Retrouvez-le dans « Mes
        cercles » pour le régler.
      </Notice>

      <ScreenFooter>
        <Button onClick={onDone}>Voir mes cercles</Button>
      </ScreenFooter>
    </ScreenBody>
  );
}
