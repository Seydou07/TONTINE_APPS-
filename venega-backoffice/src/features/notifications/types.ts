export type NotificationChannel = 'PUSH' | 'SMS';
export type NotificationStatus = 'DELIVERED' | 'SENT' | 'FAILED';

export type NotificationType =
  | 'PAYMENT_REMINDER'
  | 'PAYMENT_RECEIVED'
  | 'PAYOUT'
  | 'MEMBERSHIP'
  | 'KYC_DECISION'
  | 'OTP'
  | 'PASSWORD_RESET'
  | 'SECURITY'
  | 'AID';

/** Notification envoyée à un utilisateur (côté API : AppNotification + journal d'envoi push / SMS). */
export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  failureReason?: string;
  circleId?: string;
  sentAt: string;
  /** Envoyée manuellement depuis le back-office */
  byAdmin?: string;
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  PAYMENT_REMINDER: 'Rappel de cotisation',
  PAYMENT_RECEIVED: 'Paiement reçu',
  PAYOUT: 'Cagnotte',
  MEMBERSHIP: 'Cercle',
  KYC_DECISION: 'KYC',
  OTP: 'Code SMS',
  PASSWORD_RESET: 'Mot de passe',
  SECURITY: 'Sécurité',
  AID: 'Solidarité',
};

export const NOTIFICATION_STATUS_LABEL: Record<NotificationStatus, string> = {
  DELIVERED: 'Délivrée',
  SENT: 'Envoyée',
  FAILED: 'Échec',
};
