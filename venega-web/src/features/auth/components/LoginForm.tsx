'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { linkText } from '@/components/ui/classes';
import { PasswordField, SubmitButton, TextField } from './fields';

const loginSchema = z.object({
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // Démo : pas encore branché sur l'API. Ne jamais journaliser les identifiants.
  const onSubmit = async (_data: LoginFormValues) => {
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
      <h1 className="text-[22px] font-bold text-ink">Connexion</h1>
      <p className="mt-1 text-[15px] text-muted">Content de vous revoir.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
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
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link href="#" className={`text-[14px] ${linkText}`}>
            Mot de passe oublié ?
          </Link>
        </div>
        <SubmitButton loading={isLoading} loadingLabel="Connexion…">
          Se connecter
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-[14px] text-muted">
        Pas encore de compte ?{' '}
        <Link href="/register" className={linkText}>
          Créer un compte
        </Link>
      </p>
    </>
  );
}
