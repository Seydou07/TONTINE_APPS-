import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { PublicHeader } from '@/features/aid/components/PublicHeader';
import { btnPrimary, card } from '@/features/aid/ui';

export default function AppealNotFound() {
  return (
    <>
      <div className="border-b border-[#E5E7EB]">
        <PublicHeader />
      </div>
      <main className="mx-auto max-w-[560px] px-4 pb-10 pt-8">
        <section className={`${card} p-6 text-center`}>
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F5F7] text-[#5B6B65]">
            <SearchX size={24} aria-hidden />
          </span>
          <h1 className="text-[22px] font-bold text-[#12261E] [font-family:inherit]">Cagnotte introuvable</h1>
          <p className="mt-2 text-[15px] text-[#5B6B65]">
            Ce lien ne correspond à aucune cagnotte active. Vérifiez qu&apos;il est complet ou demandez
            un nouveau lien à la personne qui vous l&apos;a envoyé.
          </p>
          <Link href="/" className={`${btnPrimary} mt-5`}>
            Découvrir Venega
          </Link>
        </section>
      </main>
    </>
  );
}
