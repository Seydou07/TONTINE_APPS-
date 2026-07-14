'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      console.log('Login data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
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
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-main mb-2">Connexion</h1>
        <p className="text-text-muted">Ravi de vous revoir ! Connectez-vous à votre compte.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-main mb-2">
            Numéro de téléphone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone size={20} className="text-text-muted" />
            </div>
            <input
              id="phone"
              type="tel"
              placeholder="+226 70 12 34 56"
              className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-xl bg-surface text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              {...register('phone')}
            />
          </div>
          {errors.phone && <p className="mt-2 text-sm text-danger">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-main mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={20} className="text-text-muted" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 border-2 border-border rounded-xl bg-surface text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-main transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-sm text-danger">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link href="#" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connexion en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Se connecter
              <ArrowRight size={20} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-text-muted">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
