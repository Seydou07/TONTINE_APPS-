import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { btnSmallPrimary } from '@/components/ui/classes';

const NAV = [
  { href: '#tontine', label: 'Tontine' },
  { href: '#paiement', label: 'Paiement' },
  { href: '#solidarite', label: 'Solidarité' },
  { href: '#cagnotte', label: 'Cagnotte' },
  { href: '#confiance', label: 'Sécurité' },
];

/** En-tête blanc de la page d'accueil publique (le logo reste sur fond blanc). */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <BrandLogo />
        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-[10px] px-3 py-2 text-[14px] font-medium text-ink-soft hover:bg-fill hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-[12px] px-3 text-[14px] font-semibold text-ink hover:bg-fill"
          >
            Se connecter
          </Link>
          <Link href="/register" className={`${btnSmallPrimary} hidden sm:inline-flex`}>
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Pied de page de la page d'accueil publique. */
export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <BrandLogo />
          <p className="mt-2 text-[13px] text-muted">Tontine, caisse de solidarité et cagnotte d’aide · Burkina Faso</p>
        </div>
        <div className="flex flex-col gap-1 text-[13px] text-muted sm:items-end">
          <div className="flex gap-4">
            <Link href="/login" className="font-medium text-ink-soft hover:text-ink">
              Se connecter
            </Link>
            <Link href="/register" className="font-medium text-ink-soft hover:text-ink">
              Créer un compte
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Venega</p>
        </div>
      </div>
    </footer>
  );
}
