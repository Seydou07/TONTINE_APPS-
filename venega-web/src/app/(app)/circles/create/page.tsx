'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  HandHeart,
  Settings,
  DollarSign,
  Shield,
  AlertTriangle,
  Check,
  Info,
  ChevronDown,
} from 'lucide-react';

const circleTypes = [
  { id: 'TONTINE_ONLY', label: 'Tontine rotative', description: 'Cagnotte tontine uniquement' },
  { id: 'SOLIDARITY_ONLY', label: 'Fonds de solidarité', description: 'Entraide sans rotation' },
  { id: 'HYBRID', label: 'Hybride', description: 'Tontine + solidarité' },
];

const frequencies = [
  { id: 'DAILY', label: 'Quotidien' },
  { id: 'WEEKLY', label: 'Hebdomadaire' },
  { id: 'BIWEEKLY', label: 'Bimensuel' },
  { id: 'MONTHLY', label: 'Mensuel' },
  { id: 'QUARTERLY', label: 'Trimestriel' },
  { id: 'CUSTOM', label: 'Personnalisé' },
];

export default function CreateCirclePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    type: 'TONTINE_ONLY',
    frequency: 'MONTHLY',
    customFrequency: '',
    tontineAmount: '',
    solidarityAmount: '',
    managementFee: '0',
    depositRequired: false,
    recalculateOnLeave: true,
    exclusionThreshold: '3',
    nextPaymentRequired: false,
    conditions: '',
    inviteCode: '',
    maxMembers: '',
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // TODO: Connect to backend API
    console.log('Creating circle:', form);
    alert('Cercle créé ! (Backend à connecter)');
    router.push('/circles');
  };

  const tontineAmount = parseFloat(form.tontineAmount) || 0;
  const solidarityAmount = parseFloat(form.solidarityAmount) || 0;
  const managementFee = parseFloat(form.managementFee) || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/circles" className="p-2 hover:bg-bg rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-main">Créer un cercle</h1>
          <p className="text-text-muted text-sm">Configurez votre cercle d'épargne en quelques étapes</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Informations générales
            </h2>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Nom du cercle</label>
              <input
                type="text"
                placeholder="Ex: Tontine Famille Ouédraogo"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Type de cercle</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {circleTypes.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => updateField('type', ct.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.type === ct.id
                        ? 'border-primary bg-primary-tint'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="font-medium text-sm">{ct.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{ct.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Fréquence</label>
              <div className="flex flex-wrap gap-2">
                {frequencies.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateField('frequency', f.id)}
                    className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                      form.frequency === f.id
                        ? 'border-primary bg-primary-tint font-medium'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {form.frequency === 'CUSTOM' && (
                <input
                  type="text"
                  placeholder="Ex: Tous les 10 jours, le 1er et 15 du mois..."
                  value={form.customFrequency}
                  onChange={(e) => updateField('customFrequency', e.target.value)}
                  className="w-full mt-2 px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Nombre de membres</label>
              <input
                type="number"
                min={2}
                max={50}
                placeholder="Ex: 6"
                value={form.maxMembers}
                onChange={(e) => updateField('maxMembers', e.target.value)}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-text-muted">
                Minimum 2 membres. Le président est inclus dans ce nombre.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Code d'invitation</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Généré automatiquement"
                  value={form.inviteCode}
                  onChange={(e) => updateField('inviteCode', e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => {
                    const code = form.name
                      .replace(/[^a-zA-ZÀ-ÿ]/g, '')
                      .substring(0, 6)
                      .toUpperCase() + Math.floor(1000 + Math.random() * 9000);
                    updateField('inviteCode', code);
                  }}
                  className="px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-bg transition-colors"
                >
                  Générer
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Partagez ce code aux membres que vous souhaitez inviter.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!form.name || !form.maxMembers}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Continuer
          </button>
        </div>
      )}

      {/* Step 2: Amounts */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              Montants
            </h2>

            {(form.type === 'TONTINE_ONLY' || form.type === 'HYBRID') && (
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">
                  Cotisation tontine (XOF)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 10000"
                  value={form.tontineAmount}
                  onChange={(e) => updateField('tontineAmount', e.target.value)}
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {(form.type === 'SOLIDARITY_ONLY' || form.type === 'HYBRID') && (
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">
                  Cotisation solidarité (XOF)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2000"
                  value={form.solidarityAmount}
                  onChange={(e) => updateField('solidarityAmount', e.target.value)}
                  className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div className="bg-primary-tint rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Cotisation totale par tour (incl. frais de gestion)</span>
                <span className="font-semibold text-primary">
                  {tontineAmount + solidarityAmount + managementFee} XOF
                </span>
              </div>
              {managementFee > 0 && (
                <p className="text-xs text-primary/70 mt-1">
                  Cotisation {tontineAmount + solidarityAmount} + Frais {managementFee} = {tontineAmount + solidarityAmount + managementFee} XOF
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-bg transition-colors"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!form.tontineAmount && !form.solidarityAmount}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Options */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
              <Settings size={20} className="text-primary" />
              Options du cercle
            </h2>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                Frais de gestion (XOF) — votre marge
              </label>
              <input
                type="number"
                placeholder="Ex: 500"
                value={form.managementFee}
                onChange={(e) => updateField('managementFee', e.target.value)}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-text-muted">
                Commission perçue par tour. Payée automatiquement par Venega, pas retirée par vous.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                Seuil d'exclusion (nombre de retards)
              </label>
              <select
                value={form.exclusionThreshold}
                onChange={(e) => updateField('exclusionThreshold', e.target.value)}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="2">2 retards</option>
                <option value="3">3 retards</option>
                <option value="4">4 retards</option>
                <option value="5">5 retards</option>
              </select>
            </div>

            <label className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border cursor-pointer">
              <div>
                <div className="font-medium text-sm">Dépôt de garantie</div>
                <div className="text-xs text-text-muted">Nouveau membre dépose 1 cotisation en garantie</div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.depositRequired}
                  onChange={(e) => updateField('depositRequired', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.depositRequired ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${form.depositRequired ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border cursor-pointer">
              <div>
                <div className="font-medium text-sm">Recalculer si départ</div>
                <div className="text-xs text-text-muted">Si un membre part, recalcule les cotisations restantes</div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.recalculateOnLeave}
                  onChange={(e) => updateField('recalculateOnLeave', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.recalculateOnLeave ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${form.recalculateOnLeave ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border cursor-pointer">
              <div>
                <div className="font-medium text-sm">Cotisation tour suivant obligatoire</div>
                <div className="text-xs text-text-muted">Bénéficiaire doit payer le tour suivant avant de recevoir</div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.nextPaymentRequired}
                  onChange={(e) => updateField('nextPaymentRequired', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.nextPaymentRequired ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${form.nextPaymentRequired ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-bg transition-colors"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Conditions + Confirm */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Conditions et finalisation
            </h2>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                Conditions d'adhésion
              </label>
              <textarea
                placeholder="Ex: Cotisation obligatoire le 1er de chaque mois avant 18h. Tout retard de plus de 5 jours entraîne une pénalité..."
                value={form.conditions}
                onChange={(e) => updateField('conditions', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-primary-tint rounded-xl p-4 space-y-2">
              <h3 className="font-medium text-sm text-primary">Récapitulatif</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Nom</span>
                  <span className="font-medium">{form.name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Type</span>
                  <span className="font-medium">
                    {circleTypes.find((ct) => ct.id === form.type)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Fréquence</span>
                  <span className="font-medium">
                    {form.frequency === 'CUSTOM' ? form.customFrequency || 'Personnalisé' : frequencies.find((f) => f.id === form.frequency)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Nombre de membres</span>
                  <span className="font-medium">{form.maxMembers || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Code d'invitation</span>
                  <span className="font-medium uppercase tracking-wider">{form.inviteCode || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Cotisation totale</span>
                  <span className="font-semibold text-primary">
                    {tontineAmount + solidarityAmount + managementFee} XOF
                  </span>
                </div>
                {managementFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">  dont frais de gestion</span>
                    <span className="text-text-muted">{managementFee} XOF/tour</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Frais de gestion</span>
                  <span className="font-medium">{managementFee} XOF/tour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Dépôt de garantie</span>
                  <span className="font-medium">{form.depositRequired ? 'Oui' : 'Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Seuil d'exclusion</span>
                  <span className="font-medium">{form.exclusionThreshold} retards</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Recalcul si départ</span>
                  <span className="font-medium">{form.recalculateOnLeave ? 'Oui' : 'Non'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Bénéficiaire paie avant</span>
                  <span className="font-medium">{form.nextPaymentRequired ? 'Oui' : 'Non'}</span>
                </div>
                {form.inviteCode && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Code d'invitation</span>
                    <span className="font-mono font-semibold text-primary">{form.inviteCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-bg transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Créer le cercle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
