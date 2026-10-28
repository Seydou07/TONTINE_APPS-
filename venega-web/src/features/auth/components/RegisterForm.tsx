'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { linkText } from '@/components/ui/classes';
import { PasswordField, SubmitButton, TextField } from './fields';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Prénom trop court'),
    lastName: z.string().min(2, 'Nom trop court'),
    phone: z.string().min(9, 'Numéro de téléphone invalide'),
    password: z.string().min(6, 'Mot de passe trop court'),
    confirmPassword: z.string().min(6, 'Confirmez votre mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [terms, setTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  // Démo : inscription non branchée sur l'API. Ne jamais journaliser le mot de passe.
  const onSubmit = async (_data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push('/otp');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-[22px] font-bold text-ink">Créer un compte</h1>
      <p className="mt-1 text-[15px] text-muted">Quelques informations pour commencer.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="firstName"
            label="Prénom"
            autoComplete="given-name"
            placeholder="Aminata"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <TextField
            id="lastName"
            label="Nom"
            autoComplete="family-name"
            placeholder="Ouédraogo"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
        <TextField
          id="phone"
          label="Numéro de téléphone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+226 70 12 34 56"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <PasswordField
          id="password"
          label="Mot de passe"
          autoComplete="new-password"
          placeholder="6 caractères minimum"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <label className="flex cursor-pointer items-start gap-3 text-[14px] text-ink-soft">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
          />
          <span>
            J&apos;accepte les{' '}
            <a href="#" className={linkText}>
              conditions d&apos;utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className={linkText}>
              politique de confidentialité
            </a>
            .
          </span>
        </label>

        <SubmitButton loading={isLoading} loadingLabel="Création du compte…" disabled={!terms}>
          Créer mon compte
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-[14px] text-muted">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className={linkText}>
          Se connecter
        </Link>
      </p>
    </>
  );
}
