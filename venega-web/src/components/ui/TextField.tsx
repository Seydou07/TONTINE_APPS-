'use client';

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { errorText, helpText, inputBase, inputBorder, label as labelClass } from './classes';

interface FieldShellProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Libellé au-dessus, aide ou erreur dessous (l'erreur remplace l'aide). */
function FieldShell({ id, label, hint, error, children, className = '' }: FieldShellProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className={errorText}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={helpText}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  hint?: string;
  error?: string;
  /** Texte fixe avant la saisie (ex. « +226 »). */
  prefix?: string;
  /** Texte fixe après la saisie (ex. « F CFA »). */
  suffix?: string;
  containerClassName?: string;
}

/** Champ texte : même rendu que le TextField de l'app mobile (préfixe, suffixe, aide, erreur). */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, hint, error, prefix, suffix, containerClassName = '', className = '', ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} className={containerClassName}>
      <div className="relative flex items-center">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 text-[16px] font-medium text-muted">{prefix}</span>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className={`${inputBase} ${inputBorder(!!error)} ${prefix ? 'pl-[62px]' : ''} ${suffix ? 'pr-16' : ''} ${
            props.readOnly ? 'bg-fill text-muted' : ''
          } ${className}`}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 text-[14px] font-medium text-muted">{suffix}</span>
        )}
      </div>
    </FieldShell>
  );
});

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
  error?: string;
}

/** Champ mot de passe avec bouton afficher / masquer. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { id, label, hint, error, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          type={visible ? 'text' : 'password'}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className={`${inputBase} ${inputBorder(!!error)} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-ink"
        >
          {visible ? <EyeOff size={19} aria-hidden /> : <Eye size={19} aria-hidden />}
        </button>
      </div>
    </FieldShell>
  );
});

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

/** Zone de texte multiligne. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { id, label, hint, error, containerClassName = '', className = '', rows = 4, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} className={containerClassName}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={!!error || undefined}
        className={`${inputBase} ${inputBorder(!!error)} h-auto resize-none py-3 ${className}`}
        {...props}
      />
    </FieldShell>
  );
});
