import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

/** En-tête fin et clair de la page publique : logo Venega + badge « Paiement sécurisé ». */
export function PublicHeader() {
  return (
    <header className="mx-auto flex h-14 max-w-[560px] items-center justify-between px-4">
      <Link href="/" className="flex items-center gap-2" aria-label="Venega — accueil">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#E4F0EB]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/venega-icon.png" alt="" width={22} height={16} className="h-4 w-[22px] object-contain" />
        </span>
        <span className="text-[17px] font-bold tracking-tight text-[#12261E]">Venega</span>
      </Link>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4F0EB] px-2.5 py-1 text-[12px] font-medium text-[#074B36]">
        <ShieldCheck size={14} className="text-primary" aria-hidden />
        Paiement sécurisé
      </span>
    </header>
  );
}
