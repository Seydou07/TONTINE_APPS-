'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Chip, ChipGroup, SettingRow } from '@/components/ui/choice';
import { TextField } from '@/components/ui/TextField';
import { Toggle } from '@/components/ui/Toggle';
import { label as labelClass } from '@/components/ui/classes';
import { formatF, formatFcfa } from '@/lib/format';
import { MobileMoneyCheckout } from '@/features/payment/components/MobileMoneyCheckout';

/** Montants proposés (mêmes valeurs que l'app mobile). */
export const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

const PHONE_DIGITS = 8;

function phoneDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, PHONE_DIGITS);
}

function formatLocal(value: string) {
  return phoneDigits(value).replace(/(\d{2})(?=\d)/g, '$1 ');
}

export interface ContributionDone {
  amount: number;
  /** null = contribution anonyme */
  displayName: string | null;
}

/**
 * Contribution sans compte à une cagnotte (même formulaire que la feuille
 * « Contribuer » mobile) : montant, anonymat, nom, numéro Mobile Money, puis le
 * parcours de paiement unique (opérateur → Payer → Confirmer → USSD).
 * TODO API : `POST /public/appeals/:code/contributions`
 * { amount, provider, phoneNumber, displayName?, anonymous } puis suivi du paiement
 * (docs/api-mobile.md, sections 4 et 7).
 */
export function ContributeFlow({
  beneficiaryName,
  minContribution = 0,
  onContributed,
  onClose,
}: {
  beneficiaryName: string;
  minContribution?: number;
  onContributed: (c: ContributionDone) => void;
  /** Bouton « Fermer » après le paiement (feuille) ; sinon le formulaire est réinitialisé. */
  onClose?: () => void;
}) {
  const nameId = useId();
  const [step, setStep] = useState<'form' | 'pay'>('form');
  const [quickAmount, setQuickAmount] = useState(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string>();

  const amount = customAmount ? parseInt(customAmount, 10) || 0 : quickAmount;
  const digits = phoneDigits(phone);
  const amountError =
    customAmount && amount > 0 && amount < minContribution
      ? `Le montant minimum est de ${formatF(minContribution)}.`
      : undefined;
  const canContinue =
    amount > 0 && amount >= minContribution && digits.length === PHONE_DIGITS && (anonymous || name.trim().length >= 2);

  const validatePhone = (v: string) => {
    const n = phoneDigits(v).length;
    if (n === 0) return 'Entrez votre numéro Mobile Money.';
    if (n < PHONE_DIGITS) return `Le numéro doit contenir ${PHONE_DIGITS} chiffres (${n} saisi${n > 1 ? 's' : ''}).`;
    return undefined;
  };

  const reset = () => {
    setStep('form');
    setCustomAmount('');
    setQuickAmount(2000);
    setName('');
    setPhone('');
    setAnonymous(false);
  };

  if (step === 'pay') {
    return (
      <MobileMoneyCheckout
        amount={amount}
        phone={`+226${digits}`}
        title="Contribuer"
        details={[{ label: 'Pour', value: beneficiaryName }]}
        confirmDetail={`Contribution pour ${beneficiaryName}`}
        successText={`Merci pour votre générosité. Votre contribution de ${formatFcfa(
          amount,
        )} pour ${beneficiaryName} a été prise en compte. Vous recevrez un SMS de confirmation de votre opérateur.`}
        onSuccess={() => onContributed({ amount, displayName: anonymous ? null : name.trim() })}
        done={onClose ? { onClick: onClose, label: 'Fermer' } : { onClick: reset, label: 'Fermer' }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-muted">Pour {beneficiaryName}</p>

      <div>
        <p className={labelClass}>Montant</p>
        <ChipGroup label="Montant">
          {QUICK_AMOUNTS.map((a) => (
            <Chip
              key={a}
              label={formatF(a)}
              selected={!customAmount && quickAmount === a}
              onClick={() => {
                setCustomAmount('');
                setQuickAmount(a);
              }}
            />
          ))}
        </ChipGroup>
        <TextField
          containerClassName="mt-2.5"
          aria-label="Autre montant"
          placeholder="Autre montant"
          suffix="F CFA"
          inputMode="numeric"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value.replace(/\D/g, '').slice(0, 7))}
          error={amountError}
        />
      </div>

      <div className="rounded-[14px] border border-line px-3.5">
        <SettingRow id={nameId} title="Rester anonyme" description="Votre nom n’apparaîtra pas dans la liste" last>
          <Toggle checked={anonymous} onChange={setAnonymous} labelledBy={nameId} />
        </SettingRow>
      </div>

      {!anonymous && (
        <TextField
          label="Nom complet"
          placeholder="Votre nom complet"
          autoComplete="name"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <TextField
        label="Numéro Mobile Money"
        prefix="+226"
        placeholder="70 00 00 00"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={phone}
        onChange={(e) => {
          const v = formatLocal(e.target.value);
          setPhone(v);
          if (phoneError) setPhoneError(validatePhone(v));
        }}
        onBlur={() => phone && setPhoneError(validatePhone(phone))}
        error={phoneError}
      />

      <Button disabled={!canContinue} onClick={() => setStep('pay')}>
        Continuer
      </Button>
    </div>
  );
}
