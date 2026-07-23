'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  FileText,
  Upload,
  CreditCard,
  Check,
  AlertTriangle,
  Info,
  Shield,
  Clock,
  Users,
  Settings,
} from 'lucide-react';
import { mockCircles, mockCycles } from '@venega/types';
import { CircleType } from '@venega/types';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

const searchResults = mockCircles.filter((c) => c.id !== 'c1');

export default function JoinCirclePage() {
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'conditions' | 'form' | 'done'>('search');
  const [inviteCode, setInviteCode] = useState('');
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    depositNumber: '',
    cnibFront: null as File | null,
    cnibBack: null as File | null,
  });

  const selectedCircle = mockCircles.find((c) => c.id === selectedCircleId);
  const activeCycle = selectedCircle ? mockCycles.find((c) => c.circleId === selectedCircle.id && c.isActive) : null;
  const currentTurn = activeCycle?.currentTurn ?? 1;
  const pastTurns = currentTurn - 1;
  const rachatAmount = selectedCircle ? pastTurns * selectedCircle.tontineAmount : 0;
  const depositAmount = selectedCircle?.depositRequired ? selectedCircle.tontineAmount : 0;
  const totalPayment = rachatAmount + depositAmount;

  const handleSearch = () => {
    const found = mockCircles.find(
      (c) => c.id !== 'c1' && (c.inviteCode.toUpperCase() === inviteCode.toUpperCase() || c.name.toLowerCase().includes(inviteCode.toLowerCase()))
    );
    if (found) {
      setSelectedCircleId(found.id);
      setStep('conditions');
    }
  };

  const handleJoin = () => {
    setStep('done');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/circles" className="p-2 hover:bg-bg rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-main">Rejoindre un cercle</h1>
          <p className="text-text-muted text-sm">Entrez le code d'invitation ou recherchez un cercle</p>
        </div>
      </div>

      {/* Search / Code */}
      {step === 'search' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
              <Search size={20} className="text-primary" />
              Code d'invitation
            </h2>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ex: OUED2026"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1 px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase tracking-wider"
              />
              <button
                onClick={handleSearch}
                disabled={!inviteCode}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Rechercher
              </button>
            </div>
          </div>

          {/* Search results */}
          <div className="space-y-3">
            <p className="text-sm text-text-muted font-medium">Cercles disponibles</p>
            {searchResults.map((circle) => {
              const cycle = mockCycles.find((c) => c.circleId === circle.id && c.isActive);
              return (
                <button
                  key={circle.id}
                  onClick={() => {
                    setSelectedCircleId(circle.id);
                    setStep('conditions');
                  }}
                  className="w-full bg-surface rounded-2xl border border-border p-4 text-left hover:border-primary/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-text-main">{circle.name}</h3>
                      <p className="text-sm text-text-muted mt-0.5">
                        {circle.type === CircleType.TONTINE_ONLY ? 'Tontine rotative' : circle.type === CircleType.SOLIDARITY_ONLY ? 'Fonds de solidarité' : 'Hybride'} — {circle.memberCount} membres
                      </p>
                      <p className="text-xs text-text-muted mt-1">{circle.conditions?.substring(0, 80)}...</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-semibold text-primary">{formatXOF(circle.tontineAmount)}/tour</span>
                      {cycle && (
                        <p className="text-xs text-text-muted mt-0.5">Tour {cycle.currentTurn}/{cycle.totalTurns}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conditions — FULL circle config displayed */}
      {step === 'conditions' && selectedCircle && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Conditions du cercle
            </h2>

            <div className="bg-bg rounded-xl p-4 border border-border">
              <h3 className="font-medium text-text-main">{selectedCircle.name}</h3>
              <p className="text-sm text-text-muted mt-1">{selectedCircle.conditions}</p>
            </div>

            {/* All circle config */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">
                <Settings size={14} className="text-primary" />
                Configuration du cercle
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-text-muted">Cotisation tontine</p>
                  <p className="font-semibold text-text-main">{formatXOF(selectedCircle.tontineAmount)}</p>
                </div>
                {selectedCircle.solidarityAmount > 0 && (
                  <div className="bg-bg rounded-xl p-3 border border-border">
                    <p className="text-xs text-text-muted">Cotisation solidarité</p>
                    <p className="font-semibold text-text-main">{formatXOF(selectedCircle.solidarityAmount)}</p>
                  </div>
                )}
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-text-muted">Fréquence</p>
                  <p className="font-semibold text-text-main">{selectedCircle.frequency === 'MONTHLY' ? 'Mensuel' : selectedCircle.frequency === 'WEEKLY' ? 'Hebdomadaire' : 'Bimensuel'}</p>
                </div>
                <div className="bg-bg rounded-xl p-3 border border-border">
                  <p className="text-xs text-text-muted">Membres</p>
                  <p className="font-semibold text-text-main">{selectedCircle.memberCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedCircle.managementFee > 0 && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Shield size={14} className="text-primary shrink-0" />
                    <span>Frais de gestion : <strong className="text-text-main">{formatXOF(selectedCircle.managementFee)}/tour</strong></span>
                  </div>
                )}
                {selectedCircle.depositRequired && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <CreditCard size={14} className="text-primary shrink-0" />
                    <span>Dépôt de garantie : <strong className="text-text-main">{formatXOF(selectedCircle.tontineAmount)}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <AlertTriangle size={14} className="text-warning shrink-0" />
                  <span>Exclusion après <strong className="text-text-main">{selectedCircle.exclusionThreshold} retards</strong></span>
                </div>
                {selectedCircle.recalculateOnLeave && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Info size={14} className="text-primary shrink-0" />
                    <span>Les cotisations sont <strong className="text-text-main">recalculées</strong> si un membre part</span>
                  </div>
                )}
                {selectedCircle.nextPaymentRequired && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Clock size={14} className="text-warning shrink-0" />
                    <span>Le bénéficiaire doit <strong className="text-text-main">payer avant de recevoir</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Rachat warning */}
            <div className="bg-warning/10 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-warning mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-text-main">Important</p>
                <p className="text-text-muted mt-0.5">
                  Vous rejoignez ce cercle à <strong>tour {currentTurn}</strong>. Vous devrez payer les cotisations des {pastTurns} tour{pastTurns > 1 ? 's' : ''} passé{pastTurns > 1 ? 's' : ''} (frais de rachat) : <strong>{formatXOF(selectedCircle.tontineAmount)} × {pastTurns} = {formatXOF(rachatAmount)}</strong>.
                </p>
                {selectedCircle.depositRequired && (
                  <p className="text-text-muted mt-1">
                    + Dépôt de garantie : <strong>{formatXOF(depositAmount)}</strong>
                  </p>
                )}
                <p className="text-text-main font-semibold mt-2">Total à payer : {formatXOF(totalPayment)}</p>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3 bg-bg rounded-xl border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={conditionsAccepted}
                onChange={(e) => setConditionsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-main">
                J'ai lu et j'accepte les conditions du cercle, y compris les frais de rachat de <strong>{formatXOF(rachatAmount)}</strong>
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('search')}
              className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-bg transition-colors"
            >
              Retour
            </button>
            <button
              onClick={() => setStep('form')}
              disabled={!conditionsAccepted}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {step === 'form' && selectedCircle && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Vos informations
            </h2>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Nom complet</label>
              <input
                type="text"
                placeholder="Ex: Aminata Ouédraogo"
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Numéro de téléphone</label>
              <input
                type="tel"
                placeholder="+226 70 12 34 56"
                value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Numéro de dépôt Mobile Money</label>
              <input
                type="tel"
                placeholder="+226 70 12 34 56"
                value={form.depositNumber}
                onChange={(e) => setForm((p) => ({ ...p, depositNumber: e.target.value }))}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">CNIB recto</label>
                <label className="flex items-center justify-center gap-2 p-4 bg-bg border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                  <Upload size={18} className="text-text-muted" />
                  <span className="text-sm text-text-muted">{form.cnibFront ? form.cnibFront.name : 'Choisir'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => setForm((p) => ({ ...p, cnibFront: e.target.files?.[0] || null }))}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">CNIB verso</label>
                <label className="flex items-center justify-center gap-2 p-4 bg-bg border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                  <Upload size={18} className="text-text-muted" />
                  <span className="text-sm text-text-muted">{form.cnibBack ? form.cnibBack.name : 'Choisir'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => setForm((p) => ({ ...p, cnibBack: e.target.files?.[0] || null }))}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-3">
            <h3 className="font-medium text-sm text-text-main">Récapitulatif de paiement</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Frais de rachat ({pastTurns} tour{pastTurns > 1 ? 's' : ''} × {formatXOF(selectedCircle.tontineAmount)})</span>
                <span className="font-semibold">{formatXOF(rachatAmount)}</span>
              </div>
              {selectedCircle.depositRequired && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Dépôt de garantie</span>
                  <span className="font-semibold">{formatXOF(depositAmount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="font-medium text-text-main">Total à payer</span>
                <span className="font-bold text-primary text-lg">{formatXOF(totalPayment)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('conditions')}
              className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-bg transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleJoin}
              disabled={!form.fullName || !form.phoneNumber || !form.depositNumber}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Envoyer la demande
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <Check size={32} className="text-success" />
          </div>
          <h2 className="font-heading font-bold text-xl text-text-main">Demande envoyée !</h2>
          <p className="text-text-muted max-w-sm mx-auto">
            Votre demande d'adhésion à <strong>{selectedCircle?.name}</strong> est en attente de validation par le président. Vous recevrez une notification une fois la décision prise.
          </p>
          <Link
            href="/circles"
            className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Retour aux cercles
          </Link>
        </div>
      )}
    </div>
  );
}
