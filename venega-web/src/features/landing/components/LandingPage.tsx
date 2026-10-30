import Link from 'next/link';
import { Coins, Eye, HandHeart, HeartHandshake, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react';
import { PAYABLE_OPERATORS } from '@/features/aid/schema';
import { OperatorLogo } from '@/features/aid/components/OperatorMark';
import { btnAmberLg, btnOnDarkLg, card } from '@/components/ui/classes';
import { IconTile } from '@/components/ui/misc';
import { LandingFooter, LandingHeader } from './LandingChrome';

/*
 * Page d'accueil publique. Seulement des faits présents dans l'application :
 * pas de chiffres, de témoignages ni de promesses inventés.
 */

const FEATURES: { icon: LucideIcon; tone: 'green' | 'amber'; title: string; text: string }[] = [
  {
    icon: Coins,
    tone: 'green',
    title: 'Tontine',
    text: 'Chaque membre cotise à chaque tour, et la cagnotte revient à tour de rôle à un bénéficiaire. En argent, ou en nature : un bien remis à chaque tour (moto, kit alimentaire, ciment…).',
  },
  {
    icon: HandHeart,
    tone: 'amber',
    title: 'Caisse de solidarité',
    text: 'Une caisse commune pour les coups durs du groupe. Une aide n’est versée qu’après l’accord des validateurs désignés, et chaque mouvement reste visible par les membres.',
  },
  {
    icon: HeartHandshake,
    tone: 'amber',
    title: 'Cagnotte d’aide',
    text: 'Un lien à partager : chacun peut donner, même sans l’application, avec son nom ou anonymement.',
  },
];

const PAY_STEPS = [
  { title: 'Choisissez l’opérateur', text: 'Orange Money, Moov Money ou Wave.' },
  { title: 'Appuyez sur « Payer »', text: 'Le montant exact est affiché sur le bouton.' },
  { title: 'Confirmez le paiement', text: 'Montant, opérateur et numéro sont rappelés.' },
  { title: 'Validez sur votre téléphone', text: 'Avec le code USSD et votre code secret.' },
];

const TRUST: { icon: LucideIcon; text: string }[] = [
  { icon: Eye, text: 'Chaque cotisation est visible par tous les membres du cercle.' },
  { icon: ShieldCheck, text: 'Le fondateur d’un cercle ne détient jamais l’argent : les paiements passent par Mobile Money.' },
];

export function LandingPage() {
  return (
    <>
      <LandingHeader />

      <main>
        {/* ── Bandeau vert ── */}
        <section className="rounded-b-[28px] bg-primary-dark text-white">
          <div className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 md:pb-14 md:pt-14">
            <p className="text-[14px] font-medium text-amber">Tontine et caisse de solidarité · Burkina Faso</p>
            <h1 className="mt-3 max-w-2xl text-[28px] font-bold leading-[1.2] sm:text-[36px]">
              Une tontine simple et sécurisée
            </h1>
            <p className="mt-3 max-w-xl text-[16px] text-white/80">
              Épargnez en toute confiance avec vos proches : cotisations, tours et cagnottes suivis au même endroit.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link href="/register" className={btnAmberLg}>
                Créer un compte
              </Link>
              <Link href="/login" className={btnOnDarkLg}>
                Se connecter
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-[13px] text-white/75">Paiement par</span>
              <ul className="flex gap-2" aria-label="Opérateurs acceptés">
                {PAYABLE_OPERATORS.map((m) => (
                  <li key={m}>
                    <OperatorLogo method={m} size={30} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Fonctionnalités ── */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
          <h2 className="text-[22px] font-bold text-ink md:text-[26px]">Ce que vous pouvez faire</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className={`${card} p-5`}>
                <IconTile icon={f.icon} tone={f.tone} size={44} />
                <h3 className="mt-3 text-[17px] font-bold text-ink">{f.title}</h3>
                <p className="mt-1 text-[15px] text-muted">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Paiement ── */}
        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.2fr] md:items-center md:py-14">
            <div>
              <IconTile icon={Smartphone} size={44} />
              <h2 className="mt-3 text-[22px] font-bold text-ink md:text-[26px]">Payer, c’est partout pareil</h2>
              <p className="mt-2 text-[15px] text-muted">
                Cotisation, adhésion, versement ou don à une cagnotte : le paiement suit toujours les mêmes étapes.
              </p>
            </div>
            <ol className="divide-y divide-line rounded-[20px] border border-line">
              {PAY_STEPS.map((s, i) => (
                <li key={s.title} className="flex items-start gap-3 p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[13px] font-bold text-primary-dark">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{s.title}</p>
                    <p className="text-[14px] text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Transparence ── */}
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
          <h2 className="text-[22px] font-bold text-ink md:text-[26px]">Solidarité et transparence</h2>
          <ul className="mt-5 space-y-3">
            {TRUST.map((t) => (
              <li key={t.text} className={`${card} flex items-start gap-3 p-4`}>
                <IconTile icon={t.icon} size={38} />
                <p className="pt-2 text-[15px] text-ink">{t.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] text-muted">
            Venega existe aussi en application mobile, avec les mêmes fonctions que ce site.
          </p>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
