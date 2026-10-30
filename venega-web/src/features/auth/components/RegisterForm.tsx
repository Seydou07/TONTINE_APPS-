'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { PasswordField, TextField } from '@/components/ui/TextField';
import { ApiError, register } from '../api';
import {
  MIN_PASSWORD,
  formatPhone,
  phoneDigits,
  validateConfirm,
  validateName,
  validateNewPassword,
  validatePhone,
} from '../validation';
import { AuthBack, AuthFooter, AuthTitle } from './AuthParts';

type Field = 'firstName' | 'lastName' | 'phone' | 'password' | 'confirm';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const FIELDS: Field[] = ['firstName', 'lastName', 'phone', 'password', 'confirm'];

function validate(field: Field, v: Values): string | undefined {
  switch (field) {
    case 'firstName':
      return validateName(v.firstName, 'prénom');
    case 'lastName':
      return validateName(v.lastName, 'nom');
    case 'phone':
      return validatePhone(v.phone);
    case 'password':
      return validateNewPassword(v.password);
    case 'confirm':
      return validateConfirm(v.password, v.confirm);
  }
}

/** Inscription (prénom + nom) — mêmes règles que RegisterScreen mobile. */
export function RegisterForm() {
  const router = useRouter();
  const refs = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    confirm: useRef<HTMLInputElement>(null),
  };
  const [values, setValues] = useState<Values>({ firstName: '', lastName: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Une erreur affichée disparaît dès que la saisie redevient valide.
  const change = (field: Field) => (raw: string) => {
    const next = { ...values, [field]: field === 'phone' ? formatPhone(raw) : raw };
    setValues(next);
    setFormError('');
    setErrors((e) => {
      const updated = { ...e };
      if (e[field]) updated[field] = validate(field, next);
      // Changer le mot de passe peut corriger (ou casser) la confirmation déjà saisie.
      if (field === 'password' && e.confirm) updated.confirm = validate('confirm', next);
      return updated;
    });
  };

  // On ne signale une erreur en quittant un champ que s'il a été rempli.
  const blur = (field: Field) => () => {
    if (values[field]) setErrors((e) => ({ ...e, [field]: validate(field, values) }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    for (const f of FIELDS) next[f] = validate(f, values);
    setErrors(next);
    const firstInvalid = FIELDS.find((f) => next[f]);
    if (firstInvalid) return refs[firstInvalid].current?.focus();

    setFormError('');
    setIsLoading(true);
    try {
      await register({
        phone: values.phone,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      router.push(`/otp?phone=${phoneDigits(values.phone)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors((prev) => ({ ...prev, phone: err.message }));
        refs.phone.current?.focus();
      } else {
        setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue. Réessayez.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthBack onClick={() => (window.history.length > 1 ? router.back() : router.replace('/login'))} />
      <AuthTitle title="Créer un compte" subtitle="Un code de vérification sera envoyé par SMS à ce numéro." />
      <form onSubmit={handleRegister} noValidate className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            ref={refs.firstName}
            id="firstName"
            label="Prénom"
            placeholder="Aminata"
            autoComplete="given-name"
            autoCapitalize="words"
            value={values.firstName}
            onChange={(e) => change('firstName')(e.target.value)}
            onBlur={blur('firstName')}
            error={errors.firstName}
          />
          <TextField
            ref={refs.lastName}
            id="lastName"
            label="Nom"
            placeholder="Ouédraogo"
            autoComplete="family-name"
            autoCapitalize="words"
            value={values.lastName}
            onChange={(e) => change('lastName')(e.target.value)}
            onBlur={blur('lastName')}
            error={errors.lastName}
          />
        </div>
        <TextField
          ref={refs.phone}
          id="phone"
          label="Numéro de téléphone"
          prefix="+226"
          placeholder="70 12 34 56"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          maxLength={11}
          value={values.phone}
          onChange={(e) => change('phone')(e.target.value)}
          onBlur={blur('phone')}
          error={errors.phone}
        />
        <PasswordField
          ref={refs.password}
          id="password"
          label="Mot de passe"
          placeholder="Choisissez un mot de passe"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => change('password')(e.target.value)}
          onBlur={blur('password')}
          hint={`${MIN_PASSWORD} caractères minimum`}
          error={errors.password}
        />
        <PasswordField
          ref={refs.confirm}
          id="confirm"
          label="Confirmer le mot de passe"
          placeholder="Saisissez-le à nouveau"
          autoComplete="new-password"
          value={values.confirm}
          onChange={(e) => change('confirm')(e.target.value)}
          onBlur={blur('confirm')}
          error={errors.confirm}
        />
        <FormAlert message={formError} />
        <Button type="submit" loading={isLoading}>
          Continuer
        </Button>
      </form>
      <AuthFooter text="Déjà un compte ?" href="/login" label="Se connecter" />
    </>
  );
}
