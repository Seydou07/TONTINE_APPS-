'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MessageSquareText } from 'lucide-react';
import { SubmitButton } from './fields';

const LENGTH = 6;

export default function OtpForm() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasted.length === LENGTH) {
      e.preventDefault();
      setOtp(pasted.split(''));
      inputsRef.current[LENGTH - 1]?.focus();
    }
  };

  // Démo : renvoi et vérification non branchés sur l'API.
  const handleResend = () => setCooldown(30);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-tint text-primary">
        <MessageSquareText size={22} aria-hidden />
      </span>
      <h1 className="text-[22px] font-bold text-ink">Code de vérification</h1>
      <p className="mt-1 text-[15px] text-muted">
        Saisissez le code à 6 chiffres envoyé par SMS au <strong className="text-ink">+226 70 12 34 56</strong>.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        <fieldset>
          <legend className="sr-only">Code à 6 chiffres</legend>
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                aria-label={`Chiffre ${index + 1}`}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoFocus={index === 0}
                className="h-14 w-full min-w-0 max-w-[52px] rounded-[12px] border border-line bg-white text-center text-[22px] font-bold text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ))}
          </div>
        </fieldset>

        <p className="text-center text-[14px] text-muted">
          Pas reçu le code ?{' '}
          {cooldown > 0 ? (
            <span>Nouvel envoi dans {cooldown} s</span>
          ) : (
            <button type="button" onClick={handleResend} className="font-semibold text-primary hover:underline">
              Renvoyer le code
            </button>
          )}
        </p>

        <SubmitButton loading={isLoading} loadingLabel="Vérification…" disabled={otp.some((d) => !d)}>
          Vérifier
        </SubmitButton>
      </form>

      <Link
        href="/login"
        className="mt-4 inline-flex w-full items-center justify-center gap-1 text-[14px] font-medium text-muted hover:text-ink"
      >
        <ChevronLeft size={17} aria-hidden />
        Retour à la connexion
      </Link>
    </>
  );
}
