import { Bell, CircleDollarSign, HandHeart, UserPlus, AlertTriangle } from 'lucide-react';
import { mockNotifications } from '@venega/types';
import { card } from '@/components/ui/classes';
import { IconTile } from '@/components/ui/misc';
import { formatDateTime } from '@/lib/format';

const ICONS = {
  PAYMENT_RECEIVED: { icon: CircleDollarSign, tone: 'green' },
  PAYMENT_REMINDER: { icon: Bell, tone: 'amber' },
  AID_REQUEST: { icon: HandHeart, tone: 'amber' },
  MEMBERSHIP_REQUEST: { icon: UserPlus, tone: 'green' },
  EXCLUSION_WARNING: { icon: AlertTriangle, tone: 'danger' },
} as const;

/** Notifications de l'utilisateur connecté (démo : u1). */
export default function NotificationsList({ limit = 4 }: { limit?: number }) {
  const items = mockNotifications.filter((n) => n.userId === 'u1').slice(0, limit);

  return (
    <ul className={`${card} divide-y divide-line`}>
      {items.map((n) => {
        const meta = ICONS[n.type as keyof typeof ICONS] ?? { icon: Bell, tone: 'neutral' as const };
        return (
          <li key={n.id} className="flex items-start gap-3 p-4">
            <IconTile icon={meta.icon} tone={meta.tone} size={38} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink">{n.title}</p>
              <p className="mt-0.5 text-[14px] text-muted">{n.body}</p>
              <p className="mt-1 text-[12px] text-subtle">{formatDateTime(n.createdAt)}</p>
            </div>
            {!n.read && <span aria-label="Non lue" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber" />}
          </li>
        );
      })}
    </ul>
  );
}
