'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Copy, Link2, Share2, ShieldCheck } from 'lucide-react';
import { KycStatus, type Circle } from '@venega/types';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Chip, ChipGroup } from '@/components/ui/choice';
import { CenteredState, Notice, ScreenBody, ScreenFooter } from '@/components/ui/blocks';
import { TextArea, TextField } from '@/components/ui/TextField';
import { label as labelClass } from '@/components/ui/classes';
import { useDemoStore } from '@/lib/demoStore';
import { formatF } from '@/lib/format';
import { createAidAppeal, getAidShareLink, getCurrentUser } from '@/features/circles/store';
import { PhotoPicker } from './PhotoPicker';

const toNumber = (v: string) => Number(v.replace(/\D/g, '')) || 0;

const GOAL_PRESETS = [100000, 250000, 500000, 1000000];
const DURATIONS: { label: string; days: number | null }[] = [
  { label: '7 jours', days: 7 },
  { label: '15 jours', days: 15 },
  { label: '30 jours', days: 30 },
  { label: 'Sans limite', days: null },
];
const MIN_GOAL = 10000;
const MIN_STORY = 30;

/**
 * Lancer une cagnotte d'aide publique (écran mobile CreateAidScreen) : un lien à
 * partager, payable même sans l'application. Réservé aux comptes vérifiés.
 * TODO API : `POST /appeals` { title, story, goalAmount, endDate?, photoFileId? } → { id, code }
 * (docs/api-mobile.md, section 7) ; la photo passe par `POST /uploads`.
 */
export function AidCreateView() {
  useDemoStore();
  const router = useRouter();
  const verified = getCurrentUser().kycStatus === KycStatus.VERIFIED;

  const [photo, setPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [phone, setPhone] = useState('');
  const [story, setStory] = useState('');
  const [goalText, setGoalText] = useState('');
  const [days, setDays] = useState<number | null>(30);
  const [created, setCreated] = useState<Circle | null>(null);

  const goal = toNumber(goalText);
  const phoneDigits = phone.replace(/\D/g, '').slice(0, 8);
  const storyLength = story.trim().length;
  const canSubmit =
    verified &&
    title.trim().length >= 5 &&
    beneficiary.trim().length >= 2 &&
    phoneDigits.length === 8 &&
    storyLength >= MIN_STORY &&
    goal >= MIN_GOAL;

  const submit = () => {
    if (!canSubmit) return;
    const { circle } = createAidAppeal({
      title: title.trim(),
      beneficiaryName: beneficiary.trim(),
      beneficiaryNumber: `+226 ${phoneDigits.replace(/(\d{2})(?=\d)/g, '$1 ')}`,
      reason: story.trim(),
      goalAmount: goal,
      deadline: days ? new Date(Date.now() + days * 86400000).toISOString() : undefined,
      beneficiaryPhoto: photo ?? undefined,
    });
    setCreated(circle);
  };

  if (created) {
    return <CreatedView circle={created} onOpen={() => router.replace(`/aid/${created.id}`)} />;
  }

  return (
    <>
      <PageHeader title="Lancer une cagnotte" onBack={() => router.back()} />
      <ScreenBody>
        <p className="text-[15px] text-muted">
          Collectez pour une personne dans le besoin. Vous recevez un lien à partager : chacun peut donner, avec son nom
          ou anonymement, même sans l’application.
        </p>

        {!verified && (
          <Notice icon={ShieldCheck} tone="warning" title="Vérifiez votre identité d’abord">
            <p>Pour protéger les donateurs, seules les personnes vérifiées peuvent lancer une cagnotte.</p>
            <Link href="/kyc/intro" className="mt-1.5 inline-block text-[14px] font-semibold text-amber-dark hover:underline">
              Vérifier mon identité
            </Link>
          </Notice>
        )}

        <PhotoPicker value={photo} onChange={setPhoto} hint="Une photo augmente la confiance des donateurs" />

        <div className="space-y-4">
          <TextField
            label="Titre de la cagnotte"
            placeholder="Ex. Soins de dialyse pour Mariam"
            maxLength={70}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Pour qui ?"
            placeholder="Nom de la personne aidée"
            maxLength={60}
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
          <TextField
            label="Numéro Mobile Money du bénéficiaire"
            prefix="+226"
            placeholder="70 12 34 56"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 8)
                  .replace(/(\d{2})(?=\d)/g, '$1 '),
              )
            }
            hint="Les fonds y seront versés après validation."
          />
          <TextArea
            label="Son histoire"
            placeholder="Expliquez la situation et à quoi servira l’argent."
            maxLength={1000}
            rows={5}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            hint={
              storyLength < MIN_STORY ? `Encore ${MIN_STORY - storyLength} caractères minimum` : `${storyLength} / 1000`
            }
          />
          <div>
            <TextField
              label="Objectif"
              suffix="F CFA"
              placeholder="500 000"
              inputMode="numeric"
              value={goal ? new Intl.NumberFormat('fr-FR').format(goal) : ''}
              onChange={(e) => setGoalText(e.target.value.replace(/\D/g, '').slice(0, 9))}
              error={goalText && goal < MIN_GOAL ? `Minimum ${formatF(MIN_GOAL)}` : undefined}
            />
            <div className="mt-2.5">
              <ChipGroup label="Objectifs proposés">
                {GOAL_PRESETS.map((g) => (
                  <Chip key={g} label={formatF(g)} selected={goal === g} onClick={() => setGoalText(String(g))} />
                ))}
              </ChipGroup>
            </div>
          </div>
          <div>
            <p className={labelClass}>Durée de la collecte</p>
            <ChipGroup label="Durée de la collecte">
              {DURATIONS.map((d) => (
                <Chip key={d.label} label={d.label} selected={days === d.days} onClick={() => setDays(d.days)} />
              ))}
            </ChipGroup>
          </div>
        </div>

        <Notice icon={ShieldCheck} tone="primary">
          L’argent est bloqué sur la cagnotte et versé au bénéficiaire uniquement après validation par les approbateurs.
          Chaque donateur choisit d’afficher son nom ou de rester anonyme.
        </Notice>

        <ScreenFooter>
          <Button disabled={!canSubmit} onClick={submit}>
            Lancer la cagnotte
          </Button>
        </ScreenFooter>
      </ScreenBody>
    </>
  );
}

function CreatedView({ circle, onOpen }: { circle: Circle; onOpen: () => void }) {
  const link = getAidShareLink(circle);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : le lien reste affiché et sélectionnable.
    }
  };

  const share = async () => {
    const text = `${circle.name}\nAidez-nous en contribuant à cette cagnotte, avec votre nom ou anonymement :\n${link}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: circle.name, text });
        return;
      } catch {
        return;
      }
    }
    copy();
  };

  return (
    <ScreenBody className="pt-8">
      <CenteredState icon={Check} title="Votre cagnotte est en ligne" text={circle.name} />

      <section className="rounded-[20px] border border-line bg-white p-4">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
            <Link2 size={18} />
          </span>
          <p className="min-w-0 flex-1 select-all truncate text-[15px] font-semibold text-ink">{link}</p>
        </div>
        <p className="mt-3 text-[13px] text-muted">
          Partagez ce lien sur WhatsApp, Facebook ou par SMS. Il s’ouvre dans le navigateur, sans installer
          l’application.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button size="sm" variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
            {copied ? 'Copié' : 'Copier le lien'}
          </Button>
          <Button size="sm" icon={Share2} onClick={share}>
            Partager
          </Button>
        </div>
      </section>

      <ScreenFooter>
        <Button variant="secondary" onClick={onOpen}>
          Voir la cagnotte
        </Button>
      </ScreenFooter>
    </ScreenBody>
  );
}
