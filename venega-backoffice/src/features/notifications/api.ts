/**
 * Historique des notifications envoyées à un utilisateur (push et SMS), pour répondre à
 * « je ne reçois pas les notifications ». Données mock locales.
 */
import { db, clone, latency } from '@/mocks/db';
import { paginate, type Paginated } from '@/lib/list';
import type { NotificationStatus, UserNotification } from './types';

// TODO API: GET /api/v1/admin/users/:id/notifications?status=&page=&pageSize=  (journal d'envoi Expo Push + agrégateur SMS)
export async function listUserNotifications(
  userId: string,
  params: { status?: NotificationStatus | 'ALL'; page?: number; pageSize?: number },
): Promise<Paginated<UserNotification>> {
  await latency();
  const items = db.notifications
    .filter((n) => n.userId === userId)
    .filter((n) => !params.status || params.status === 'ALL' || n.status === params.status)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  return clone(paginate(items, params.page, params.pageSize));
}
