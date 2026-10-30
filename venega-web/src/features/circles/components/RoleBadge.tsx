import { Role } from '@venega/types';

const ROLE_TONE: Partial<Record<Role, string>> = {
  [Role.PRESIDENT]: 'bg-amber-tint text-amber-dark',
  [Role.TREASURER]: 'bg-primary-tint text-primary',
  [Role.SECRETARY]: 'bg-fill text-ink-soft',
};

/** Petite étiquette de statut (fond et texte en classes Tailwind). */
export function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[12px] font-semibold ${className}`}>
      {label}
    </span>
  );
}

/** Étiquette de rôle (comme SolidarityParts mobile) : rien pour un simple membre, sauf si `always`. */
export function RoleBadge({ role, label, always = false }: { role: Role; label: string; always?: boolean }) {
  const tone = ROLE_TONE[role] ?? (always ? 'bg-fill text-ink-soft' : undefined);
  if (!tone) return null;
  return <StatusBadge label={label} className={tone} />;
}
