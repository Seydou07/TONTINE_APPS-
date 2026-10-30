import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { btnSmallPrimary } from '@/components/ui/classes';

/** En-tête blanc de la page d'accueil publique. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <BrandLogo />
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
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandLogo />
        <p className="text-[13px] text-muted">© {new Date().getFullYear()} Venega · Burkina Faso</p>
      </div>
    </footer>
  );
}
