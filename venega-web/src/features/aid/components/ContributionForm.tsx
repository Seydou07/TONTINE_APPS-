'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CheckCircle2, ChevronLeft, Loader2, Smartphone } from 'lucide-react';
import { PaymentMethod } from '@venega/types';
import type { PublicContribution } from '../types';
import { OPERATORS, formatLocalPhone, formatNumber, formatXof } from '../format';
import {
  AMOUNT_PRESETS,
  MESSAGE_MAX,
  NAME_MAX,
  PAYABLE_OPERATORS,
  buildContributionSchema,
  isPayableOperator,
  normalizePhone,
  type ContributionValues,
  type PayableOperator,
} from '../schema';
import {
  btnPrimary,
  btnSecondary,
  card,
  errorText,
  inputBase,
  inputBorder,
  label,
  sectionTitle,
} from '../ui';
import { OperatorLogo } from './OperatorMark';
import { ShareButton } from './ShareButton';

interface PendingPayment {
  amount: number;
  operator: PayableOperator;
  /** 8 chiffres, gardé en mémoire uniquement le temps de la confirmation */
  phone: string;
  displayName: string | null;
  message?: string;
}

type Step =
  | { kind: 'form' }
  | { kind: 'confirm'; payment: PendingPayment; checking: boolean }
  | { kind: 'success'; amount: number };

interface ContributionFormProps {
  minContribution: number;
  beneficiaryName: string;
  share: { url: string; title: string; text: string };
  onContributed: (contribution: PublicContribution) => void;
}

const DEFAULT_VALUES: ContributionValues = {
  amount: '2000',
  anonymous: false,
  name: '',
  message: '',
  operator: '',
  phone: '',
};

function instructionsFor(operator: PayableOperator, phone: string): string[] {
  const number = `+226 ${formatLocalPhone(phone)}`;
  const label = OPERATORS[operator].label;
  if (operator === PaymentMethod.WAVE) {
    return [
      `Ouvrez l'application Wave sur le téléphone du ${number}.`,
      'Une demande de paiement Venega vous attend : vérifiez le montant.',
      'Validez avec votre code secret Wave.',
    ];
  }
  return [
    `Une demande de paiement va s'afficher sur le ${number}.`,
    'Vérifiez le montant et le bénéficiaire « Venega ».',
    `Saisissez votre code secret ${label} pour valider.`,
    `Si rien ne s'affiche après une minute, ouvrez le menu ${label} et consultez les paiements en attente.`,
  ];
}

export function ContributionForm({
  minContribution,
  beneficiaryName,
  share,
  onContributed,
}: ContributionFormProps) {
  const schema = useMemo(() => buildContributionSchema(minContribution), [minContribution]);
  const [step, setStep] = useState<Step>({ kind: 'form' });
  const [customAmount, setCustomAmount] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const customInputRef = useRef<HTMLInputElement | null>(null);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitted },
  } = useForm<ContributionValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const anonymous = watch('anonymous');
  const messageLength = watch('message')?.length ?? 0;

  useEffect(() => () => clearTimeout(checkTimer.current), []);

  // À chaque changement d'étape, on ramène le visiteur en haut du bloc.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step.kind]);

  useEffect(() => {
    if (customAmount) customInputRef.current?.focus();
  }, [customAmount]);

  function onValid(values: ContributionValues) {
    if (!isPayableOperator(values.operator)) return;
    // TODO: brancher le paiement (CinetPay) via l'API Venega — ne jamais appeler l'agrégateur depuis le navigateur avec une clé secrète.
    // Ex. POST /public/appeals/:code/contributions { amount, operator, phone, displayName, message }
    // -> l'API initie le paiement chez l'agrégateur (côté serveur) et renvoie un id de transaction ;
    // la page interroge ensuite le statut (ou reçoit le résultat du webhook) avant d'afficher le succès.
    setStep({
      kind: 'confirm',
      checking: false,
      payment: {
        amount: Number(values.amount),
        operator: values.operator,
        phone: normalizePhone(values.phone),
        displayName: values.anonymous ? null : values.name.trim(),
        message: values.message.trim() || undefined,
      },
    });
  }

  function confirmPayment(payment: PendingPayment) {
    setStep({ kind: 'confirm', payment, checking: true });
    // Simulation : en production, on attend la confirmation de l'API (statut de la transaction).
    checkTimer.current = setTimeout(() => {
      onContributed({
        id: `local-${Date.now()}`,
        displayName: payment.displayName,
        amount: payment.amount,
        paymentMethod: payment.operator,
        createdAt: new Date().toISOString(),
        message: payment.message,
      });
      setStep({ kind: 'success', amount: payment.amount });
    }, 1500);
  }

  function startOver() {
    reset(DEFAULT_VALUES);
    setCustomAmount(false);
    setStep({ kind: 'form' });
  }

  // ── Succès ──
  if (step.kind === 'success') {
    return (
      <section id="contribuer" aria-labelledby="contrib-title" className={`${card} scroll-mt-4 p-5`}>
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#E4F0EB] text-primary">
            <CheckCircle2 size={30} aria-hidden />
          </span>
          <h2 ref={headingRef} tabIndex={-1} id="contrib-title" className={`${sectionTitle} outline-none`}>
            Merci ! Votre contribution de {formatXof(step.amount)} a été envoyée.
          </h2>
          <p className="mt-2 text-[15px] text-[#5B6B65]">
            Elle sera versée à {beneficiaryName} après validation par les approbateurs. Partagez la
            cagnotte pour aider à atteindre l&apos;objectif.
          </p>
        </div>
        <div className="mt-5 space-y-2.5">
          <ShareButton {...share} />
          <button
            type="button"
            onClick={startOver}
            className="h-11 w-full text-[14px] font-semibold text-primary hover:underline"
          >
            Faire une autre contribution
          </button>
        </div>
      </section>
    );
  }

  // ── Confirmation sur le téléphone ──
  if (step.kind === 'confirm') {
    const { payment, checking } = step;
    const op = OPERATORS[payment.operator];
    return (
      <section id="contribuer" aria-labelledby="contrib-title" className={`${card} scroll-mt-4 p-5`}>
        <button
          type="button"
          onClick={() => setStep({ kind: 'form' })}
          disabled={checking}
          className="-ml-1 mb-3 inline-flex items-center gap-1 text-[14px] font-medium text-[#5B6B65] hover:text-[#12261E] disabled:opacity-50"
        >
          <ChevronLeft size={18} aria-hidden />
          Modifier
        </button>

        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#FFF4DE] text-[#8A5A00]">
            <Smartphone size={22} aria-hidden />
          </span>
          <div>
            <h2 ref={headingRef} tabIndex={-1} id="contrib-title" className={`${sectionTitle} outline-none`}>
              Confirmez le paiement sur votre téléphone
            </h2>
            <p className="mt-1 text-[14px] text-[#5B6B65]">Gardez votre téléphone à portée de main.</p>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-[#EEF0F2] rounded-[14px] bg-[#F4F5F7] px-4">
          <div className="flex items-center justify-between py-3">
            <dt className="text-[14px] text-[#5B6B65]">Montant</dt>
            <dd className="text-[17px] font-bold text-[#12261E]">{formatXof(payment.amount)}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-[14px] text-[#5B6B65]">Opérateur</dt>
            <dd className="flex items-center gap-2 text-[15px] font-semibold text-[#12261E]">
              <OperatorLogo method={payment.operator} size={24} decorative />
              {op.label}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-[14px] text-[#5B6B65]">Numéro</dt>
            <dd className="text-[15px] font-semibold text-[#12261E]">+226 {formatLocalPhone(payment.phone)}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-[14px] text-[#5B6B65]">Affiché comme</dt>
            <dd className="max-w-[60%] truncate text-[15px] font-semibold text-[#12261E]">
              {payment.displayName ?? 'Anonyme'}
            </dd>
          </div>
        </dl>

        <ol className="mt-4 space-y-2.5">
          {instructionsFor(payment.operator, payment.phone).map((line, i) => (
            <li key={i} className="flex gap-3 text-[15px] text-[#12261E]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E4F0EB] text-[12px] font-bold text-primary-dark">
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 space-y-2.5">
          <button type="button" onClick={() => confirmPayment(payment)} disabled={checking} className={btnPrimary}>
            {checking ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden />
                Vérification du paiement…
              </>
            ) : (
              "J'ai validé le paiement"
            )}
          </button>
          <button type="button" onClick={() => setStep({ kind: 'form' })} disabled={checking} className={btnSecondary}>
            Annuler
          </button>
        </div>
      </section>
    );
  }

  // ── Formulaire ──
  return (
    <section id="contribuer" aria-labelledby="contrib-title" className={`${card} scroll-mt-4 p-5`}>
      <h2 ref={headingRef} tabIndex={-1} id="contrib-title" className={`${sectionTitle} outline-none`}>
        Contribuer
      </h2>
      <p className="mt-1 text-[14px] text-[#5B6B65]">
        Paiement par Mobile Money, sans créer de compte. Minimum {formatXof(minContribution)}.
      </p>

      <form onSubmit={handleSubmit(onValid)} noValidate className="mt-5 space-y-5">
        {/* Montant */}
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <fieldset>
              <legend className={label}>Montant (F CFA)</legend>
              <div className="grid grid-cols-2 gap-2.5">
                {AMOUNT_PRESETS.map((preset) => {
                  const selected = !customAmount && field.value === String(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setCustomAmount(false);
                        setValue('amount', String(preset), { shouldValidate: isSubmitted });
                      }}
                      className={`h-12 rounded-[12px] border text-[15px] font-semibold transition-colors ${
                        selected
                          ? 'border-primary bg-[#F0F7F4] text-primary-dark'
                          : 'border-[#E5E7EB] bg-white text-[#12261E] hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {formatNumber(preset)} F
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={customAmount}
                  onClick={() => {
                    if (!customAmount) {
                      setCustomAmount(true);
                      setValue('amount', '', { shouldValidate: false });
                    }
                  }}
                  className={`col-span-2 h-12 rounded-[12px] border text-[15px] font-semibold transition-colors ${
                    customAmount
                      ? 'border-primary bg-[#F0F7F4] text-primary-dark'
                      : 'border-[#E5E7EB] bg-white text-[#12261E] hover:bg-[#F4F5F7]'
                  }`}
                >
                  Autre montant
                </button>
              </div>
              {customAmount && (
                <div className="relative mt-2.5">
                  <label htmlFor="custom-amount" className="sr-only">
                    Autre montant en F CFA
                  </label>
                  <input
                    id="custom-amount"
                    ref={(el) => {
                      field.ref(el);
                      customInputRef.current = el;
                    }}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 7))}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={`Ex. ${formatNumber(3000)}`}
                    aria-invalid={!!errors.amount}
                    aria-describedby={errors.amount ? 'amount-error' : undefined}
                    className={`${inputBase} ${inputBorder(!!errors.amount)} pr-14`}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#5B6B65]">
                    F
                  </span>
                </div>
              )}
              {errors.amount && (
                <p id="amount-error" role="alert" className={errorText}>
                  {errors.amount.message}
                </p>
              )}
            </fieldset>
          )}
        />

        {/* Anonymat */}
        <Controller
          control={control}
          name="anonymous"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-[14px] bg-[#F4F5F7] px-4 py-3">
              <div>
                <p id="anon-label" className="text-[15px] font-semibold text-[#12261E]">
                  Rester anonyme
                </p>
                <p className="text-[13px] text-[#5B6B65]">Votre nom ne sera pas affiché publiquement.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                aria-labelledby="anon-label"
                onClick={() => field.onChange(!field.value)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  field.value ? 'bg-primary' : 'bg-[#C9CFD3]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                    field.value ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}
        />

        {/* Nom */}
        {!anonymous && (
          <div>
            <label htmlFor="contrib-name" className={label}>
              Votre nom
            </label>
            <input
              id="contrib-name"
              {...register('name')}
              maxLength={NAME_MAX}
              autoComplete="name"
              placeholder="Ex. Awa Zongo"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`${inputBase} ${inputBorder(!!errors.name)}`}
            />
            {errors.name && (
              <p id="name-error" role="alert" className={errorText}>
                {errors.name.message}
              </p>
            )}
          </div>
        )}

        {/* Message */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="contrib-message" className="text-[14px] font-semibold text-[#12261E]">
              Message <span className="font-normal text-[#5B6B65]">(facultatif)</span>
            </label>
            <span className="text-[12px] text-[#5B6B65]" aria-live="polite">
              {messageLength}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id="contrib-message"
            {...register('message')}
            maxLength={MESSAGE_MAX}
            rows={2}
            placeholder="Un mot d'encouragement"
            aria-invalid={!!errors.message}
            className={`${inputBase} ${inputBorder(!!errors.message)} h-auto resize-none py-3`}
          />
          {errors.message && (
            <p role="alert" className={errorText}>
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Opérateur */}
        <Controller
          control={control}
          name="operator"
          render={({ field }) => (
            <fieldset>
              <legend className={label}>Opérateur Mobile Money</legend>
              <div role="radiogroup" className="grid grid-cols-3 gap-2.5">
                {PAYABLE_OPERATORS.map((key) => {
                  const op = OPERATORS[key];
                  const selected = field.value === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(key)}
                      className={`relative flex h-[84px] flex-col items-center justify-center gap-1.5 rounded-[12px] border px-1 text-[13px] font-semibold transition-colors ${
                        selected
                          ? 'border-primary bg-[#F0F7F4] text-[#12261E]'
                          : 'border-[#E5E7EB] bg-white text-[#12261E] hover:bg-[#F4F5F7]'
                      }`}
                    >
                      <OperatorLogo method={key} size={32} decorative />
                      {op.label}
                      {selected && (
                        <Check size={14} className="absolute right-1.5 top-1.5 text-primary" aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.operator && (
                <p role="alert" className={errorText}>
                  {errors.operator.message}
                </p>
              )}
            </fieldset>
          )}
        />

        {/* Téléphone */}
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <div>
              <label htmlFor="contrib-phone" className={label}>
                Numéro Mobile Money
              </label>
              <div
                className={`flex h-12 overflow-hidden rounded-[12px] border bg-white focus-within:ring-2 focus-within:ring-primary/20 ${
                  errors.phone ? 'border-[#D14343]' : 'border-[#E5E7EB] focus-within:border-primary'
                }`}
              >
                <span className="flex items-center border-r border-[#E5E7EB] bg-[#F4F5F7] px-3.5 text-[16px] font-semibold text-[#12261E]">
                  +226
                </span>
                <input
                  id="contrib-phone"
                  ref={field.ref}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) =>
                    field.onChange(formatLocalPhone(e.target.value.replace(/\D/g, '').slice(0, 8)))
                  }
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="70 00 00 00"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
                  className="min-w-0 flex-1 px-3.5 text-[16px] text-[#12261E] placeholder:text-[#8A9792] focus:outline-none"
                />
              </div>
              {errors.phone ? (
                <p id="phone-error" role="alert" className={errorText}>
                  {errors.phone.message}
                </p>
              ) : (
                <p id="phone-help" className="mt-1.5 text-[13px] text-[#5B6B65]">
                  Utilisé uniquement pour le paiement. Il n&apos;est jamais affiché.
                </p>
              )}
            </div>
          )}
        />

        <button type="submit" className={btnPrimary}>
          Contribuer
        </button>
      </form>
    </section>
  );
}
