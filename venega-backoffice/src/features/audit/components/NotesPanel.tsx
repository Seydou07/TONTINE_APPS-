'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, CardHeader, TextArea } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { useCan } from '@/features/auth/SessionContext';
import { addNote, listNotes } from '../api';

/** Notes internes du support (jamais visibles par l'utilisateur). */
export function NotesPanel({ subject }: { subject: { userId?: string; circleId?: string } }) {
  const can = useCan();
  const [text, setText] = useState('');
  const key = subject.userId ?? subject.circleId ?? '';
  const query = useQuery({ queryKey: ['notes', key], queryFn: () => listNotes(subject) });
  const add = useAdminMutation({
    mutationFn: (t: string) => addNote(subject, t),
    successTitle: () => 'Note ajoutée',
    onSuccess: () => setText(''),
  });
  const notes = query.data ?? [];

  return (
    <Card>
      <CardHeader title="Notes du support" subtitle="Internes, jamais visibles par l’utilisateur." />
      {can('note.write') && (
        <div className="space-y-2 border-b border-line p-4">
          <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Ex. : rappelé à 15 h, attend le SMS de confirmation…" aria-label="Nouvelle note" />
          <div className="flex justify-end">
            <Button size="sm" disabled={text.trim().length < 3} loading={add.isPending} onClick={() => add.mutate(text)}>
              Ajouter la note
            </Button>
          </div>
        </div>
      )}
      {notes.length === 0 ? (
        <p className="px-4 py-3 text-sm text-ink-muted">Aucune note.</p>
      ) : (
        <ul className="divide-y divide-line">
          {notes.map((n) => (
            <li key={n.id} className="px-4 py-2.5">
              <p className="text-base text-ink">{n.text}</p>
              <p className="text-xs text-ink-muted">
                {n.author} · {formatDateTime(n.at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
