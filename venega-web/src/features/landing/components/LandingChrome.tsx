import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { btnSmallPrimary } from '@/components/ui/classes';

const NAV = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#comment', label: 'Comment ça marche' },
  { href: '#securite', label: 'Sécurité' },
];

/** En-tête blanc du site vitrine. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <BrandLogo />
        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-[14px] font-medium text-ink-soft hover:text-primary">
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

/** Pied de page du site vitrine. */
export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-sm text-[14px] text-muted">
            Venega gère la tontine et la caisse de solidarité : cotisations par Mobile Money, tours et dépenses visibles
            par tous les membres.
          </p>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink">Produit</p>
          <ul className="mt-2 space-y-2 text-[14px] text-muted">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-primary">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink">Informations</p>
          <ul className="mt-2 space-y-2 text-[14px] text-muted">
            <li>
              <Link href="#" className="hover:text-primary">
                Nous contacter
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Conditions d&apos;utilisation
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-primary">
                Politique de confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-[13px] text-muted sm:px-6">
          © {new Date().getFullYear()} Venega · Burkina Faso
        </p>
      </div>
    </footer>
  );
}
