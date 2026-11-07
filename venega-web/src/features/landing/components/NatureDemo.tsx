'use client';

import { useState } from 'react';
import { Banknote, Bike, Package, ShoppingBasket, type LucideIcon } from 'lucide-react';
import { useInView, useTicker } from './motion';

/*
 * « Que reçoit le bénéficiaire ? » — même choix que l'écran de création
 * d'un cercle : de l'argent, ou un bien acheté avec les cotisations et
 * remis à tour de rôle. Bascule automatique (exemple).
 */

const GOODS: { icon: LucideIcon; name: string; detail: string }[] = [
  { icon: Bike, name: 'Une moto', detail: 'Ex. Moto Bajaj Boxer 100cc' },
  { icon: ShoppingBasket, name: 'Un kit alimentaire', detail: 'Riz, huile, sucre pour la famille' },
  { icon: Package, name: 'Des sacs de ciment', detail: 'Pour avancer la construction' },
];

export function NatureDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [frame, setFrame] = useState(1);
  useTicker(inView, 2600, () => setFrame((f) => f + 1));

  const nature = frame % 2 === 1;
  const good = GOODS[Math.floor(frame / 2) % GOODS.length]!;
  const Icon = nature ? good.icon : Banknote;

  return (
    <div ref={ref} className="rounded-[24px] border border-line bg-white p-4 sm:p-5">
      <p className="text-[14px] font-semibold text-ink">Que reçoit le bénéficiaire ?</p>
      <div className="relative mt-2.5 grid grid-cols-2 rounded-[14px] bg-fill p-1 text-[13.5px] font-semibold">
        <span
          aria-hidden
          className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-[11px] border border-line bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: nature ? 'translateX(100%)' : 'none' }}
        />
        <button type="button" onClick={() => setFrame((f) => (f % 2 === 1 ? f + 1 : f))} className={`relative z-10 h-10 ${nature ? 'text-muted' : 'text-ink'}`}>
          De l’argent
        </button>
        <button type="button" onClick={() => setFrame((f) => (f % 2 === 0 ? f + 1 : f))} className={`relative z-10 h-10 ${nature ? 'text-ink' : 'text-muted'}`}>
          Un bien
        </button>
      </div>

      <div key={frame} className="lp-screen-in mt-4 flex items-center gap-4 rounded-[18px] bg-primary-tint p-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] ${nature ? 'bg-amber text-ink' : 'bg-primary text-white'}`}>
          <Icon size={28} />
        </span>
        <div className="min-w-0">
          <p className="text-[18px] font-bold leading-tight text-primary-dark">{nature ? good.name : '80 000 F CFA'}</p>
          <p className="mt-0.5 text-[13px] text-ink-soft">{nature ? good.detail : 'Versés en Mobile Money au bénéficiaire du tour'}</p>
        </div>
      </div>
      <p className="mt-3 min-h-[60px] text-[13px] text-muted sm:min-h-[40px]">
        {nature
          ? 'Les cotisations servent à acheter le bien, remis à tour de rôle. Les membres voient sa photo avant de cotiser.'
          : 'Chaque membre cotise à chaque tour ; la cagnotte revient à tour de rôle à chacun.'}
      </p>
    </div>
  );
}
