import { PaymentMethod } from '@venega/types';
import { OPERATORS } from '../format';
import { PAYABLE_OPERATORS } from '../schema';

/** Logos réels des opérateurs acceptés (fichiers dans /public/operators). */
const LOGOS: Partial<Record<PaymentMethod, string>> = {
  [PaymentMethod.ORANGE_MONEY]: '/operators/pay-orange.png',
  [PaymentMethod.MOOV_MONEY]: '/operators/pay-moov.png',
  [PaymentMethod.WAVE]: '/operators/pay-wave.png',
};

interface OperatorLogoProps {
  method: PaymentMethod;
  /** Côté du carré, en px */
  size?: number;
  /** true : logo décoratif (le nom de l'opérateur est écrit à côté) */
  decorative?: boolean;
  className?: string;
}

/** Logo d'opérateur dans un petit carré arrondi. Repli neutre pour un moyen sans logo. */
export function OperatorLogo({ method, size = 32, decorative = false, className = '' }: OperatorLogoProps) {
  const src = LOGOS[method];
  const radius = Math.round(size / 4);
  if (!src) {
    return (
      <span
        aria-hidden
        className={`inline-block shrink-0 border border-line bg-fill ${className}`}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }
  return (
    // Petite image statique locale : <img> simple, dimensions explicites (pas de décalage de mise en page).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={decorative ? '' : OPERATORS[method].label}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`shrink-0 border border-line bg-white object-contain ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    />
  );
}

/** Ligne « Paiement accepté » avec les logos des opérateurs. */
export function AcceptedPayments({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <p className="text-[14px] font-semibold text-ink-soft">Paiement accepté</p>
      <ul className="flex items-center gap-2" aria-label="Opérateurs acceptés">
        {PAYABLE_OPERATORS.map((m) => (
          <li key={m}>
            <OperatorLogo method={m} size={32} />
          </li>
        ))}
      </ul>
    </div>
  );
}
