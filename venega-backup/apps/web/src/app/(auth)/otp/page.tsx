'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputsRef.current[5]?.focus();
    }
  };

  const handleResend = () => {
    setResendCooldown(30);
    // Mock resend OTP
    console.log('Resending OTP...');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('OTP submitted:', otp.join(''));
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-primary-tint rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-primary" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-text-main mb-2">
          Vérification
        </h1>
        <p className="text-text-muted">
          Nous avons envoyé un code à 6 chiffres au +226 70 12 34 56
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* OTP Inputs */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
          <motion.input
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-2xl font-heading font-bold border-2 border-border rounded-xl bg-surface text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            inputMode="numeric"
            autoFocus={index === 0}
          />
        ))}
        </div>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-text-muted">
            Vous n'avez pas reçu le code ?{' '}
            {isResendCooldown > 0 ? (
              <span className="text-text-muted">
                Réessayez dans {isResendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-medium hover:text-primary-dark transition-colors"
              >
                Renvoyer le code
              </button>
            )}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || otp.some((d) => !d)}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Vérification en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Vérifier
              <ArrowRight size={20} />
            </span>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-8 text-center">
        <Link href="/login" className="text-text-muted hover:text-primary transition-colors">
          ← Retour à la connexion
        </Link>
      </div>
    </motion.div>
  );
}
