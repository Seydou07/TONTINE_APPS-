import { BrandLogo } from '@/components/ui/BrandLogo';

/** En-tête fin de la page publique : logo Venega d'origine (jamais recoloré). */
export function PublicHeader() {
  return (
    <header className="mx-auto flex h-14 max-w-[560px] items-center px-4">
      <BrandLogo />
    </header>
  );
}
