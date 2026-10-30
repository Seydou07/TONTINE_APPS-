/**
 * Notifications (démo, mêmes contenus que NotificationsScreen.tsx mobile).
 *
 * TODO API: `GET /notifications`, `PATCH /notifications/:id/read`
 * (docs/api-mobile.md, section 8). Le modèle `AppNotification` existe dans @venega/types.
 */

export type DemoNotification = {
  id: string;
  type: 'PAYMENT_RECEIVED' | 'REMINDER' | 'MEMBER_JOINED';
  title: string;
  message: string;
  circleName: string;
  /** Libellé relatif fourni tel quel (« Il y a 10 min », « Hier, 18:30 »). */
  time: string;
  read: boolean;
  amount?: number;
  userName?: string;
};

const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: 'n1',
    type: 'PAYMENT_RECEIVED',
    title: 'Cotisation reçue !',
    message: 'Moussa Kaboré a payé sa cotisation de 10 500 F CFA dans "Tontine Commerçants".',
    circleName: 'Tontine Commerçants',
    time: 'Il y a 10 min',
    read: false,
    amount: 10500,
    userName: 'Moussa Kaboré',
  },
  {
    id: 'n2',
    type: 'PAYMENT_RECEIVED',
    title: 'Nouveau versement effectué',
    message: 'Fatou Sanogo a réglé son tour pour la Tontine Famille.',
    circleName: 'Tontine Famille Ouédraogo',
    time: 'Il y a 45 min',
    read: false,
    amount: 25000,
    userName: 'Fatou Sanogo',
  },
  {
    id: 'n3',
    type: 'REMINDER',
    title: 'Rappel de cotisation',
    message: 'Le Tour 3 de "Tontine Commerçants" s\'achève demain. Pensez à cotiser.',
    circleName: 'Tontine Commerçants',
    time: 'Il y a 3 heures',
    read: true,
  },
  {
    id: 'n4',
    type: 'MEMBER_JOINED',
    title: 'Nouveau membre',
    message: 'Ibrahim Traoré a rejoint votre cercle "Caisse Solidarité".',
    circleName: 'Caisse Solidarité Dassasgho',
    time: 'Hier, 18:30',
    read: true,
    userName: 'Ibrahim Traoré',
  },
  {
    id: 'n5',
    type: 'PAYMENT_RECEIVED',
    title: 'Cotisation reçue !',
    message: 'Awa Diallo a effectué son versement de 5 000 F CFA.',
    circleName: 'Tontine Femmes Unies',
    time: 'Hier, 14:15',
    read: true,
    amount: 5000,
    userName: 'Awa Diallo',
  },
];

export function getNotifications(): DemoNotification[] {
  return DEMO_NOTIFICATIONS.map((n) => ({ ...n }));
}
