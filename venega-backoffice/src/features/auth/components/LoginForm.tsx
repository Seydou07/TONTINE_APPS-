'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { isDemoLoginEnabled, signIn } from '../api';

const schema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide'),
  password: z.string().min(8, '8 caractères minimum'),
});
type Values = z.infer<typeof schema>;

const inputCls =
  'h-11 w-full rounded-md border bg-white px-3 text-base text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demo = isDemoLoginEnabled();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError(null);
    try {
      await signIn(v.email, v.password);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion impossible.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark p-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo size={88} />
          <h1 className="mt-3 text-xl font-semibold text-ink">Administration Venega</h1>
          <p className="mt-1 text-sm text-ink-muted">Accès réservé à l’équipe Venega</p>
        </div>

        {demo && (
          <p className="mb-4 flex gap-2 rounded-md border border-accent-line bg-accent-tint px-3 py-2 text-sm text-accent-ink">
            <HardDrive size={16} className="mt-0.5 shrink-0" />
            Mode démo : l’authentification admin de l’API n’est pas encore branchée. Toute adresse valide ouvre une session locale.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className={`${inputCls} ${errors.email ? 'border-danger focus:ring-danger/15' : 'border-line focus:border-brand focus:ring-brand/15'}`}
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`${inputCls} pr-10 ${errors.password ? 'border-danger focus:ring-danger/15' : 'border-line focus:border-brand focus:ring-brand/15'}`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
          </div>

          {error && <p className="rounded-md border border-danger-line bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}

          <Button type="submit" loading={isSubmitting} className="h-11 w-full">
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
