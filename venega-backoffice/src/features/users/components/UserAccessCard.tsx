'use client';

import React, { useState } from 'react';
import { Ban, KeyRound, LogOut, MessageSquare, RotateCcw, Smartphone, Unlock } from 'lucide-react';
import { Badge, Button, Card, CardHeader, Notice, ReasonDialog } from '@/components/ui';
import { formatDateTime, formatPhone, formatRelative } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { useCan } from '@/features/auth/SessionContext';
import { logoutAllSessions, reactivateUser, resendOtp, sendPasswordReset, suspendUser, unlockUser } from '../api';
import { SUSPEND_PRESETS, type AdminUser } from '../types';
import { ChangePhoneDialog } from './ChangePhoneDialog';

type Pending = 'unlock' | 'reset' | 'logout' | 'suspend' | 'reactivate' | null;

function Row({ label, children, tone }: { label: string; children: React.ReactNode; tone?: 'red' | 'amber' }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className={`text-right text-sm font-medium ${tone === 'red' ? 'text-danger' : tone === 'amber' ? 'text-accent-ink' : 'text-ink'}`}>{children}</dd>
    </div>
  );
}

/**
 * « Je n'arrive pas à me connecter », « je ne reçois pas le code », « j'ai perdu ma SIM »,
 * « mon compte est suspendu » : l'état du compte et les actions correspondantes.
 */
export function UserAccessCard({ user, sessionCount }: { user: AdminUser; sessionCount: number }) {
  const can = useCan();
  const [pending, setPending] = useState<Pending>(null);
  const [changingPhone, setChangingPhone] = useState(false);
  const s = user.security;
  const locked = !!s.lockedUntil && new Date(s.lockedUntil).getTime() > Date.now();

  const otp = useAdminMutation({ mutationFn: () => resendOtp(user.id), successTitle: () => `Code SMS renvoyé au ${formatPhone(user.phoneNumber)}` });
  const act = useAdminMutation({
    mutationFn: async ({ kind, reason }: { kind: Exclude<Pending, null>; reason: string }) => {
      if (kind === 'unlock') return unlockUser(user.id, reason);
      if (kind === 'reset') return sendPasswordReset(user.id, reason);
      if (kind === 'logout') return logoutAllSessions(user.id, reason);
      if (kind === 'suspend') return suspendUser(user.id, reason);
      return reactivateUser(user.id, reason);
    },
    successTitle: (_r, v) =>
      ({
        unlock: 'Compte déverrouillé',
        reset: 'Code de réinitialisation envoyé par SMS',
        logout: 'Toutes les sessions sont déconnectées',
        suspend: 'Compte suspendu',
        reactivate: 'Compte réactivé',
      })[v.kind],
    onSuccess: () => setPending(null),
  });

  const DIALOG: Record<Exclude<Pending, null>, { title: string; description: string; confirm: string; tone: 'primary' | 'danger'; presets?: readonly string[] }> = {
    unlock: { title: 'Déverrouiller le compte', description: 'Remet à zéro le compteur d’échecs. Vérifiez d’abord l’identité de l’appelant.', confirm: 'Déverrouiller', tone: 'primary', presets: ['Identité vérifiée au téléphone', 'Mot de passe oublié, réinitialisation envoyée'] },
    reset: { title: 'Réinitialiser le mot de passe', description: `Un code à usage unique sera envoyé par SMS au ${formatPhone(user.phoneNumber)}. L’utilisateur choisira lui-même son nouveau mot de passe dans l’application. Vous ne voyez et ne saisissez jamais de mot de passe.`, confirm: 'Envoyer le code', tone: 'primary', presets: ['Mot de passe oublié, identité vérifiée au téléphone'] },
    logout: { title: 'Déconnecter toutes les sessions', description: 'L’utilisateur devra se reconnecter sur tous ses appareils. À faire en cas de téléphone perdu ou volé.', confirm: 'Déconnecter partout', tone: 'danger', presets: ['Téléphone perdu ou volé', 'Session inconnue détectée'] },
    suspend: { title: 'Suspendre le compte', description: `${user.displayName} ne pourra plus se connecter, cotiser ni retirer de fonds. Ses sessions seront fermées.`, confirm: 'Suspendre', tone: 'danger', presets: SUSPEND_PRESETS },
    reactivate: { title: 'Réactiver le compte', description: `Motif de la suspension : ${user.suspensionReason ?? 'non précisé'}.`, confirm: 'Réactiver', tone: 'primary', presets: ['Vérification terminée, aucune fraude', 'Justificatifs reçus et validés'] },
  };

  return (
    <Card>
      <CardHeader title="Accès et sécurité" subtitle="Connexion, code SMS, sessions" />
      <div className="px-4">
        {user.accountStatus === 'SUSPENDED' && (
          <Notice tone="red" className="mt-3">
            Compte suspendu{user.suspensionReason ? ` : ${user.suspensionReason}` : ''}.
          </Notice>
        )}
        <dl className="divide-y divide-line">
          <Row label="Téléphone vérifié" tone={s.phoneVerified ? undefined : 'red'}>
            {s.phoneVerified ? 'Oui' : 'Non — code SMS jamais validé'}
          </Row>
          <Row label="Dernier code SMS" tone={s.lastOtpDelivery === 'FAILED' ? 'red' : undefined}>
            {s.lastOtpSentAt ? (
              <>
                {formatRelative(s.lastOtpSentAt)} ·{' '}
                {s.lastOtpDelivery === 'FAILED' ? 'non délivré' : s.lastOtpDelivery === 'PENDING' ? 'en cours d’envoi' : 'délivré'}
                {s.lastOtpError && <span className="block text-xs font-normal">{s.lastOtpError}</span>}
              </>
            ) : (
              '—'
            )}
          </Row>
          <Row label="Codes envoyés (24 h)" tone={s.otpSentLast24h >= 5 ? 'red' : s.otpSentLast24h >= 3 ? 'amber' : undefined}>
            {s.otpSentLast24h} / 5
          </Row>
          <Row label="Échecs de mot de passe" tone={locked ? 'red' : s.failedLoginAttempts > 0 ? 'amber' : undefined}>
            {s.failedLoginAttempts} / 5{locked && s.lockedUntil ? ` · verrouillé jusqu’à ${formatDateTime(s.lockedUntil)}` : ''}
          </Row>
          {s.passwordResetSentAt && <Row label="Code de réinitialisation">envoyé {formatRelative(s.passwordResetSentAt)}</Row>}
          <Row label="Notifications push" tone={s.pushTokenRegistered ? undefined : 'amber'}>
            {s.pushTokenRegistered ? 'Appareil enregistré' : 'Aucun appareil enregistré'}
          </Row>
          <Row label="Sessions actives">{sessionCount}</Row>
        </dl>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line p-4">
        {can('user.security') && (
          <>
            <Button size="sm" variant="secondary" icon={<MessageSquare size={14} />} onClick={() => otp.mutate(undefined)} loading={otp.isPending}>
              Renvoyer le code SMS
            </Button>
            {(locked || s.failedLoginAttempts > 0) && (
              <Button size="sm" variant="secondary" icon={<Unlock size={14} />} onClick={() => setPending('unlock')}>
                Débloquer
              </Button>
            )}
            <Button size="sm" variant="secondary" icon={<KeyRound size={14} />} onClick={() => setPending('reset')}>
              Réinitialiser le mot de passe
            </Button>
            <Button size="sm" variant="secondary" icon={<LogOut size={14} />} onClick={() => setPending('logout')} disabled={sessionCount === 0}>
              Déconnecter partout
            </Button>
          </>
        )}
        {can('user.changePhone') && (
          <Button size="sm" variant="secondary" icon={<Smartphone size={14} />} onClick={() => setChangingPhone(true)}>
            Changer de numéro
          </Button>
        )}
        {can('user.suspend') &&
          (user.accountStatus === 'ACTIVE' ? (
            <Button size="sm" variant="dangerOutline" icon={<Ban size={14} />} onClick={() => setPending('suspend')}>
              Suspendre
            </Button>
          ) : (
            <Button size="sm" icon={<RotateCcw size={14} />} onClick={() => setPending('reactivate')}>
              Réactiver
            </Button>
          ))}
        {!can('user.security') && !can('user.suspend') && <Badge>Lecture seule pour votre rôle</Badge>}
      </div>

      {pending && (
        <ReasonDialog
          open
          onClose={() => setPending(null)}
          onConfirm={(reason) => act.mutate({ kind: pending, reason })}
          title={DIALOG[pending].title}
          description={DIALOG[pending].description}
          confirmLabel={DIALOG[pending].confirm}
          tone={DIALOG[pending].tone}
          presets={DIALOG[pending].presets}
          loading={act.isPending}
        />
      )}
      <ChangePhoneDialog user={user} open={changingPhone} onClose={() => setChangingPhone(false)} />
    </Card>
  );
}
