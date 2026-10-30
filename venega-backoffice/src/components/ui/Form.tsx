import React, { useId } from 'react';
import { cn } from '@/lib/cn';

const control =
  'w-full rounded-md border border-line bg-white px-3 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-canvas disabled:text-ink-muted';

export function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string | null;
  children: (id: string) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children(id)}
      {hint && !error && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={cn(control, 'h-10', className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea rows={3} {...rest} className={cn(control, 'resize-y py-2', className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select {...rest} className={cn(control, 'h-10 pr-8', className)}>
      {children}
    </select>
  );
}

/** Encadré d'information ou d'avertissement dans un formulaire ou une fiche. */
export function Notice({ tone = 'neutral', children, className }: { tone?: 'neutral' | 'amber' | 'red' | 'green'; children: React.ReactNode; className?: string }) {
  const cls = {
    neutral: 'border-line bg-canvas text-ink-soft',
    amber: 'border-accent-line bg-accent-tint text-accent-ink',
    red: 'border-danger-line bg-danger-tint text-danger',
    green: 'border-brand-line bg-brand-tint text-brand',
  }[tone];
  return <div className={cn('rounded-md border px-3 py-2 text-sm', cls, className)}>{children}</div>;
}
