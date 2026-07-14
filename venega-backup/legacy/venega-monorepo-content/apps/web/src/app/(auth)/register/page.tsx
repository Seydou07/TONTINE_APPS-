'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Mock registration - will connect to API later
      console.log('Register data:', data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/otp');
    } catch (error) {
      console.error('Registration error:', error);
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
        <h1 className="text-3xl font-heading font-bold text-text-main mb-2">
          Créer un compte
        </h1>
        <p className="text-text-muted">
          Rejoignez la communauté Venega et commencez votre aventure.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-main mb-2">
              Prénom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-text-muted" />
              </div>
              <input
                id="firstName"
                type="text"
                placeholder="Aminata"
                className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-xl bg-surface text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                {...register('firstName')}
              />
            </div>
            {errors.firstName && (
              <p className="mt-2 text-sm text-danger">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text-main mb-2">
              Nom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={20} className="text-text-muted" />
              </div>
              <input
                id="lastName"
                type="text"
                placeholder="Ouédraogo"
                className="w-full pl-12 pr-4 py-4 border-2 border-border rounded-xl bg-surface text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                {...register('lastName')}
              />
            </div>
            {errors.lastName && (
              <p className="mt-2 text-sm text-danger">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Phone Input */}
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
          {errors.phone && (
            <p className="mt-2 text-sm text-danger">{errors.phone.message}</p>
          )}
        </div>

        {/* Password Input */}
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
          {errors.password && (
            <p className="mt-2 text-sm text-danger">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-main mb-2">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={20} className="text-text-muted" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 border-2 border-border rounded-xl bg-surface text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-main transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="text-sm text-text-muted">
            J'accepte les{' '}
            <a href="#" className="text-primary hover:text-primary-dark font-medium">
              conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className="text-primary hover:text-primary-dark font-medium">
              politique de confidentialité
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Création en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Créer un compte
              <ArrowRight size={20} />
            </span>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-text-muted">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
