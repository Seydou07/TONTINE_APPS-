import React from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('rounded-lg border border-line bg-white', className)}>{children}</section>;
}

export function CardHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 border-b border-line px-4 py-3', className)}>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 text-base text-ink-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

/** Ligne libellé / valeur dans les fiches détail. */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-base text-ink">{children}</dd>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'amber' | 'red';
  icon?: React.ReactNode;
}) {
  const iconCls =
    tone === 'red' ? 'bg-danger-tint text-danger' : tone === 'amber' ? 'bg-accent-tint text-accent-ink' : 'bg-brand-tint text-brand';
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        {icon && <span className={cn('flex h-8 w-8 items-center justify-center rounded-md', iconCls)}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {hint && <div className="mt-1 text-sm text-ink-muted">{hint}</div>}
    </div>
  );
}
