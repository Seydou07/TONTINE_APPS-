import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  Coins,
  Eye,
  Fingerprint,
  HandHeart,
  HeartHandshake,
  IdCard,
  KeyRound,
  ListOrdered,
  Monitor,
  Package,
  ShieldCheck,
  Smartphone,
  Gauge,
  type LucideIcon,
} from 'lucide-react';
import { btnAmberLg, btnOnDarkLg } from '@/components/ui/classes';
import '../landing.css';
import { LandingFooter, LandingHeader } from './LandingChrome';
import { HeroPhone } from './HeroPhone';
import { NatureDemo } from './NatureDemo';
import { PaymentDemo } from './PaymentDemo';
import { SolidarityDemo } from './SolidarityDemo';
import { AppealDemo } from './AppealDemo';
import { KycVisual, LockVisual, MoneyFlowVisual, ReliabilityVisual, ReminderVisual, SecretCodeVisual } from './TrustVisuals';
import { RevealController } from './motion';
import { OPERATOR_LIST, OperatorBadge } from './OperatorBadge';

/** Sans JavaScript : annule l'état « masqué avant apparition » (rendu dans un <noscript>). */
const NOSCRIPT_STYLE = '<style>[data-reveal]{opacity:1!important;transform:none!important;animation:none!important}</style>';

/*
 * Page d'accueil publique. Uniquement des fonctions présentes dans l'app :
 * aucun chiffre d'usage, aucun témoignage. Les montants et noms des
 * maquettes sont des exemples, signalés comme tels.
 *
 * Animations : CSS (transform / opacity) + IntersectionObserver.
 * Sans JavaScript, tout le contenu reste visible (voir landing.css).
 */

/** Lien de téléchargement de l'application Android (à renseigner à la publication). */
const ANDROID_APP_URL: string | null = null;


const delay = (ms: number) => ({ ['--lp-delay' as string]: `${ms}ms` }) as CSSProperties;

const PRODUCTS: { id: string; icon: LucideIcon; tone: 'green' | 'amber'; title: string; text: string }[] = [
  {
    id: '#tontine',
    icon: Coins,
    tone: 'green',
    title: 'Tontine en argent',
    text: 'Chaque membre cotise à chaque tour ; la cagnotte revient à tour de rôle à un bénéficiaire, dans l’ordre de passage.',
  },
  {
    id: '#tontine',
    icon: Package,
    tone: 'amber',
    title: 'Tontine en nature',
    text: 'Les cotisations achètent un bien remis à chaque tour : une moto, un kit alimentaire, du ciment…',
  },
  {
    id: '#solidarite',
    icon: HandHeart,
    tone: 'green',
    title: 'Caisse de solidarité',
    text: 'Une caisse commune pour les coups durs : demande d’aide, vote des membres, validation du bureau.',
  },
  {
    id: '#cagnotte',
    icon: HeartHandshake,
    tone: 'amber',
    title: 'Cagnotte d’aide',
    text: 'Un lien à partager : chacun peut donner sans compte, avec son nom ou anonymement.',
  },
];

const MARQUEE = [
  'Tontine en argent',
  'Tontine en nature',
  'Caisse de solidarité',
  'Cagnotte d’aide',
  'Orange Money',
  'Moov Money',
  'Wave',
  'Rappels de cotisation',
  'Score de fiabilité',
  'Identité vérifiée',
];

export function LandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* Sans JavaScript, tout le contenu est affiché d'emblée. */}
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_STYLE }} />
      <RevealController />
      <LandingHeader />

      <main>
        <Hero />
        <Marquee />
        <Overview />
        <TontineSection />
        <PaymentSection />
        <SolidaritySection />
        <AppealSection />
        <TrustSection />
        <FinalCta />
      </main>

      <LandingFooter />
    </div>
  );
}

/* ───────────────────────────── Héros ───────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-b-[32px] bg-primary-dark text-white md:rounded-b-[48px]">
      {/* Anneaux décoratifs (rappel de la roue de rotation) */}
      <div aria-hidden className="pointer-events-none absolute bottom-[-120px] left-1/2 h-[620px] w-[620px] -translate-x-1/2 lg:bottom-auto lg:left-auto lg:right-[-120px] lg:top-1/2 lg:h-[760px] lg:w-[760px] lg:-translate-y-1/2 lg:translate-x-0">
        <div className="lp-orbit absolute inset-0 rounded-full border border-white/10">
          <span className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rounded-full bg-amber" />
        </div>
        <div className="lp-orbit-rev absolute inset-[110px] rounded-full border border-white/10">
          <span className="absolute bottom-[-5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/50" />
        </div>
        <div className="absolute inset-[220px] rounded-full bg-primary/40" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-64px)] max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:pt-14 lg:grid-cols-[1.15fr_auto] lg:gap-12 lg:pb-16">
        <div>
          <p className="lp-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-amber" style={delay(0)}>
            <span className="lp-blink h-1.5 w-1.5 rounded-full bg-amber" />
            Tontine et caisse de solidarité · Burkina Faso
          </p>
          <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] sm:text-[46px] lg:text-[50px] xl:text-[56px]">
            <span className="lp-rise block" style={delay(120)}>
              La tontine <br className="sm:hidden" />
              et l’entraide
            </span>
            <span className="lp-rise block" style={delay(240)}>
              de votre groupe,
            </span>
            <span className="lp-rise block text-amber" style={delay(360)}>
              claires pour tous.
            </span>
          </h1>
          <p className="lp-rise mt-5 max-w-xl text-[16px] leading-relaxed text-white/80 sm:text-[17px]" style={delay(500)}>
            Venega suit chaque cotisation, chaque tour et chaque aide. Les paiements passent par Mobile Money : le
            fondateur d’un cercle ne détient jamais l’argent.
          </p>
          <div className="lp-rise mt-7 flex flex-col gap-2.5 sm:flex-row" style={delay(620)}>
            <Link href="/register" className={`${btnAmberLg} group`}>
              Créer un compte
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link href="/login" className={btnOnDarkLg}>
              Se connecter
            </Link>
          </div>
          <div className="lp-rise mt-7 flex items-center gap-3" style={delay(740)}>
            <span className="text-[13px] text-white/70">Paiement par</span>
            <ul className="flex gap-2" aria-label="Opérateurs acceptés">
              {OPERATOR_LIST.map((op) => (
                <li key={op.key} className="flex">
                  <OperatorBadge op={op.key} alt={op.label} size={36} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lp-phone-in relative mx-auto w-full max-w-[290px]">
          <HeroPhone />
          {/* Cartes flottantes (grand écran) */}
          <div className="lp-float absolute -left-44 top-[300px] hidden w-[196px] rounded-[16px] border border-line bg-white p-3 text-ink shadow-lg lg:block">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-tint text-primary">
                <ShieldCheck size={16} aria-hidden />
              </span>
              <p className="text-[12.5px] font-semibold leading-tight">Le fondateur ne touche pas l’argent</p>
            </div>
            <p className="mt-1.5 text-[11.5px] text-muted">Tout passe par Mobile Money, sous les yeux des membres.</p>
          </div>
          <div className="lp-float-slow absolute -right-52 top-[150px] hidden w-[184px] rounded-[16px] border border-line bg-white p-3 text-ink shadow-lg 2xl:block">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-tint text-amber-dark">
                <BellRing size={16} aria-hidden />
              </span>
              <p className="text-[12.5px] font-semibold leading-tight">Rappel avant chaque échéance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Bandeau défilant (fonctions) ─────────────── */

function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="relative mt-6 overflow-hidden py-3" aria-hidden>
      <div className="lp-marquee flex w-max gap-3">
        {items.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink-soft"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${i % 2 ? 'bg-amber' : 'bg-primary'}`} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── Vue d'ensemble ─────────────── */

function SectionHead({ eyebrow, title, text, center }: { eyebrow: string; title: ReactNode; text?: ReactNode; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p data-reveal className="text-[13px] font-semibold uppercase tracking-[0.08em] text-amber-dark">
        {eyebrow}
      </p>
      <h2 data-reveal style={delay(80)} className="mt-2 text-[28px] font-extrabold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[36px]">
        {title}
      </h2>
      {text && (
        <p data-reveal style={delay(160)} className="mt-3 text-[16px] leading-relaxed text-muted sm:text-[17px]">
          {text}
        </p>
      )}
    </div>
  );
}

function Overview() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <SectionHead
        eyebrow="Ce que fait Venega"
        title="Quatre façons de s’organiser ensemble"
        text="Une seule application pour l’épargne et l’entraide du groupe. Les mêmes règles qu’en réunion, mais tout est noté et chacun peut vérifier."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {PRODUCTS.map((p, i) => {
          const Icon = p.icon;
          return (
            <a
              key={p.title}
              href={p.id}
              data-reveal
              style={delay(i * 100)}
              className="group flex gap-4 rounded-[22px] border border-line bg-white p-4 transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md sm:flex-col sm:gap-0 sm:p-5"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${
                  p.tone === 'green' ? 'bg-primary-tint text-primary' : 'bg-amber-tint text-amber-dark'
                }`}
              >
                <Icon size={24} aria-hidden />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-[17px] font-bold text-ink sm:mt-4 sm:text-[18px]">{p.title}</h3>
                <p className="mt-1 flex-1 text-[14.5px] leading-snug text-muted sm:mt-1.5">{p.text}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold text-primary sm:mt-4">
                  Voir
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────── Tontine ─────────────── */

function Bullet({ icon: Icon, title, text, i = 0 }: { icon: LucideIcon; title: string; text: string; i?: number }) {
  return (
    <li data-reveal style={delay(i * 90)} className="flex gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary-tint text-primary">
        <Icon size={20} aria-hidden />
      </span>
      <div>
        <p className="text-[16px] font-bold text-ink">{title}</p>
        <p className="mt-0.5 text-[14.5px] leading-snug text-muted">{text}</p>
      </div>
    </li>
  );
}

function TontineSection() {
  return (
    <section id="tontine" className="scroll-mt-16 border-y border-line bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHead
            eyebrow="Tontine"
            title="En argent ou en nature, chacun son tour"
            text="Le montant, le rythme et l’ordre de passage sont fixés à la création du cercle. La roue de rotation montre qui reçoit ce tour-ci, qui a déjà été servi et qui attend."
          />
          <ul className="mt-7 space-y-5">
            <Bullet i={0} icon={ListOrdered} title="Ordre de passage visible" text="Chaque membre voit sa position et le bénéficiaire du tour." />
            <Bullet i={1} icon={Eye} title="Chaque cotisation enregistrée" text="Qui a payé, quand et par quel opérateur : l’historique est le même pour tous." />
            <Bullet i={2} icon={BellRing} title="Rappels de cotisation" text="Une notification avant l’échéance, pour ne pas oublier son tour." />
          </ul>
        </div>
        <div data-reveal="right">
          <NatureDemo />
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Paiement ─────────────── */

function PaymentSection() {
  return (
    <section id="paiement" className="scroll-mt-16 mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.9fr]">
        <SectionHead
          eyebrow="Comment ça marche"
          title="Payer, c’est toujours les mêmes étapes"
          text="Cotisation, adhésion, versement ou don : le montant exact est affiché, vous confirmez, puis vous validez chez votre opérateur."
        />
        <div data-reveal="zoom" className="relative overflow-hidden rounded-[24px] border border-line">
          <Image
            src="/banners/mobile-money.jpg"
            alt="Cotisez par Mobile Money : Orange Money, Moov Money et Wave acceptés."
            width={1200}
            height={560}
            sizes="(min-width: 1024px) 480px, 100vw"
            className="h-auto w-full"
          />
        </div>
      </div>
      <div className="mt-10 md:mt-14">
        <PaymentDemo />
      </div>
    </section>
  );
}

/* ─────────────── Solidarité ─────────────── */

function SolidaritySection() {
  return (
    <section id="solidarite" className="scroll-mt-16 bg-primary-tint/50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHead
          eyebrow="Caisse de solidarité"
          title="Une aide décidée ensemble, versée au grand jour"
          text="Personne ne décide seul : les membres votent, le bureau valide, et chaque décaissement reste dans le journal de la caisse."
        />
        <div className="mt-10">
          <SolidarityDemo />
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Cagnotte d'aide ─────────────── */

function AppealSection() {
  return (
    <section id="cagnotte" className="scroll-mt-16 mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="order-2 lg:order-1" data-reveal="left">
          <AppealDemo />
        </div>
        <div className="order-1 lg:order-2">
          <SectionHead
            eyebrow="Cagnotte d’aide"
            title="Un lien à partager, et chacun peut donner"
            text="Pour un malade, un sinistré, un projet : créez une cagnotte publique et partagez son lien sur WhatsApp ou par SMS."
          />
          <ul className="mt-7 space-y-5">
            <Bullet i={0} icon={Smartphone} title="Dons sans compte" text="Le donateur paie par Mobile Money, sans installer l’application." />
            <Bullet i={1} icon={Eye} title="Avec son nom ou anonymement" text="Chaque don apparaît sur la page, au choix du donateur." />
            <Bullet i={2} icon={IdCard} title="Créateur vérifié" text="Pour créer une cagnotte, l’identité est vérifiée (CNIB et selfie)." />
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Confiance ─────────────── */

function TrustCard({ icon: Icon, title, text, children, i }: { icon: LucideIcon; title: string; text: string; children?: ReactNode; i: number }) {
  return (
    <article data-reveal style={delay((i % 3) * 100)} className="flex flex-col rounded-[22px] border border-line bg-white p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary-tint text-primary">
        <Icon size={22} aria-hidden />
      </span>
      <h3 className="mt-3.5 text-[17px] font-bold text-ink">{title}</h3>
      <p className="mt-1 text-[14.5px] leading-snug text-muted">{text}</p>
      {children && <div className="mt-4">{children}</div>}
    </article>
  );
}

function TrustSection() {
  return (
    <section id="confiance" className="scroll-mt-16 border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHead
          eyebrow="Sécurité et confiance"
          title="Pensé pour qu’on puisse se faire confiance"
          text="L’argent ne passe pas par les mains d’un membre, et chacun sait avec qui il s’engage."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TrustCard i={0} icon={ShieldCheck} title="Personne ne garde la caisse" text="Le fondateur d’un cercle ne détient jamais l’argent : cotisations et versements passent par Mobile Money.">
            <MoneyFlowVisual />
          </TrustCard>
          <TrustCard i={1} icon={KeyRound} title="Votre code reste secret" text="Le code secret Mobile Money se saisit uniquement dans la fenêtre de votre opérateur, jamais dans Venega.">
            <SecretCodeVisual />
          </TrustCard>
          <TrustCard i={2} icon={IdCard} title="Identité vérifiée" text="CNIB et selfie sont demandés pour créer une cagnotte ou adhérer aux cercles qui l’exigent.">
            <KycVisual />
          </TrustCard>
          <TrustCard i={3} icon={Gauge} title="Score de fiabilité" text="Calculé sur les cotisations passées : à temps, en retard ou manquées. Utile pour choisir ses membres.">
            <ReliabilityVisual />
          </TrustCard>
          <TrustCard i={4} icon={BellRing} title="Rappels de cotisation" text="Venega prévient avant l’échéance ; le bureau peut relancer les retardataires.">
            <ReminderVisual />
          </TrustCard>
          <TrustCard i={5} icon={Fingerprint} title="Application verrouillée" text="Ouverture par empreinte, code ou schéma du téléphone, si vous l’activez.">
            <LockVisual />
          </TrustCard>
        </div>
        <p data-reveal className="mt-6 text-center text-[13px] text-muted">
          Les montants, noms et scores affichés dans les maquettes de cette page sont des exemples.
        </p>
      </div>
    </section>
  );
}

/* ─────────────── Appel final ─────────────── */

function FinalCta() {
  return (
    <section className="px-4 pb-14 sm:px-6 md:pb-20">
      <div data-reveal="zoom" className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-primary-dark text-white">
        <div aria-hidden className="lp-orbit pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/10">
          <span className="absolute bottom-[-5px] left-1/2 h-2.5 w-2.5 rounded-full bg-amber" />
        </div>
        <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1fr] lg:p-14">
          <div>
            <h2 className="text-[28px] font-extrabold leading-[1.15] sm:text-[38px]">
              Lancez votre cercle <span className="text-amber">aujourd’hui</span>
            </h2>
            <p className="mt-3 max-w-md text-[16px] leading-relaxed text-white/80">
              Créez un compte avec votre numéro de téléphone, puis invitez les membres de votre tontine ou de votre caisse.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link href="/register" className={btnAmberLg}>
                Créer un compte
              </Link>
              <Link href="/login" className={btnOnDarkLg}>
                Se connecter
              </Link>
            </div>
            <AndroidApp />
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[24px] bg-white">
              <Image
                src="/banners/tontine.jpg"
                alt="Votre tontine, sans cahier : cotisations, tours et cagnottes suivis automatiquement."
                width={1200}
                height={560}
                sizes="(min-width: 1024px) 520px, 100vw"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AndroidApp() {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/10">
        <Smartphone size={20} aria-hidden />
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[14px] font-semibold">Application Android</span>
        <span className="block text-[12.5px] text-white/70">
          {ANDROID_APP_URL ? 'Télécharger l’application' : 'Lien de téléchargement bientôt ici'}
        </span>
      </span>
      <span className="ml-auto hidden items-center gap-1.5 pl-3 text-[12.5px] text-white/70 sm:inline-flex">
        <Monitor size={15} aria-hidden /> Mêmes fonctions que le site
      </span>
    </>
  );
  const cls = 'mt-5 flex w-full max-w-md items-center gap-3 rounded-[16px] border border-white/15 p-3';
  return ANDROID_APP_URL ? (
    <a href={ANDROID_APP_URL} className={`${cls} hover:bg-white/5`}>
      {content}
    </a>
  ) : (
    <div className={cls}>{content}</div>
  );
}
