'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Dialog, FormField, Notice, Select, TextArea, TextInput } from '@/components/ui';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { createTicket, listTeam } from '../api';
import {
  TICKET_CATEGORY_LABEL,
  TICKET_PRIORITY_LABEL,
  type NewTicket,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
} from '../types';

export interface TicketSubject {
  userId?: string;
  userName?: string;
  circleId?: string;
  circleName?: string;
  fundraiserId?: string;
  fundraiserTitle?: string;
  callerPhone?: string;
  category?: TicketCategory;
}

/** Ouvre un ticket depuis une fiche (utilisateur, cercle, cagnotte) ou depuis la liste des appels. */
export function CreateTicketDialog({
  open,
  onClose,
  subject,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  subject?: TicketSubject;
  onCreated?: (t: Ticket) => void;
}) {
  const [form, setForm] = useState<NewTicket>({ category: 'OTHER', priority: 'NORMAL', description: '' });
  const [touched, setTouched] = useState(false);
  const team = useQuery({ queryKey: ['team'], queryFn: listTeam, enabled: open });

  useEffect(() => {
    if (open) {
      setForm({
        category: subject?.category ?? 'OTHER',
        priority: 'NORMAL',
        description: '',
        userId: subject?.userId,
        circleId: subject?.circleId,
        fundraiserId: subject?.fundraiserId,
        callerPhone: subject?.callerPhone ?? '',
      });
      setTouched(false);
    }
  }, [open, subject]);

  const create = useAdminMutation({
    mutationFn: (v: NewTicket) => createTicket(v),
    successTitle: (t) => `Ticket ${t.number} créé — donnez ce numéro à l’appelant`,
    onSuccess: (t) => {
      onClose();
      onCreated?.(t);
    },
  });

  const tooShort = form.description.trim().length < 10;
  const set = <K extends keyof NewTicket>(k: K, v: NewTicket[K]) => setForm((f) => ({ ...f, [k]: v }));
  const subjectLabel = [subject?.userName, subject?.circleName, subject?.fundraiserTitle].filter(Boolean).join(' · ');

  return (
    <Dialog
      open={open}
      onClose={create.isPending ? () => undefined : onClose}
      title="Nouveau ticket d’appel"
      description={subjectLabel ? `Concerne : ${subjectLabel}` : 'Notez l’appel pour en garder la trace et le suivre.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={create.isPending}>
            Annuler
          </Button>
          <Button
            loading={create.isPending}
            onClick={() => {
              setTouched(true);
              if (!tooShort) create.mutate(form);
            }}
          >
            Créer le ticket
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <FormField label="Motif de l’appel" required>
          {(id) => (
            <Select id={id} value={form.category} onChange={(e) => set('category', e.target.value as TicketCategory)}>
              {(Object.keys(TICKET_CATEGORY_LABEL) as TicketCategory[]).map((c) => (
                <option key={c} value={c}>
                  {TICKET_CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label="Ce que dit l’appelant" required error={touched && tooShort ? '10 caractères minimum.' : null}>
          {(id) => (
            <TextArea
              id={id}
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Ex. : a payé 25 000 F CFA hier à 18 h depuis le numéro de son mari, référence OM…"
            />
          )}
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Priorité">
            {(id) => (
              <Select id={id} value={form.priority} onChange={(e) => set('priority', e.target.value as TicketPriority)}>
                {(['HIGH', 'NORMAL', 'LOW'] as TicketPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {TICKET_PRIORITY_LABEL[p]}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label="Assigné à">
            {(id) => (
              <Select id={id} value={form.assignee ?? ''} onChange={(e) => set('assignee', e.target.value || undefined)}>
                <option value="">Personne</option>
                {team.data?.map((n, i) => (
                  <option key={n} value={n}>
                    {i === 0 ? `${n} (moi)` : n}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
        <FormField label="Numéro de l’appelant" hint="Si l’appel vient d’un autre numéro que celui du compte.">
          {(id) => (
            <TextInput id={id} inputMode="tel" value={form.callerPhone ?? ''} onChange={(e) => set('callerPhone', e.target.value)} placeholder="+226 70 00 00 00" />
          )}
        </FormField>
        {!subject?.userId && !subject?.circleId && !subject?.fundraiserId && (
          <Notice>Astuce : ouvrez d’abord la fiche de l’utilisateur ou du cercle (Ctrl+K) pour relier le ticket automatiquement.</Notice>
        )}
      </div>
    </Dialog>
  );
}
