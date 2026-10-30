'use client';

import React from 'react';
import { Table, Td, Th, Tr } from '@/components/ui';
import { formatPhone, formatRelative } from '@/lib/format';
import { TICKET_CATEGORY_LABEL, type Ticket } from '../types';
import { TicketPriorityBadge, TicketStatusBadge } from './TicketBadges';

export function TicketsTable({ items, onOpen, compact }: { items: Ticket[]; onOpen: (id: string) => void; compact?: boolean }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Ticket</Th>
          <Th>Motif</Th>
          {!compact && <Th>Concerne</Th>}
          <Th>Priorité</Th>
          <Th>Statut</Th>
          <Th>Assigné à</Th>
          <Th>Mis à jour</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((t) => (
          <Tr key={t.id} onClick={() => onOpen(t.id)}>
            <Td className="whitespace-nowrap font-mono text-sm">{t.number}</Td>
            <Td className="max-w-[320px]">
              <p className="truncate font-medium">{TICKET_CATEGORY_LABEL[t.category]}</p>
              <p className="truncate text-sm text-ink-muted">{t.description}</p>
            </Td>
            {!compact && (
              <Td className="max-w-[240px] text-sm">
                <p className="truncate">{t.userName ?? '—'}</p>
                <p className="truncate text-xs text-ink-muted">{t.circleName ?? t.fundraiserTitle ?? (t.callerPhone ? formatPhone(t.callerPhone) : '')}</p>
              </Td>
            )}
            <Td>
              <TicketPriorityBadge priority={t.priority} />
            </Td>
            <Td>
              <TicketStatusBadge status={t.status} />
            </Td>
            <Td className="whitespace-nowrap text-sm">{t.assignee ?? <span className="text-accent-ink">Non assigné</span>}</Td>
            <Td className="whitespace-nowrap text-sm text-ink-soft">{formatRelative(t.updatedAt)}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
