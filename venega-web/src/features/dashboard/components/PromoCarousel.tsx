import Link from 'next/link';
import { HandHeart, HeartHandshake, Smartphone, Users, type LucideIcon } from 'lucide-react';

/*
 * Bannières de l'accueil (mêmes textes que PromoCarousel.tsx mobile).
 * Défilement horizontal natif (scroll-snap) : pas de lecture automatique ni d'animation.
 * Les bannières image font 1200 × 560 px (public/banners/), copiées de venega-mobile/assets/banners.
 */

type Slide = {
  id: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  icon: LucideIcon;
  image?: string;
  /** Logos Orange / Moov / Wave sous le texte de l'image (bannière Mobile Money). */
  showOperators?: boolean;
};

const SLIDES: Slide[] = [
  {
    id: 'tontine',
    title: 'Votre tontine, sans cahier',
    text: 'Cotisations, tours et cagnottes suivis automatiquement.',
    cta: 'Créer un cercle',
    href: '/circles/create',
    icon: Users,
    image: '/banners/tontine.jpg',
  },
  {
    id: 'mobile-money',
    title: 'Cotisez par Mobile Money',
    text: 'Orange Money, Moov Money et Wave acceptés.',
    cta: 'Mes cercles',
    href: '/circles',
    icon: Smartphone,
    image: '/banners/mobile-money.jpg',
    showOperators: true,
  },
  {
    id: 'solidarite',
    title: 'La solidarité qui protège',
    text: 'Une caisse commune pour les coups durs du groupe.',
    cta: 'Découvrir',
    href: '/circles/create',
    icon: HeartHandshake,
  },
  {
    id: 'cagnotte',
    title: 'Lancez une cagnotte d’aide',
    text: 'Un lien à partager : chacun peut donner, même sans l’application.',
    cta: 'Lancer',
    href: '/aid/create',
    icon: HandHeart,
  },
];

const OPERATORS = [
  { id: 'orange', name: 'Orange Money' },
  { id: 'moov', name: 'Moov Money' },
  { id: 'wave', name: 'Wave' },
];

export function PromoCarousel() {
  return (
    <div
      role="region"
      aria-label="Bannières"
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
    >
      {SLIDES.map((s) => {
        const Icon = s.icon;
        const base =
          'relative block aspect-[1200/616] w-[calc(100%-12px)] shrink-0 snap-center overflow-hidden rounded-[24px] bg-amber sm:w-[420px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
        if (s.image) {
          return (
            <Link key={s.id} href={s.href} aria-label={`${s.title}. ${s.cta}`} className={base}>
              {/* Image locale, déjà au bon format : <img> simple. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt="" className="h-full w-full object-cover object-left" />
              {s.showOperators && (
                <span className="absolute left-[5.5%] top-[66%] flex items-center gap-1.5" aria-hidden>
                  {OPERATORS.map((op) => (
                    <span key={op.id} className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[8px] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/operators/${op.id}.png`} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                    </span>
                  ))}
                </span>
              )}
            </Link>
          );
        }
        return (
          <Link
            key={s.id}
            href={s.href}
            aria-label={`${s.title}. ${s.cta}`}
            className={`${base} flex items-center gap-3 px-[18px] py-3.5`}
          >
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 block text-[17px] font-bold text-primary-dark">{s.title}</span>
              <span className="mt-1 line-clamp-2 block text-[13px] text-primary-dark/85">{s.text}</span>
            </span>
            <span aria-hidden className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-white/45 text-primary-dark">
              <Icon size={36} strokeWidth={1.6} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
