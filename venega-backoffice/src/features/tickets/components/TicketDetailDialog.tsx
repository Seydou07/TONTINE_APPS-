'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button, Dialog, ErrorState, Field, FormField, LoadingState, PhoneLinks, Select, TextArea } from '@/components/ui';
import { formatDateTime, formatRelative } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { getTicket, listTeam, updateTicket, type TicketPatch } from '../api';
import { TICKET_CATEGORY_LABEL, TICKET_PRIORITY_LABEL, TICKET_STATUS_LABEL, type TicketPriority, type TicketStatus } from '../types';
import { TicketPriorityBadge, TicketStatusBadge } from './TicketBadges';

export function TicketDetailDialog({ ticketId, onClose }: { ticketId: string | null; onClose: () => void }) {
  const query = useQuery({ queryKey: ['tickets', 'detail', ticketId], queryFn: () => getTicket(ticketId!), enabled: !!ticketId });
  const team = useQuery({ queryKey: ['team'], queryFn: listTeam, enabled: !!ticketId });
  const t = query.data;
  const [status, setStatus] = useState<TicketStatus>('OPEN');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('NORMAL');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (t) {
      setStatus(t.status);
      setAssignee(t.assignee ?? '');
      setPriority(t.priority);
      setNote('');
    }
  }, [t]);

  const save = useAdminMutation({
    mutationFn: (p: TicketPatch) => updateTicket(ticketId!, p),
    successTitle: (r) => `Ticket ${r.number} mis à jour`,
    onSuccess: () => setNote(''),
  });

  if (!ticketId) return null;
  const changed = !!t && (status !== t.status || assignee !== (t.assignee ?? '') || priority !== t.priority || note.trim().length > 0);

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={t ? `${t.number} · ${TICKET_CATEGORY_LABEL[t.category]}` : 'Ticket'}
      description={t ? <span className="flex flex-wrap items-center gap-2"><TicketStatusBadge status={t.status} /><TicketPriorityBadge priority={t.priority} /> créé {formatRelative(t.createdAt)} par {t.createdBy}</span> : undefined}
      footer={
        t && (
          <>
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
            <Button
              disabled={!changed}
              loading={save.isPending}
              onClick={() =>
                save.mutate({
                  status: status !== t.status ? status : undefined,
                  assignee: assignee !== (t.assignee ?? '') ? assignee || null : undefined,
                  priority: priority !== t.priority ? priority : undefined,
                  note: note.trim() || undefined,
                })
              }
            >
              Enregistrer
            </Button>
          </>
        )
      }
    >
      {query.isError ? (
        <ErrorState error={query.error} />
      ) : !t ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <p className="whitespace-pre-line rounded-md border border-line bg-canvas px-3 py-2 text-base text-ink">{t.description}</p>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {t.userId && (
              <Field label="Utilisateur">
                <Link href={`/users/${t.userId}`} className="font-medium text-brand hover:underline" onClick={onClose}>
                  {t.userName}
                </Link>
              </Field>
            )}
            {t.circleId && (
              <Field label="Cercle">
                <Link href={`/circles/${t.circleId}`} className="font-medium text-brand hover:underline" onClick={onClose}>
                  {t.circleName}
                </Link>
              </Field>
            )}
            {t.fundraiserId && (
              <Field label="Cagnotte">
                <Link href={`/cagnottes?q=${encodeURIComponent(t.fundraiserTitle ?? '')}`} className="font-medium text-brand hover:underline" onClick={onClose}>
                  {t.fundraiserTitle}
                </Link>
              </Field>
            )}
            {t.callerPhone && (
              <Field label="Rappeler">
                <PhoneLinks phone={t.callerPhone} />
              </Field>
            )}
          </dl>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Statut">
              {(id) => (
                <Select id={id} value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}>
                  {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as TicketStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {TICKET_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Assigné à">
              {(id) => (
                <Select id={id} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  <option value="">Personne</option>
                  {[...new Set([...(team.data ?? []), ...(t.assignee ? [t.assignee] : [])])].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label="Priorité">
              {(id) => (
                <Select id={id} value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
                  {(['HIGH', 'NORMAL', 'LOW'] as TicketPriority[]).map((p) => (
                    <option key={p} value={p}>
                      {TICKET_PRIORITY_LABEL[p]}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>

          <FormField label="Ajouter une note" hint={status === 'RESOLVED' && t.status !== 'RESOLVED' ? 'Expliquez ce qui a été fait pour résoudre.' : undefined}>
            {(id) => <TextArea id={id} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ce qui a été fait, ce qui reste à faire…" />}
          </FormField>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Notes ({t.notes.length})</h3>
            {t.notes.length === 0 ? (
              <p className="text-sm text-ink-muted">Aucune note.</p>
            ) : (
              <ul className="divide-y divide-line rounded-md border border-line">
                {[...t.notes].reverse().map((n) => (
                  <li key={n.id} className="px-3 py-2">
                    <p className="text-base text-ink">{n.text}</p>
                    <p className="text-sm text-ink-muted">
                      {n.author} · {formatDateTime(n.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Dialog>
  );
}
