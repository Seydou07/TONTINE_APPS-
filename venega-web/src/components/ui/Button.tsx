import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { btnDanger, btnPrimary, btnSecondary, btnSmallDanger, btnSmallPrimary, btnSmallSecondary } from './classes';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'md' | 'sm';

function classFor(variant: Variant, size: Size) {
  if (size === 'sm') {
    return variant === 'primary' ? btnSmallPrimary : variant === 'danger' ? btnSmallDanger : btnSmallSecondary;
  }
  return variant === 'primary' ? btnPrimary : variant === 'danger' ? btnDanger : btnSecondary;
}

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: LucideIcon;
}

/** Bouton standard (52 px pleine largeur, ou 40 px en `sm`), même rendu que l'app mobile. */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  disabled,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${classFor(variant, size)} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={size === 'sm' ? 16 : 18} aria-hidden />
      )}
      {children}
    </button>
  );
}

/** Lien présenté comme un bouton. */
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Link href={href} className={`${classFor(variant, size)} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 16 : 18} aria-hidden />}
      {children}
    </Link>
  );
}
