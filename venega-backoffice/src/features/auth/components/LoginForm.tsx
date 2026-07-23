'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import VenegaLogo from '../../../../packages/assets/logo/VenegaLogo';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
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

  const [loginError, setLoginError] = useState('');

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError('');
    try {
      // Simuler une connexion — en prod, c'est un appel API
      await new Promise((resolve) => setTimeout(resolve, 1200));
      // Vérification simple pour le mock
      if (data.email !== 'admin@venega.com' || data.password !== 'admin123') {
        setLoginError('Email ou mot de passe incorrect');
        setIsLoading(false);
        return;
      }
      // Stocker le token
      const mockToken = 'venega_admin_' + Date.now().toString(36);
      localStorage.setItem('venega_admin_token', mockToken);
      localStorage.setItem('venega_admin_user', JSON.stringify({
        email: data.email,
        name: 'Admin Venega',
        role: 'SUPER_ADMIN',
      }));
      router.push('/');
    } catch (error) {
      setLoginError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Logo et titre */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <VenegaLogo size={80} showWordmark={false} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Backoffice Venega</h1>
              <p className="text-gray-600 mt-2">Connectez-vous à votre compte administrateur</p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@venega.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* Error */}
            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-[13px] text-red-600">{loginError}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={20} />
                  Se connecter
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Problèmes de connexion ? Contactez le support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}