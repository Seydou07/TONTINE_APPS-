'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { PasswordField, TextField } from '@/components/ui/TextField';
import { ApiError, login } from '../api';
import { formatPhone, validateLoginPassword, validatePhone } from '../validation';
import { AuthFooter, AuthTitle } from './AuthParts';

type Errors = { phone?: string; password?: string };

/** Connexion — mêmes règles que LoginScreen mobile. */
export function LoginForm() {
  const router = useRouter();
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Une erreur affichée disparaît dès que la saisie redevient valide.
  const onPhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
    setFormError('');
    if (errors.phone) setErrors((e) => ({ ...e, phone: validatePhone(formatted) }));
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    setFormError('');
    if (errors.password) setErrors((e) => ({ ...e, password: validateLoginPassword(value) }));
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = { phone: validatePhone(phone), password: validateLoginPassword(password) };
    setErrors(next);
    if (next.phone) return phoneRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setFormError('');
    setIsLoading(true);
    try {
      await login(phone, password);
      router.replace('/dashboard');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthTitle title="Se connecter" />
      <form onSubmit={handleLogin} noValidate className="mt-5 space-y-4">
        <TextField
          ref={phoneRef}
          id="phone"
          label="Numéro de téléphone"
          prefix="+226"
          placeholder="70 12 34 56"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          maxLength={11}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          onBlur={() => phone && setErrors((e) => ({ ...e, phone: validatePhone(phone) }))}
          error={errors.phone}
        />
        <PasswordField
          ref={passwordRef}
          id="password"
          label="Mot de passe"
          placeholder="Votre mot de passe"
          autoComplete="current-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          error={errors.password}
        />
        <FormAlert message={formError} />
        <Button type="submit" loading={isLoading}>
          Se connecter
        </Button>
      </form>
      <AuthFooter text="Pas encore de compte ?" href="/register" label="Créer un compte" />
    </>
  );
}
