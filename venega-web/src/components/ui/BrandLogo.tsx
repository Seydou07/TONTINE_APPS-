import Link from 'next/link';

interface BrandLogoProps {
  /** Affiche aussi le mot « Venega » (fichier du logo, jamais du texte recoloré). */
  withWordmark?: boolean;
  size?: 'sm' | 'md';
  /**
   * Sur le bandeau vert : le logo d'origine est posé sur une carte blanche
   * arrondie. Le logo n'est jamais recoloré (pas de version blanche).
   */
  onDark?: boolean;
  href?: string;
  className?: string;
}

const SIZES = {
  sm: { icon: 26, word: 18 },
  md: { icon: 32, word: 22 },
} as const;

/** Logo Venega à partir des fichiers d'origine (/venega-icon.png, /venega-wordmark.png). */
export function BrandLogo({ withWordmark = true, size = 'sm', onDark = false, href = '/', className = '' }: BrandLogoProps) {
  const s = SIZES[size];
  const content = (
    <>
      {/* Petites images locales : <img> simple, dimensions explicites. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/venega-icon.png"
        alt={withWordmark ? '' : 'Venega'}
        width={Math.round((s.icon * 309) / 225)}
        height={s.icon}
        style={{ height: s.icon, width: 'auto' }}
        className="shrink-0"
      />
      {withWordmark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/venega-wordmark.png"
          alt="Venega"
          width={Math.round((s.word * 309) / 82)}
          height={s.word}
          style={{ height: s.word, width: 'auto' }}
          className="shrink-0"
        />
      )}
    </>
  );

  const frame = onDark
    ? 'rounded-[12px] bg-white px-2.5 py-1.5'
    : '';

  return (
    <Link
      href={href}
      aria-label="Venega — accueil"
      className={`inline-flex items-center gap-1.5 ${frame} ${className}`}
    >
      {content}
    </Link>
  );
}
