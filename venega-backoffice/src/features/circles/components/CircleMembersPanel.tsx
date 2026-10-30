'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, BellRing } from 'lucide-react';
import { Badge, Button, Card, CardHeader, EmptyState, FormField, Notice, ReasonDialog, Select, Table, Td, Th, Tr } from '@/components/ui';
import { formatDateTime, formatRelative } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { PhoneLinks } from '@/components/ui/PhoneLinks';
import { useCan } from '@/features/auth/SessionContext';
import { changeTurnOrder, sendReminders } from '../api';
import { roleLabel, type CircleDetail, type CircleMember } from '../types';
import { PaymentStatusBadge } from './CircleBadges';

/** Membres, ordre de passage, retards, rappels ; historique des changements d'ordre. */
export function CircleMembersPanel({ c }: { c: CircleDetail }) {
  const can = useCan();
  const isSolidarity = c.kind === 'SOLIDARITY';
  const [reordering, setReordering] = useState<CircleMember | null>(null);
  const members = [...c.members].sort((a, b) => (a.turnOrder ?? 99) - (b.turnOrder ?? 99) || a.name.localeCompare(b.name));
  const unpaid = c.members.filter((m) => m.status === 'ACTIVE' && m.paymentStatus !== 'PAID');

  const remind = useAdminMutation({
    mutationFn: (userIds?: string[]) => sendReminders(c.id, userIds),
    successTitle: (n) => `Rappel envoyé à ${n} membre(s) par SMS`,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Membres"
          subtitle={`${c.memberCount} membres actifs${isSolidarity ? '' : ' · ordre de passage'}`}
          actions={
            can('circle.remind') && unpaid.length > 0 ? (
              <Button size="sm" variant="secondary" icon={<BellRing size={14} />} loading={remind.isPending} onClick={() => remind.mutate(undefined)}>
                Relancer les {unpaid.length} non payés
              </Button>
            ) : undefined
          }
        />
        <Table>
          <thead>
            <tr>
              {!isSolidarity && <Th>Tour</Th>}
              <Th>Membre</Th>
              <Th>Téléphone</Th>
              <Th>Rôle</Th>
              <Th>Cotisation en cours</Th>
              <Th className="text-right">Retards</Th>
              <Th>Rappels</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <Tr key={m.userId}>
                {!isSolidarity && <Td className="text-sm font-medium">{m.turnOrder}</Td>}
                <Td>
                  <Link href={`/users/${m.userId}`} className="font-medium text-brand hover:underline">
                    {m.name}
                  </Link>
                  {m.status === 'EXCLUDED' && <Badge tone="red" className="ml-1.5">Exclu(e)</Badge>}
                  {m.status === 'LEFT' && <Badge className="ml-1.5">Parti(e)</Badge>}
                </Td>
                <Td>
                  <PhoneLinks phone={m.phoneNumber} compact />
                </Td>
                <Td className="whitespace-nowrap text-sm">{roleLabel(m.role, c.kind)}</Td>
                <Td>
                  <PaymentStatusBadge status={m.paymentStatus} />
                </Td>
                <Td className={`text-right text-sm ${m.lateCount > 0 ? 'font-semibold text-danger' : 'text-ink-muted'}`}>
                  {m.lateCount}
                  {m.paidLateCount > 0 && <span className="block text-xs font-normal text-accent-ink">+{m.paidLateCount} payé(s) en retard</span>}
                </Td>
                <Td className="whitespace-nowrap text-sm text-ink-soft">{m.remindersSent > 0 ? `${m.remindersSent} · ${formatRelative(m.lastReminderAt!)}` : '—'}</Td>
                <Td className="whitespace-nowrap text-right">
                  <span className="inline-flex gap-1.5">
                    {can('circle.remind') && m.status === 'ACTIVE' && m.paymentStatus !== 'PAID' && (
                      <Button size="sm" variant="ghost" icon={<BellRing size={14} />} onClick={() => remind.mutate([m.userId])} title="Envoyer un rappel par SMS">
                        Relancer
                      </Button>
                    )}
                    {can('circle.turnOrder') && !isSolidarity && m.status === 'ACTIVE' && (m.turnOrder ?? 0) > c.currentTurn && c.status !== 'COMPLETED' && (
                      <Button size="sm" variant="ghost" icon={<ArrowUpDown size={14} />} onClick={() => setReordering(m)}>
                        Ordre
                      </Button>
                    )}
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {!isSolidarity && (
        <Card>
          <CardHeader title="Historique de l’ordre de passage" subtitle="« L’ordre de passage a changé » : qui l’a modifié, quand, et pourquoi." />
          {c.orderChanges.length === 0 ? (
            <EmptyState title="Ordre jamais modifié" description="L’ordre est celui fixé au démarrage du cycle." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Modifié par</Th>
                  <Th>Changement</Th>
                  <Th>Motif</Th>
                </tr>
              </thead>
              <tbody>
                {c.orderChanges.map((o) => (
                  <Tr key={o.id}>
                    <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(o.at)}</Td>
                    <Td className="text-sm">
                      {o.by}
                      {o.byAdmin ? <Badge className="ml-1.5">Venega</Badge> : <Badge tone="amber" className="ml-1.5">Fondateur</Badge>}
                    </Td>
                    <Td className="text-sm">
                      <strong>{o.userName}</strong> : tour {o.fromOrder} → {o.toOrder}
                      {o.swappedWithName && <span className="block text-xs text-ink-muted">échangé avec {o.swappedWithName}</span>}
                    </Td>
                    <Td className="max-w-xs text-sm text-ink-soft">{o.reason ?? <span className="text-accent-ink">Aucun motif donné</span>}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
      {reordering && <TurnOrderDialog c={c} member={reordering} onClose={() => setReordering(null)} />}
    </div>
  );
}

function TurnOrderDialog({ c, member, onClose }: { c: CircleDetail; member: CircleMember; onClose: () => void }) {
  const options = Array.from({ length: c.totalTurns }, (_, i) => i + 1).filter((t) => t > c.currentTurn && t !== member.turnOrder);
  const [to, setTo] = useState<number>(options[0] ?? 0);
  const mutation = useAdminMutation({
    mutationFn: (reason: string) => changeTurnOrder(c.id, member.userId, to, reason),
    successTitle: () => `${member.name} passe au tour ${to}`,
    onSuccess: onClose,
  });
  const other = c.members.find((m) => m.turnOrder === to);
  return (
    <ReasonDialog
      open
      onClose={onClose}
      onConfirm={(reason) => mutation.mutate(reason)}
      title="Modifier l’ordre de passage"
      description={
        <div className="space-y-2">
          <p>
            {member.name} reçoit actuellement au tour <strong className="text-ink">{member.turnOrder}</strong>. Seuls les tours à venir peuvent être échangés.
          </p>
          <FormField label="Nouveau tour">
            {(id) => (
              <Select id={id} value={to} onChange={(e) => setTo(Number(e.target.value))}>
                {options.map((t) => (
                  <option key={t} value={t}>
                    Tour {t} — {c.members.find((m) => m.turnOrder === t)?.name ?? 'libre'}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          {other && <Notice tone="amber">{other.name} passera au tour {member.turnOrder}. Les deux membres seront prévenus.</Notice>}
        </div>
      }
      confirmLabel="Modifier l’ordre"
      minLength={10}
      presets={['Rétablir l’ordre initial modifié sans accord', 'Échange demandé par les deux membres']}
      loading={mutation.isPending}
    />
  );
}
