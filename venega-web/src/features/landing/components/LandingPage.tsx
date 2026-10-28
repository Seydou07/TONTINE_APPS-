import Link from 'next/link';
import {
  Banknote,
  Check,
  Eye,
  HandHeart,
  HeartHandshake,
  History,
  Landmark,
  Package,
  Smartphone,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { PAYABLE_OPERATORS } from '@/features/aid/schema';
import { OperatorLogo } from '@/features/aid/components/OperatorMark';
import { btnAmberLg, btnOnDarkLg, btnPrimary, btnSecondary, card } from '@/components/ui/classes';
import { IconTile } from '@/components/ui/misc';
import { LandingFooter, LandingHeader } from './LandingChrome';

const STEPS = [
  { title: 'Créez ou rejoignez un cercle', text: "Comme président, ou avec le code d'invitation reçu sur WhatsApp." },
  { title: 'Cotisez par Mobile Money', text: 'Orange Money, Moov Money ou Wave, depuis votre propre numéro.' },
  { title: 'Suivez tout en direct', text: 'Qui a payé, qui est en retard, qui reçoit au prochain tour.' },
  { title: 'Recevez votre tour', text: 'La cagnotte arrive sur votre Mobile Money, ou le lot vous est remis.' },
];

const PAY_STEPS = [
  { title: "Choisissez l'opérateur", text: 'Orange Money, Moov Money ou Wave.' },
  { title: 'Appuyez sur « Payer »', text: 'Le montant exact est affiché sur le bouton.' },
  { title: 'Confirmez', text: 'Montant, opérateur et numéro sont rappelés.' },
  { title: 'Validez sur le téléphone', text: 'Code USSD ou application, avec votre code secret.' },
];

const SECURITY: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Landmark,
    title: "L'argent ne passe jamais par un compte personnel",
    text: 'Chaque cotisation va sur le compte de collecte du cercle, jamais dans le portefeuille du président.',
  },
  {
    icon: UsersRound,
    title: 'Double validation',
    text: "Toute dépense de la caisse de solidarité demande l'accord du président et du trésorier.",
  },
  {
    icon: History,
    title: 'Historique complet',
    text: 'Chaque mouvement est daté et visible par tous les membres du cercle.',
  },
];

const AUDIENCE = ['Familles', 'Collègues de bureau', 'Commerçants', 'Associations', 'Quartiers', 'Événements de vie'];

export function LandingPage() {
  return (
    <>
      <LandingHeader />

      <main>
        {/* ── Bandeau vert ── */}
        <section className="rounded-b-[28px] bg-primary-dark text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pb-16 md:pt-14">
            <div>
              <p className="text-[14px] font-medium text-amber">Tontine et caisse de solidarité · Burkina Faso</p>
              <h1 className="mt-3 text-[30px] font-bold leading-[1.15] sm:text-[38px]">
                Vos cotisations de groupe, claires pour tout le monde.
              </h1>
              <p className="mt-4 max-w-xl text-[16px] text-white/80">
                Cotisez par Mobile Money, suivez chaque tour et voyez qui a payé. L&apos;argent va sur le compte du
                cercle, jamais sur celui d&apos;un membre.
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

            {/* Aperçu d'un cercle (illustration en HTML, aucune image lourde) */}
            <div aria-hidden className={`${card} mx-auto w-full max-w-sm p-4 text-ink`}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-muted">Exemple de cercle</p>
                <span className="rounded-full bg-primary-tint px-2.5 py-1 text-[12px] font-semibold text-primary-dark">
                  Tontine
                </span>
              </div>
              <p className="mt-1 text-[17px] font-bold">Tontine du quartier</p>
              <div className="mt-3 rounded-[14px] bg-fill p-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[12px] text-muted">Cotisation mensuelle</p>
                    <p className="text-[20px] font-bold">10 000 F CFA</p>
                  </div>
                  <p className="text-[13px] font-semibold text-primary-dark">Tour 3 sur 6</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-1/2 rounded-full bg-primary" />
                </div>
              </div>
              <ul className="mt-3 divide-y divide-line text-[14px]">
                {[
                  { n: 'Awa', s: 'Payé', c: 'bg-primary-tint text-primary-dark' },
                  { n: 'Issouf', s: 'Payé', c: 'bg-primary-tint text-primary-dark' },
                  { n: 'Mariam', s: 'En attente', c: 'bg-amber-tint text-amber-dark' },
                ].map((m) => (
                  <li key={m.n} className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fill text-[11px] font-semibold text-ink-soft">
                        {m.n.charAt(0)}
                      </span>
                      {m.n}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${m.c}`}>{m.s}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex h-11 items-center justify-center rounded-[12px] bg-primary text-[14px] font-semibold text-white">
                Payer 10 000 F CFA
              </div>
            </div>
          </div>
        </section>

        {/* ── Fonctionnalités ── */}
        <section id="fonctionnalites" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 md:py-16">
          <h2 className="text-[24px] font-bold text-ink md:text-[28px]">Deux façons de cotiser ensemble</h2>
          <p className="mt-1 text-[15px] text-muted">Venega s&apos;adapte à vos habitudes, pas l&apos;inverse.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className={`${card} p-5`}>
              <IconTile icon={Banknote} size={44} />
              <h3 className="mt-3 text-[18px] font-bold text-ink">Tontine</h3>
              <p className="mt-1 text-[15px] text-muted">
                Chacun cotise, chacun reçoit à son tour. En espèces, ou en nature : moto, vivres, pagnes, ciment…
              </p>
              <ul className="mt-4 space-y-2 text-[14px] text-ink-soft">
                {['Ordre de passage visible par tous', 'Rappels avant chaque cotisation', 'Cagnotte versée sur Mobile Money'].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check size={16} className="shrink-0 text-primary" aria-hidden />
                      {t}
                    </li>
                  ),
                )}
              </ul>
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-fill px-3 py-1 text-[13px] text-ink-soft">
                <Package size={14} aria-hidden />
                Tontine en nature possible
              </p>
            </article>

            <article className={`${card} p-5`}>
              <IconTile icon={HandHeart} tone="amber" size={44} />
              <h3 className="mt-3 text-[18px] font-bold text-ink">Caisse de solidarité</h3>
              <p className="mt-1 text-[15px] text-muted">
                Un fonds d&apos;entraide pour soutenir un membre en cas de maladie, de deuil ou d&apos;heureux événement.
              </p>
              <ul className="mt-4 space-y-2 text-[14px] text-ink-soft">
                {['Demandes d’aide votées par les membres', 'Double validation des dépenses', 'Justificatif pour chaque aide versée'].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check size={16} className="shrink-0 text-primary" aria-hidden />
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </article>
          </div>

          <article className={`${card} mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center`}>
            <IconTile icon={HeartHandshake} tone="amber" size={44} />
            <div className="flex-1">
              <h3 className="text-[16px] font-bold text-ink">Cagnotte d&apos;aide par lien</h3>
              <p className="mt-0.5 text-[14px] text-muted">
                Partagez un lien sur WhatsApp : proches et amis contribuent par Mobile Money, sans créer de compte.
              </p>
            </div>
          </article>

          <div className="mt-6 flex flex-wrap gap-2" aria-label="Pour qui">
            {AUDIENCE.map((a) => (
              <span key={a} className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink-soft">
                {a}
              </span>
            ))}
          </div>
        </section>

        {/* ── Comment ça marche ── */}
        <section id="comment" className="scroll-mt-20 border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <h2 className="text-[24px] font-bold text-ink md:text-[28px]">Comment ça marche</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-[20px] bg-fill p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-[16px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-1 text-[14px] text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Paiement ── */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <IconTile icon={Smartphone} size={44} />
              <h2 className="mt-3 text-[24px] font-bold text-ink md:text-[28px]">Payer, c&apos;est partout pareil</h2>
              <p className="mt-2 text-[15px] text-muted">
                Cotisation, frais d&apos;adhésion ou contribution à une cagnotte : le paiement suit toujours les mêmes
                étapes. Aucune donnée bancaire à saisir.
              </p>
              <ul className="mt-4 flex gap-2" aria-label="Opérateurs acceptés">
                {PAYABLE_OPERATORS.map((m) => (
                  <li key={m}>
                    <OperatorLogo method={m} size={40} />
                  </li>
                ))}
              </ul>
            </div>
            <ol className={`${card} divide-y divide-line`}>
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

        {/* ── Sécurité ── */}
        <section id="securite" className="scroll-mt-20 border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            <h2 className="text-[24px] font-bold text-ink md:text-[28px]">La confiance, garantie par le système</h2>
            <p className="mt-1 text-[15px] text-muted">Les règles du cercle s&apos;appliquent à tous, président compris.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {SECURITY.map((s) => (
                <article key={s.title} className="rounded-[20px] border border-line p-5">
                  <IconTile icon={s.icon} size={42} />
                  <h3 className="mt-3 text-[16px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-1 text-[14px] text-muted">{s.text}</p>
                </article>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-2 text-[14px] text-ink-soft">
              <Eye size={16} className="text-primary" aria-hidden />
              Chaque membre voit les mêmes chiffres, au même moment.
            </p>
          </div>
        </section>

        {/* ── Appel final ── */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <div className={`${card} p-6 text-center md:p-10`}>
            <h2 className="text-[24px] font-bold text-ink md:text-[28px]">Lancez votre cercle aujourd&apos;hui</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
              Créez votre compte en deux minutes, depuis votre téléphone ou votre ordinateur.
            </p>
            <div className="mx-auto mt-6 grid max-w-md gap-2.5 sm:grid-cols-2">
              <Link href="/register" className={btnPrimary}>
                Créer un compte
              </Link>
              <Link href="/login" className={btnSecondary}>
                Se connecter
              </Link>
            </div>
            <p className="mt-5 text-[13px] text-muted">Applications Android et iPhone bientôt disponibles.</p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
