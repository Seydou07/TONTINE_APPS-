'use client';

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { linkText } from '@/components/ui/classes';
import { DEMO_OTP_CODE, isDemoMode } from '@/lib/demo';
import { ApiError, resendOtp, verifyOtp } from '../api';
import { formatPhone, phoneDigits } from '../validation';
import { AuthBack, AuthTitle } from './AuthParts';

const CODE_LENGTH = 6;
const RESEND_DURATION = 45;

const formatCooldown = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

/** Code SMS à 6 chiffres — mêmes règles que OtpScreen mobile. */
export function OtpForm() {
  const router = useRouter();
  const phone = phoneDigits(useSearchParams()?.get('phone') ?? '');
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_DURATION);
  const [error, setError] = useState('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (error) setError('');
    if (value && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  // Collage du code complet reçu par SMS.
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (digits.length < 2) return;
    e.preventDefault();
    const next = Array.from({ length: CODE_LENGTH }, (_, i) => digits[i] ?? '');
    setCode(next);
    if (error) setError('');
    inputsRef.current[Math.min(digits.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.every(Boolean)) {
      setError('Saisissez les 6 chiffres du code.');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtp(phone, code.join(''));
      router.replace('/profile-setup');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Code incorrect.';
      setError(isDemoMode ? `${message} En démo, utilisez ${DEMO_OTP_CODE}.` : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(phone);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Le code n’a pas pu être renvoyé.');
      return;
    }
    setResendCooldown(RESEND_DURATION);
    setCode(Array(CODE_LENGTH).fill(''));
    inputsRef.current[0]?.focus();
  };

  return (
    <>
      <AuthBack onClick={() => router.replace('/register')} />
      <AuthTitle
        title="Vérification"
        subtitle={
          <>
            Saisissez le code à 6 chiffres envoyé par SMS au{' '}
            <strong className="font-semibold text-ink">+226 {formatPhone(phone)}</strong>.
          </>
        }
      />
      <form onSubmit={handleVerify} noValidate className="mt-6">
        <div className="flex justify-between gap-2" role="group" aria-label="Code de vérification">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              aria-label={`Chiffre ${index + 1} sur ${CODE_LENGTH}`}
              aria-invalid={!!error || undefined}
              className={`h-14 w-full min-w-0 max-w-[52px] rounded-[12px] border bg-white text-center text-[22px] font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                error ? 'border-danger' : digit ? 'border-primary' : 'border-line-strong focus:border-primary'
              }`}
            />
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-center text-[13px] text-danger">
            {error}
          </p>
        )}

        <p className="mt-5 text-center text-[14px] text-muted">
          Vous n&apos;avez rien reçu ?{' '}
          {resendCooldown > 0 ? (
            <span className="font-semibold text-ink-soft">Renvoyer dans {formatCooldown(resendCooldown)}</span>
          ) : (
            <button type="button" onClick={handleResend} className={linkText}>
              Renvoyer le code
            </button>
          )}
        </p>

        <Button type="submit" loading={isLoading} className="mt-6">
          Confirmer
        </Button>
      </form>
      <p className="mt-6 text-center text-[14px] text-muted">
        Mauvais numéro ?{' '}
        <button type="button" onClick={() => router.replace('/register')} className={linkText}>
          Modifier
        </button>
      </p>
    </>
  );
}
