'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Info, RefreshCw, ShieldCheck } from 'lucide-react';
import { KycRequirement, ReplacementRule, type Circle } from '@venega/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/TextField';
import { Chip, ChipGroup, OptionCard, SettingRow } from '@/components/ui/choice';
import { Toggle } from '@/components/ui/Toggle';
import { label as labelClass } from '@/components/ui/classes';
import { CenteredState, Notice, ScreenBody, ScreenFooter, SectionTitle } from '@/components/ui/blocks';
import { useDemoStore } from '@/lib/demoStore';
import { getCircle, updateCircle } from '../store';

const FREQUENCIES = [
  { key: 'DAILY', label: 'Journalier' },
  { key: 'WEEKLY', label: 'Hebdomadaire' },
  { key: 'BIWEEKLY', label: 'Bi-mensuel' },
  { key: 'MONTHLY', label: 'Mensuel' },
] as const;

const KYC_OPTIONS = [
  { key: KycRequirement.NONE, label: 'Aucun document', desc: 'Aucun justificatif demandé' },
  { key: KycRequirement.CNIB, label: 'CNIB obligatoire', desc: "Pièce d'identité recto/verso" },
  { key: KycRequirement.CNIB_SELFIE, label: 'CNIB + Selfie', desc: 'Vérification faciale complète' },
] as const;

const LEAVING_OPTIONS = [
  {
    key: ReplacementRule.PAY_PAST_TURNS,
    label: 'Rachat des tours passés',
    desc: 'Le nouvel entrant paie les cotisations des tours déjà effectués',
  },
  {
    key: ReplacementRule.REDUCED_POT,
    label: 'Réajuster la cagnotte',
    desc: "Sans remplaçant : la cagnotte s'ajuste au nombre de membres restants",
  },
  { key: ReplacementRule.NONE, label: 'Sans remplacement', desc: 'La cagnotte est simplement réajustée' },
] as const;

const EXCLUSION_OPTIONS = ['2', '3', '4', '5'];

const digits = (v: string) => v.replace(/\D/g, '');

/** Modification d'un cercle par le fondateur (copie de EditCircleScreen mobile). */
export function EditCircleView({ circleId }: { circleId: string }) {
  useDemoStore();
  const circle = getCircle(circleId);
  const router = useRouter();
  if (!circle) {
    return (
      <>
        <PageHeader title="Modifier le cercle" onBack={() => router.back()} />
        <ScreenBody>
          <CenteredState icon={Info} tone="neutral" title="Cercle introuvable" />
        </ScreenBody>
      </>
    );
  }
  return <EditCircleForm circle={circle} />;
}

function EditCircleForm({ circle }: { circle: Circle }) {
  const router = useRouter();
  const [name, setName] = useState(circle.name);
  const [frequency, setFrequency] = useState<string>(circle.frequency);
  const [maxMembers, setMaxMembers] = useState(String(circle.maxMembers ?? 10));
  const [tontineAmount, setTontineAmount] = useState(String(circle.tontineAmount ?? 0));
  const [solidarityAmount, setSolidarityAmount] = useState(String(circle.solidarityAmount ?? 0));
  const [managementFee, setManagementFee] = useState(String(circle.managementFee ?? 0));
  const [depositRequired, setDepositRequired] = useState(circle.depositRequired ?? false);
  const [kycRequirement, setKycRequirement] = useState<KycRequirement>(circle.rules?.kycRequirement ?? KycRequirement.NONE);
  const [leavingRule, setLeavingRule] = useState<ReplacementRule>(
    circle.rules?.replacementRule ?? ReplacementRule.PAY_PAST_TURNS,
  );
  const [exclusionThreshold, setExclusionThreshold] = useState(String(circle.exclusionThreshold ?? 3));
  const [conditions, setConditions] = useState(circle.conditions ?? '');
  const [inviteCode, setInviteCode] = useState(circle.inviteCode);

  const regenerateCode = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    setInviteCode(prefix + suffix);
  };

  const handleSave = () => {
    // TODO API: modification d'un cercle (PATCH /circles/:id) absente de docs/api-mobile.md, à ajouter.
    updateCircle(circle.id, {
      name: name.trim(),
      frequency: frequency as Circle['frequency'],
      maxMembers: parseInt(maxMembers, 10) || 10,
      tontineAmount: parseFloat(tontineAmount) || 0,
      solidarityAmount: parseFloat(solidarityAmount) || 0,
      managementFee: parseFloat(managementFee) || 0,
      depositRequired,
      rules: { ...circle.rules, kycRequirement, replacementRule: leavingRule },
      exclusionThreshold: parseInt(exclusionThreshold, 10) || 3,
      conditions: conditions.trim(),
      inviteCode: inviteCode || circle.inviteCode,
    });
    router.back();
  };

  return (
    <>
      <PageHeader title="Modifier le cercle" onBack={() => router.back()} />
      <ScreenBody>
        <p className="text-[14px] text-muted">Les modifications s&apos;appliquent immédiatement.</p>

        <section className="space-y-4">
          <SectionTitle>Informations générales</SectionTitle>
          <TextField label="Nom du cercle" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du cercle" />
          <div>
            <p className={labelClass}>Fréquence des cotisations</p>
            <ChipGroup label="Fréquence des cotisations">
              {FREQUENCIES.map((f) => (
                <Chip key={f.key} label={f.label} selected={frequency === f.key} onClick={() => setFrequency(f.key)} />
              ))}
            </ChipGroup>
          </div>
          <TextField
            label="Nombre maximum de membres"
            value={maxMembers}
            onChange={(e) => setMaxMembers(digits(e.target.value))}
            inputMode="numeric"
            placeholder="Ex. 10"
          />
        </section>

        <section className="space-y-4">
          <SectionTitle>Montants</SectionTitle>
          <TextField
            label="Cotisation tontine (par tour)"
            value={tontineAmount}
            onChange={(e) => setTontineAmount(digits(e.target.value))}
            inputMode="numeric"
            suffix="F CFA"
            placeholder="Ex. 10000"
          />
          <TextField
            label="Cotisation solidarité"
            value={solidarityAmount}
            onChange={(e) => setSolidarityAmount(digits(e.target.value))}
            inputMode="numeric"
            suffix="F CFA"
            placeholder="Ex. 2000"
          />
          <TextField
            label="Frais de gestion du fondateur (par tour)"
            value={managementFee}
            onChange={(e) => setManagementFee(digits(e.target.value))}
            inputMode="numeric"
            suffix="F CFA"
            placeholder="Ex. 500"
          />
        </section>

        <section className="space-y-3">
          <SectionTitle>Adhésion et remplacement</SectionTitle>
          <p className={labelClass}>Documents exigés des nouveaux membres</p>
          <div role="radiogroup" aria-label="Documents exigés" className="space-y-2.5">
            {KYC_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.key}
                title={opt.label}
                description={opt.desc}
                selected={kycRequirement === opt.key}
                onClick={() => setKycRequirement(opt.key)}
              />
            ))}
          </div>

          <p className={`${labelClass} pt-2`}>Si un membre quitte le cercle</p>
          <div role="radiogroup" aria-label="Si un membre quitte le cercle" className="space-y-2.5">
            {LEAVING_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.key}
                title={opt.label}
                description={opt.desc}
                selected={leavingRule === opt.key}
                onClick={() => setLeavingRule(opt.key)}
              />
            ))}
          </div>
          {leavingRule !== ReplacementRule.PAY_PAST_TURNS && (
            <Notice icon={AlertTriangle} tone="warning">
              Sans rachat des tours passés, les nouveaux membres n&apos;auront pas de frais à payer pour adhérer.
            </Notice>
          )}

          <p className={`${labelClass} pt-2`}>Retards tolérés avant exclusion</p>
          <ChipGroup label="Retards tolérés avant exclusion">
            {EXCLUSION_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={`${opt} retards`}
                selected={exclusionThreshold === opt}
                onClick={() => setExclusionThreshold(opt)}
              />
            ))}
          </ChipGroup>

          <div className="rounded-[20px] border border-line bg-white px-4">
            <SettingRow
              id="deposit-required"
              title="Dépôt de garantie obligatoire"
              description="Un tour de cotisation déposé d'avance (cercle en cours)"
              last
            >
              <Toggle checked={depositRequired} onChange={setDepositRequired} labelledBy="deposit-required" />
            </SettingRow>
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>Règlement du cercle</SectionTitle>
          <TextArea
            label="Conditions d'adhésion"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="Ex. Cotisation le 1er de chaque mois avant 18 h…"
            hint="Lues et acceptées par chaque nouveau membre."
          />
        </section>

        <section className="space-y-3">
          <SectionTitle>Code d&apos;invitation</SectionTitle>
          <div className="flex items-center gap-3 rounded-[20px] border border-line bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[20px] font-bold tracking-wider text-ink">{inviteCode}</p>
              <p className="text-[13px] text-muted">Les nouveaux membres l&apos;utilisent pour vous rejoindre</p>
            </div>
            <button
              type="button"
              onClick={regenerateCode}
              aria-label="Générer un nouveau code"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary-tint px-3.5 text-[14px] font-semibold text-primary hover:bg-[#D5E9E0]"
            >
              <RefreshCw size={16} aria-hidden />
              Générer
            </button>
          </div>
          <Notice icon={ShieldCheck} tone="primary">
            Le fondateur ne touche jamais les fonds : toutes les sommes versées (cotisations, rachat, dépôt) vont
            directement dans le compte du cercle.
          </Notice>
        </section>

        <ScreenFooter>
          <Button onClick={handleSave}>Enregistrer les modifications</Button>
        </ScreenFooter>
      </ScreenBody>
    </>
  );
}
