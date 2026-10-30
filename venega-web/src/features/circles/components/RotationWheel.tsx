'use client';

import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';

/*
 * Roue de rotation d'une tontine (copie de RotationWheel.tsx mobile, sans animation) :
 * les membres sont disposés en cercle autour du bénéficiaire du tour. Liseré vert :
 * bénéficiaire ; ambre : déjà servi ; gris : en attente. Les photos rétrécissent avec
 * le nombre de membres (42 → 26 px) ; au-delà, la roue montre les prochains passages et « +N ».
 */

const WHEEL_SIZE = 240;
const CENTER_SIZE = 116;
const AVATAR_SIZE = 42;
const MIN_AVATAR_SIZE = 26;
const AVATAR_RADIUS = 98;
const AVATAR_GAP = 4;
const CIRCUMFERENCE = 2 * Math.PI * AVATAR_RADIUS;
const MAX_SLOTS = Math.floor(CIRCUMFERENCE / (MIN_AVATAR_SIZE + AVATAR_GAP));

const avatarSizeFor = (slots: number) =>
  Math.max(MIN_AVATAR_SIZE, Math.min(AVATAR_SIZE, Math.floor(CIRCUMFERENCE / Math.max(slots, 1)) - AVATAR_GAP));

export type WheelMember = {
  userId: string;
  name: string;
  avatarUrl?: string;
  hasReceived: boolean;
};

export function RotationWheel({
  title = 'Tour actuel de rotation',
  members,
  beneficiaryUserId,
  centerLabel = 'Bénéficiaire',
  centerName,
  centerCaption,
  onPressMember,
  children,
}: {
  title?: string;
  /** Membres dans l'ordre de passage. */
  members: WheelMember[];
  beneficiaryUserId?: string;
  centerLabel?: string;
  centerName: string;
  centerCaption?: string;
  onPressMember?: (userId: string) => void;
  /** Contenu sous la légende, dans la même carte (ex. boutons d'action). */
  children?: ReactNode;
}) {
  const overflow = members.length > MAX_SLOTS ? members.length - (MAX_SLOTS - 1) : 0;
  const start = Math.max(
    members.findIndex((m) => m.userId === beneficiaryUserId),
    0,
  );
  const visible: WheelMember[] = overflow
    ? Array.from({ length: MAX_SLOTS - 1 }, (_, i) => members[(start + i) % members.length]!)
    : members;
  const slots = visible.length + (overflow ? 1 : 0);
  const stepAngle = 360 / Math.max(slots, 1);
  const size = avatarSizeFor(slots);

  const position = (index: number) => {
    const angle = (index * stepAngle - 90) * (Math.PI / 180);
    return {
      left: WHEEL_SIZE / 2 + AVATAR_RADIUS * Math.cos(angle) - size / 2,
      top: WHEEL_SIZE / 2 + AVATAR_RADIUS * Math.sin(angle) - size / 2,
    };
  };

  return (
    <section className="flex flex-col items-center rounded-[20px] border border-line bg-white px-3 py-[18px]">
      <h2 className="self-start px-1 text-[15px] font-semibold text-ink">{title}</h2>
      <div className="relative mb-1.5 mt-4" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
        <div
          className="absolute flex flex-col items-center justify-center rounded-full bg-primary-tint px-2 text-center"
          style={{
            width: CENTER_SIZE,
            height: CENTER_SIZE,
            left: (WHEEL_SIZE - CENTER_SIZE) / 2,
            top: (WHEEL_SIZE - CENTER_SIZE) / 2,
          }}
        >
          <span className="text-[12px] text-muted">{centerLabel}</span>
          <span className="mt-0.5 max-w-full truncate text-[17px] font-bold text-primary-dark">{centerName}</span>
          {centerCaption && <span className="mt-0.5 text-[12px] text-primary">{centerCaption}</span>}
        </div>

        {visible.map((member, index) => {
          const isBeneficiary = member.userId === beneficiaryUserId;
          const border = isBeneficiary ? 'border-primary' : member.hasReceived ? 'border-amber' : 'border-line-strong';
          const style = { width: size, height: size, ...position(index) };
          const avatar = <Avatar name={member.name} uri={member.avatarUrl} size={size - 6} />;
          const cls = `absolute flex items-center justify-center rounded-full border-2 bg-white ${border}`;
          return onPressMember ? (
            <button
              key={member.userId}
              type="button"
              onClick={() => onPressMember(member.userId)}
              aria-label={`Voir le profil de ${member.name}`}
              title={member.name}
              className={`${cls} hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary`}
              style={style}
            >
              {avatar}
            </button>
          ) : (
            <span key={member.userId} title={member.name} className={cls} style={style}>
              {avatar}
            </span>
          );
        })}

        {overflow > 0 && (
          <span
            aria-label={`Et ${overflow} autres membres`}
            className="absolute flex items-center justify-center rounded-full border-2 border-line-strong bg-fill text-[12px] font-bold text-ink-soft"
            style={{ width: size, height: size, ...position(visible.length) }}
          >
            +{overflow}
          </span>
        )}
      </div>

      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        <LegendItem color="bg-primary" label="Bénéficiaire du tour" />
        <LegendItem color="bg-amber" label="Déjà servi" />
        <LegendItem color="bg-line-strong" label="En attente" />
      </ul>

      {children && <div className="mt-4 w-full space-y-2.5 px-1">{children}</div>}
    </section>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-[12px] text-muted">
      <span aria-hidden className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </li>
  );
}
