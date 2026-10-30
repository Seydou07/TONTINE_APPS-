import type { ReactNode } from 'react';
import { formatFcfa } from '@/lib/format';

/*
 * Mise en page commune aux écrans de paiement (copie de PaymentLayout.tsx mobile) :
 * carte montant verte + carte récapitulative. Le choix de l'opérateur et la
 * confirmation passent ensuite par MobileMoneyCheckout.
 */

export function PaymentAmountCard({ amount, sub, label = 'Montant à payer' }: { amount: number; sub?: string; label?: string }) {
  return (
    <div className="rounded-[24px] bg-primary-dark px-5 py-6 text-center text-white">
      <p className="text-[13px] text-white/80">{label}</p>
      <p className="mt-1 text-[28px] font-bold leading-tight">{formatFcfa(amount)}</p>
      {sub && <p className="mt-1 text-[13px] text-white/80">{sub}</p>}
    </div>
  );
}

export function PaymentSummaryCard({ children }: { children: ReactNode }) {
  return <dl className="rounded-[20px] border border-line bg-white px-4">{children}</dl>;
}

export function PaymentSummaryRow({
  label,
  value,
  strong = false,
  last = false,
  leading,
}: {
  label: string;
  value: string;
  strong?: boolean;
  last?: boolean;
  /** Élément affiché avant la valeur (ex. Avatar). */
  leading?: ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 ${last ? '' : 'border-b border-line'}`}>
      <dt className="text-[15px] text-muted">{label}</dt>
      <dd className="flex min-w-0 items-center justify-end gap-2">
        {leading}
        <span className={`text-right text-[15px] ${strong ? 'font-bold text-primary-dark' : 'font-medium text-ink'}`}>
          {value}
        </span>
      </dd>
    </div>
  );
}

export function PaymentHint({ children }: { children: ReactNode }) {
  return <p className="px-1 text-[13px] text-muted">{children}</p>;
}
