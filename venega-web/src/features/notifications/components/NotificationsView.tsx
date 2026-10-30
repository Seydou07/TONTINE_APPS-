'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, CheckCheck, CheckCircle2, Clock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Chip, ChipGroup } from '@/components/ui/choice';
import { KeyValue } from '@/components/ui/blocks';
import { Sheet } from '@/components/ui/Sheet';
import { formatFcfa } from '@/lib/format';
import { getNotifications, type DemoNotification } from '../api';

type Filter = 'ALL' | 'PAYMENTS' | 'REMINDERS';

/** Notifications (NotificationsScreen mobile), ouvertes depuis la cloche de l'accueil. */
export function NotificationsView() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<DemoNotification[]>(getNotifications);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [detail, setDetail] = useState<DemoNotification | null>(null);

  // TODO API: `PATCH /notifications/:id/read` (docs/api-mobile.md, section 8).
  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleNotifClick = (notif: DemoNotification) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    if (notif.type === 'PAYMENT_RECEIVED') setDetail(notif);
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'PAYMENTS') return n.type === 'PAYMENT_RECEIVED';
    if (filter === 'REMINDERS') return n.type === 'REMINDER';
    return true;
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Regroupement par jour (d'après les libellés relatifs des notifications).
  const dayOf = (time: string) => (time.startsWith('Hier') ? 'Hier' : "Aujourd'hui");
  const groups: { day: string; items: DemoNotification[] }[] = [];
  filteredNotifs.forEach((n) => {
    const day = dayOf(n.time);
    const g = groups.find((x) => x.day === day);
    if (g) g.items.push(n);
    else groups.push({ day, items: [n] });
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex h-14 max-w-2xl items-center justify-between px-2 sm:px-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-fill"
        >
          <ArrowLeft size={22} aria-hidden />
        </button>
        <button
          type="button"
          onClick={markAllAsRead}
          aria-label="Tout marquer comme lu"
          title="Tout marquer comme lu"
          className={`flex h-10 w-10 items-center justify-center rounded-full hover:bg-fill ${
            unreadCount > 0 ? 'text-primary' : 'text-subtle'
          }`}
        >
          <CheckCheck size={22} aria-hidden />
        </button>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-8 sm:px-6">
        <h1 className="text-[28px] font-bold text-ink">Notifications</h1>
        <p className="mt-1 text-[15px] text-muted">
          {unreadCount > 0
            ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
            : 'Toutes vos notifications sont lues'}
        </p>

        <div className="mt-4">
          <ChipGroup label="Filtrer les notifications">
            <Chip label={`Toutes (${notifications.length})`} selected={filter === 'ALL'} onClick={() => setFilter('ALL')} />
            <Chip label="Paiements" selected={filter === 'PAYMENTS'} onClick={() => setFilter('PAYMENTS')} />
            <Chip label="Rappels" selected={filter === 'REMINDERS'} onClick={() => setFilter('REMINDERS')} />
          </ChipGroup>
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fill text-subtle">
              <Bell size={24} strokeWidth={1.6} aria-hidden />
            </span>
            <p className="mt-3 text-[17px] font-bold text-ink">Aucune notification</p>
            <p className="mt-1 text-[14px] text-muted">Les paiements et rappels de vos cercles apparaîtront ici.</p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.day} className="mt-5">
              <h2 className="mb-2 px-1 text-[13px] font-semibold text-muted">{group.day}</h2>
              <ul className="overflow-hidden rounded-[20px] border border-line bg-white">
                {group.items.map((notif, i) => {
                  const isPayment = notif.type === 'PAYMENT_RECEIVED';
                  const isReminder = notif.type === 'REMINDER';
                  const Icon = isPayment ? CheckCircle2 : isReminder ? Clock : UserPlus;
                  const tone = isPayment
                    ? 'bg-primary-tint text-primary'
                    : isReminder
                    ? 'bg-amber-tint text-amber-dark'
                    : 'bg-fill text-ink-soft';
                  return (
                    <li key={notif.id}>
                      <button
                        type="button"
                        onClick={() => handleNotifClick(notif)}
                        className="flex w-full items-start gap-3 pl-3.5 text-left hover:bg-fill"
                      >
                        <span aria-hidden className={`mt-3.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                          <Icon size={18} strokeWidth={2} />
                        </span>
                        <span
                          className={`flex min-w-0 flex-1 items-start gap-2.5 py-3.5 pr-3.5 ${
                            i < group.items.length - 1 ? 'border-b border-line' : ''
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-2">
                              <span className={`truncate text-[15px] text-ink ${notif.read ? 'font-medium' : 'font-bold'}`}>
                                {notif.title}
                              </span>
                              <span className="shrink-0 text-[12px] text-subtle">{notif.time}</span>
                            </span>
                            <span className="mt-0.5 block text-[14px] text-muted">{notif.message}</span>
                          </span>
                          {!notif.read && (
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary">
                              <span className="sr-only">Non lue</span>
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>

      <Sheet open={!!detail} onClose={() => setDetail(null)} title="Détail du paiement">
        {detail && (
          <>
            <dl className="rounded-[20px] border border-line px-4">
              <KeyValue label="Membre" value={detail.userName ?? '—'} />
              <KeyValue label="Cercle" value={detail.circleName} />
              <KeyValue label="Montant" value={detail.amount ? formatFcfa(detail.amount) : 'Paiement effectué'} />
              <KeyValue label="Statut" value="Validé et encaissé sur votre compte Venega." last />
            </dl>
            <Button variant="secondary" onClick={() => setDetail(null)} className="mt-5">
              Fermer
            </Button>
          </>
        )}
      </Sheet>
    </div>
  );
}
