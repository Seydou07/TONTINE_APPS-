'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Copy, Loader2 } from 'lucide-react';
import { mockCircles, mockCurrentUser } from '@venega/types';

const formatXOF = (n: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(n);

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money', logo: '/operators/orange.png', prefix: '800' },
  { id: 'MOOV', name: 'Moov Africa', logo: '/operators/moov.png', prefix: '802' },
  { id: 'WAVE', name: 'Wave', logo: '/operators/wave.png', prefix: '888' },
];

const buildUssdCode = (prefix: string, amount: number) =>
  `*${prefix}*${Math.round(amount)}*${Math.floor(100 + Math.random() * 900)}#`;

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPageContent />
    </Suspense>
  );
}

function PaymentPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const circleId = params.get('circleId') ?? mockCircles[0]?.id ?? '';
  const amount = parseFloat(params.get('amount') || '0') || mockCircles.find((c) => c.id === circleId)?.tontineAmount || 0;
  const type = params.get('type') === 'SOLIDARITY' ? 'SOLIDARITY' : 'TONTINE';
  const circle = mockCircles.find((c) => c.id === circleId) ?? mockCircles[0];

  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<'closed' | 'confirm' | 'ussd' | 'checking' | 'done'>('closed');
  const [ussdCode, setUssdCode] = useState('');
  const [copied, setCopied] = useState(false);

  const typeLabel = type === 'SOLIDARITY' ? 'Cotisation solidarité' : 'Cotisation tontine';
  const operator = OPERATORS.find((o) => o.id === selectedOperator);

  const handleConfirm = () => {
    if (!operator) return;
    setUssdCode(buildUssdCode(operator.prefix, amount));
    setModalStep('ussd');
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(ussdCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuted = () => {
    setModalStep('checking');
    setTimeout(() => setModalStep('done'), 2000);
  };

  const handleFinish = () => {
    setModalStep('closed');
    router.push('/activity');
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-bg rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading font-bold text-2xl text-text-main">Payer ma cotisation</h1>
      </div>

      {/* Montant — bloc héros */}
      <div className="bg-primary-tint rounded-2xl py-7 text-center mb-6">
        <p className="text-primary-dark text-sm font-medium">Montant à payer</p>
        <p className="text-primary-dark text-3xl font-heading font-bold mt-1">{formatXOF(amount)}</p>
      </div>

      {/* Résumé */}
      <div className="bg-surface rounded-2xl border border-border divide-y divide-border mb-2">
        <Row label="Cercle" value={circle?.name ?? '—'} />
        <Row label="Type de cotisation" value={typeLabel} />
        <Row label="Numéro Mobile Money" value={mockCurrentUser.phoneNumber} />
        <Row label="Montant" value={formatXOF(amount)} valueClassName="text-primary-dark font-heading font-bold" />
      </div>
      <p className="text-xs text-text-muted mb-6">
        Le paiement est envoyé directement depuis votre numéro Mobile Money.
      </p>

      {/* Opérateur */}
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Choisissez l'opérateur</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {OPERATORS.map((op) => {
          const isSelected = op.id === selectedOperator;
          return (
            <button
              key={op.id}
              onClick={() => setSelectedOperator(op.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors ${
                isSelected ? 'border-primary bg-primary-tint/50' : 'border-border hover:border-primary/30'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check size={10} className="text-white" strokeWidth={3.5} />
                </div>
              )}
              <Image src={op.logo} alt={op.name} width={36} height={36} className="rounded-lg" />
              <span className={`text-xs text-center ${isSelected ? 'font-semibold text-primary-dark' : 'text-text-muted'}`}>
                {op.name}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => selectedOperator && setModalStep('confirm')}
        disabled={!selectedOperator}
        className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Payer {formatXOF(amount)}
      </button>

      {/* Modale — demande de confirmation */}
      {modalStep === 'confirm' && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-6 z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-heading font-bold text-base text-text-main">Demande de confirmation de paiement</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Vous êtes sur le point de payer <strong className="text-text-main">{formatXOF(amount)}</strong> depuis le
              numéro <strong className="text-text-main">{mockCurrentUser.phoneNumber}</strong>.
            </p>
            {operator && (
              <div className="flex items-center gap-3 bg-bg rounded-xl p-3">
                <span className="text-sm font-medium text-text-muted">Paiement via</span>
                <Image src={operator.logo} alt={operator.name} width={26} height={26} className="rounded-md" />
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModalStep('closed')}
                className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-bg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale — code USSD à composer sur le téléphone */}
      {modalStep === 'ussd' && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-6 z-50">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm space-y-4 text-center">
            <h2 className="font-heading font-bold text-base text-text-main">Exécutez le paiement</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Composez ce code sur votre téléphone pour valider le paiement depuis votre numéro Mobile Money.
            </p>
            <div className="bg-[#0F172A] rounded-xl py-4 px-3">
              <p className="font-heading font-bold text-lg text-[#36E395] tracking-wider">{ussdCode}</p>
            </div>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-bg transition-colors"
            >
              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              {copied ? 'Copié !' : 'Copier le code'}
            </button>
            <p className="text-xs text-text-muted">
              Dès que la transaction est détectée, le paiement est automatiquement validé.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModalStep('closed')}
                className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-bg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleExecuted}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                J'ai exécuté le paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale — vérification en cours */}
      {modalStep === 'checking' && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-6 z-50">
          <div className="bg-surface rounded-2xl p-8 w-full max-w-sm text-center space-y-4">
            <Loader2 size={32} className="text-primary-dark animate-spin mx-auto" />
            <h2 className="font-heading font-bold text-base text-text-main">Vérification en cours</h2>
            <p className="text-sm text-text-muted">Nous détectons votre transaction sur le réseau mobile money…</p>
          </div>
        </div>
      )}

      {/* Modale — paiement validé */}
      {modalStep === 'done' && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-6 z-50">
          <div className="bg-surface rounded-2xl p-8 w-full max-w-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary-tint flex items-center justify-center mx-auto">
              <Check size={28} className="text-primary-dark" strokeWidth={3} />
            </div>
            <h2 className="font-heading font-bold text-base text-text-main">Paiement validé</h2>
            <p className="text-sm text-text-muted">{formatXOF(amount)} ont bien été reçus pour votre cotisation.</p>
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Terminé
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span className={`text-sm font-medium text-text-main ${valueClassName ?? ''}`}>{value}</span>
    </div>
  );
}
