'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  BadgeCheck,
  Clock,
  Heart,
  Package,
  Minus,
  Plus,
  Info,
  Camera,
} from 'lucide-react';

const circleTypes = [
  {
    key: 'TONTINE_ONLY',
    label: 'Tontine',
    desc: 'Chaque membre cotise à tour de rôle et reçoit la cagnotte à son tour',
    icon: Clock,
    iconBg: 'bg-accent-tint',
    iconColor: 'text-accent-dark',
  },
  {
    key: 'SOLIDARITY_ONLY',
    label: 'Caisse de solidarité',
    desc: "Un fonds commun pour venir en aide aux membres en cas de besoin, sans rotation",
    icon: Heart,
    iconBg: 'bg-info-tint',
    iconColor: 'text-info',
  },
  {
    key: 'NATURE',
    label: 'Tontine en nature',
    desc: 'Cagnotte distribuée en biens ou produits (moto, vivres, pagnes...)',
    icon: Package,
    iconBg: 'bg-primary-tint',
    iconColor: 'text-primary-dark',
  },
] as const;

const frequencies = [
  { key: 'DAILY', label: 'Journalier', desc: 'Chaque jour' },
  { key: 'WEEKLY', label: 'Hebdomadaire', desc: 'Chaque semaine' },
  { key: 'MONTHLY', label: 'Mensuel', desc: 'Chaque mois' },
  { key: 'CUSTOM', label: 'Personnalisé', desc: 'Intervalle sur mesure' },
] as const;

const frequencyLabel: Record<string, string> = {
  DAILY: 'Journalière',
  WEEKLY: 'Hebdomadaire',
  MONTHLY: 'Mensuelle',
  CUSTOM: 'Personnalisée',
};

const kycRequirementOptions = [
  { key: 'REQUIRE_NONE', label: 'Aucun document', desc: 'À vos risques et périls (membres de confiance)' },
  { key: 'REQUIRE_CNIB', label: 'CNIB obligatoire', desc: "Une pièce d'identité valide requise" },
  { key: 'REQUIRE_CNIB_SELFIE', label: 'CNIB + Selfie (Recommandé)', desc: 'Sécurité maximale et vérification faciale' },
];

const leavingRuleOptions = [
  { key: 'BUYOUT_REQUIRED', label: 'Rachat du tour obligatoire', desc: 'Le nouvel entrant rachète les cotisations passées' },
  { key: 'REDUCE_POOL', label: 'Réduction de la cagnotte', desc: "La cagnotte s'ajuste au nombre de membres restants" },
];

const exclusionOptions = ['2', '3', '4', '5'];
const stepLabels = ['Type', 'Paramètres', 'Règles', 'Résumé'];

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';

export default function CreateCirclePage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('TONTINE_ONLY');
  const [frequency, setFrequency] = useState<string>('MONTHLY');
  const [customDays, setCustomDays] = useState('3');

  const [natureDescription, setNatureDescription] = useState('');
  const [naturePhotoUploaded, setNaturePhotoUploaded] = useState(false);

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

  const usesTontine = type === 'TONTINE_ONLY' || type === 'NATURE';
  const usesSolidarity = type === 'SOLIDARITY_ONLY';

  const tontine = usesTontine ? parseFloat(tontineAmount) || 0 : 0;
  const solidarity = usesSolidarity ? parseFloat(solidarityAmount) || 0 : 0;
  const fee = parseFloat(managementFee) || 0;
  const total = tontine + solidarity + fee;

  const typeMeta = circleTypes.find((t) => t.key === type)!;

  const handleCreate = () => {
    const prefix = (name.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'VENE').toUpperCase();
    const code = prefix + Math.floor(1000 + Math.random() * 9000).toString();
    setCreated({ name: name.trim(), inviteCode: code });
  };

  if (created) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-tint flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-primary-dark" strokeWidth={3} />
          </div>
          <h1 className="font-heading font-bold text-xl text-text-main mb-2">Cercle créé !</h1>
          <p className="text-text-muted text-sm mb-6">
            Bienvenue dans votre nouveau cercle <strong className="text-text-main">{created.name}</strong>
          </p>

          <div className="bg-bg rounded-xl border border-border p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-primary-dark" />
              <p className="font-heading font-semibold text-sm text-text-main">En attente d'activation</p>
            </div>
            <p className="text-text-muted text-sm leading-relaxed text-left mb-4">
              Votre cercle apparaît maintenant dans votre liste de cercles, grisé. Réglez les frais d'activation
              (2 000 F CFA) par mobile money pour le mettre en service.
            </p>
            <div className="bg-primary-tint rounded-lg p-4 text-left">
              <p className="text-xs text-primary-dark">Code d'invitation</p>
              <p className="font-heading font-bold text-lg text-primary-dark tracking-widest">{created.inviteCode}</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/circles')}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <BadgeCheck size={18} />
            Voir mes cercles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* En-tête + stepper */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={20} className="text-text-main" />
          </button>
          <h1 className="font-heading font-bold text-xl text-text-main">Créer un cercle</h1>
        </div>

        <div className="flex items-start">
          {stepLabels.map((label, idx) => {
            const completed = idx < step - 1;
            const current = idx === step - 1;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center w-16">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-semibold ${
                      completed || current
                        ? 'bg-primary-dark border-primary-dark text-white'
                        : 'bg-surface border-border text-text-muted'
                    }`}
                  >
                    {completed ? <Check size={12} strokeWidth={3} /> : idx + 1}
                  </div>
                  <span className={`mt-1.5 text-[11px] text-center ${current ? 'font-semibold text-text-main' : 'text-text-muted'}`}>
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div className={`flex-1 h-0.5 mt-3 ${idx < step - 1 ? 'bg-primary-dark' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ÉTAPE 1 — TYPE */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-heading font-bold text-xl text-text-main mb-1">Quel type de cercle voulez-vous créer ?</h2>
            <p className="text-text-muted text-sm">Ce choix détermine le fonctionnement du cercle. Vous pourrez y ajouter des membres ensuite.</p>
          </div>

          <div className="space-y-2.5">
            {circleTypes.map((t) => {
              const active = type === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-colors ${
                    active ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${t.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={t.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-text-main">{t.label}</p>
                    <p className={`text-xs mt-0.5 ${t.iconColor}`}>{t.desc}</p>
                  </div>
                  {active && (
                    <div className="w-5.5 h-5.5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check size={13} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {type === 'NATURE' && (
            <div className="space-y-3">
              <Field label="Description du lot / Box en nature *">
                <textarea
                  value={natureDescription}
                  onChange={(e) => setNatureDescription(e.target.value)}
                  placeholder="Ex: Moto Yamaha 125cc OU Box (5 sacs de riz 25kg + 5L huile + 2 cartons sardines)..."
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl h-24 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </Field>
              <Field label="Photo du lot / de la cagnotte">
                <button
                  onClick={() => setNaturePhotoUploaded(true)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-colors ${
                    naturePhotoUploaded ? 'border-success bg-success/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <Camera size={20} className={naturePhotoUploaded ? 'text-success' : 'text-primary-dark'} />
                  <span className="text-sm text-text-main">
                    {naturePhotoUploaded ? 'Photo du lot ajoutée avec succès' : 'Prendre ou uploader une photo du lot'}
                  </span>
                </button>
              </Field>
            </div>
          )}

          <PrimaryButton onClick={() => setStep(2)}>Continuer</PrimaryButton>
        </div>
      )}

      {/* ÉTAPE 2 — PARAMÈTRES */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-heading font-bold text-xl text-text-main mb-1">Paramètres du cercle</h2>
            <p className="text-text-muted text-sm">Nom, montants et fréquence des cotisations.</p>
          </div>

          <Field label="Nom du cercle *">
            <Input value={name} onChange={setName} placeholder="Ex: Tontine Commerçants Dassasgho" />
          </Field>

          {usesTontine && (
            <Field label="Cotisation tontine (F CFA / tour) *">
              <Input value={tontineAmount} onChange={setTontineAmount} placeholder="Ex: 10000" type="number" />
            </Field>
          )}

          {usesSolidarity && (
            <Field label="Cotisation caisse solidarité (F CFA) *">
              <Input value={solidarityAmount} onChange={setSolidarityAmount} placeholder="Ex: 2000" type="number" />
            </Field>
          )}

          <Field label="Frais de gestion du Président (F CFA)">
            <Input value={managementFee} onChange={setManagementFee} placeholder="Ex: 500" type="number" />
          </Field>

          <div className="bg-primary/5 rounded-2xl p-5 text-center">
            <p className="text-primary-dark text-sm mb-1">Cotisation totale par membre et par tour</p>
            <p className="font-heading font-bold text-2xl text-primary-dark">{formatXOF(total)}</p>
            <p className="text-primary-dark/80 text-xs mt-1">Cotisation + Frais de gestion président inclus</p>
          </div>

          <Field label="Fréquence des cotisations *">
            <div className="grid grid-cols-2 gap-2.5">
              {frequencies.map((f) => {
                const isSelected = frequency === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFrequency(f.key)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/30'
                    }`}
                  >
                    <p className={`font-heading font-semibold text-sm ${isSelected ? 'text-primary-dark' : 'text-text-main'}`}>{f.label}</p>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-primary-dark' : 'text-text-muted'}`}>{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </Field>

          {frequency === 'CUSTOM' && (
            <Field label="Intervalle de cotisation (en jours) *">
              <Input value={customDays} onChange={setCustomDays} placeholder="Ex: 3 (tous les 3 jours) ou 14" type="number" />
            </Field>
          )}

          <Field label="Nombre maximum de membres *">
            <Input value={maxMembers} onChange={setMaxMembers} placeholder="Ex: 10" type="number" />
          </Field>

          <PrimaryButton onClick={() => setStep(3)} disabled={!name.trim()}>Continuer</PrimaryButton>
        </div>
      )}

      {/* ÉTAPE 3 — RÈGLES */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-heading font-bold text-xl text-text-main mb-1">Règles du cercle</h2>
            <p className="text-text-muted text-sm">Ces règles protègent le cercle et s'appliqueront à tous les membres, y compris vous.</p>
          </div>

          {usesTontine && (
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">
                Combien de membres reçoivent la cagnotte à chaque tour ?
              </label>
              <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-2xl">
                <span className="text-sm text-text-main">Bénéficiaires par tour</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBeneficiariesPerTurn((n) => Math.max(1, n - 1))}
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Minus size={15} className="text-primary-dark" />
                  </button>
                  <span className="font-heading font-bold text-text-main w-6 text-center">{beneficiariesPerTurn}</span>
                  <button
                    onClick={() => setBeneficiariesPerTurn((n) => n + 1)}
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={15} className="text-primary-dark" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 p-4 bg-surface border border-border rounded-2xl">
            <div>
              <p className="text-sm font-semibold text-text-main">Dépôt de garantie à l'entrée</p>
              <p className="text-xs text-text-muted mt-0.5">Chaque nouveau membre verse une avance remboursable en quittant le cercle</p>
            </div>
            <button
              onClick={() => setDepositRequired((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${depositRequired ? 'bg-primary-dark' : 'bg-border'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  depositRequired ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <Field label="Combien de retards tolérés avant exclusion ?">
            <div className="flex gap-2">
              {exclusionOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setExclusionThreshold(opt)}
                  className={`flex-1 h-11 rounded-xl border-2 font-heading font-bold transition-colors ${
                    exclusionThreshold === opt
                      ? 'bg-primary-dark border-primary-dark text-white'
                      : 'border-border/60 text-text-main hover:border-primary/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">Au-delà, vous pourrez proposer son exclusion au vote du bureau.</p>
          </Field>

          <Field label="Conditions d'adhésion à afficher aux nouveaux membres">
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Ex. : Le membre s'engage à cotiser avant le 5 de chaque mois et à prévenir le bureau en cas d'empêchement…"
              className="w-full px-4 py-3 bg-surface border border-border rounded-2xl h-24 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          <Field label="Exigence de documents pour les membres *">
            <div className="space-y-2.5">
              {kycRequirementOptions.map((opt) => (
                <OptionCard
                  key={opt.key}
                  active={kycRequirement === opt.key}
                  title={opt.label}
                  desc={opt.desc}
                  onClick={() => setKycRequirement(opt.key)}
                />
              ))}
            </div>
          </Field>

          <Field label="Règle en cas de départ d'un membre *">
            <div className="space-y-2.5">
              {leavingRuleOptions.map((rule) => (
                <OptionCard
                  key={rule.key}
                  active={leavingRule === rule.key}
                  title={rule.label}
                  desc={rule.desc}
                  onClick={() => setLeavingRule(rule.key)}
                />
              ))}
            </div>
          </Field>

          <PrimaryButton onClick={() => setStep(4)}>Continuer</PrimaryButton>
        </div>
      )}

      {/* ÉTAPE 4 — RÉSUMÉ */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h2 className="font-heading font-bold text-xl text-text-main mb-1">Vérifiez avant de créer</h2>
            <p className="text-text-muted text-sm">Vous pourrez modifier ces réglages plus tard depuis les paramètres du cercle.</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
            <SummaryRow label="Nom du cercle" value={name || '—'} />
            <SummaryRow
              label="Type"
              valueNode={
                <span className="px-2.5 py-1 bg-primary-tint text-primary-dark text-xs font-semibold rounded-lg">
                  {typeMeta.label}
                </span>
              }
            />
            {usesTontine && <SummaryRow label="Cotisation tontine" value={formatXOF(tontine)} />}
            {usesSolidarity && <SummaryRow label="Cotisation solidarité" value={formatXOF(solidarity)} />}
            <SummaryRow label="Fréquence" value={frequency === 'CUSTOM' ? `Tous les ${customDays} jours` : frequencyLabel[frequency]} />
            {usesTontine && (
              <SummaryRow label="Bénéficiaires par tour" value={`${beneficiariesPerTurn} membre${beneficiariesPerTurn > 1 ? 's' : ''}`} />
            )}
          </div>

          <div className="flex items-start gap-3 bg-accent-tint rounded-2xl p-4">
            <Info size={16} className="text-accent-dark mt-0.5 shrink-0" />
            <p className="text-sm text-accent-dark">
              Un code d'invitation sera généré pour partager ce cercle avec vos futurs membres.
            </p>
          </div>

          <PrimaryButton onClick={handleCreate}>Créer le cercle</PrimaryButton>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-main mb-2">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  );
}

function OptionCard({ active, title, desc, onClick }: { active: boolean; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
        active ? 'border-primary-dark bg-primary/5' : 'border-border/60 hover:border-primary/30'
      }`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <p className={`font-heading font-semibold text-sm ${active ? 'text-primary-dark' : 'text-text-main'}`}>{title}</p>
        {active && <BadgeCheck size={17} className="text-primary-dark" />}
      </div>
      <p className="text-xs text-text-muted">{desc}</p>
    </button>
  );
}

function SummaryRow({ label, value, valueNode }: { label: string; value?: string; valueNode?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm text-text-muted">{label}</span>
      {valueNode ?? <span className="text-sm font-semibold text-text-main">{value}</span>}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 bg-primary text-white rounded-2xl font-heading font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
    >
      {children}
    </button>
  );
}
