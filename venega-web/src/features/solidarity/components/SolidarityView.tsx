'use client';

import { useState } from 'react';
import { Check, CheckCircle2, Clock, Plus, Vote, X, type LucideIcon } from 'lucide-react';
import { AidRequestStatus, EventType, mockSolidarityRequests, type SolidarityRequest } from '@venega/types';
import { Badge } from '@/components/ui/Badge';
import { HeroBand, HeroTitle, PageBody } from '@/components/ui/HeroBand';
import { btnAmber, btnSmallDanger, btnSmallPrimary, card } from '@/components/ui/classes';
import { Avatar } from '@/components/ui/misc';
import { formatDate, formatFcfa } from '@/lib/format';

const EVENT_LABELS: Record<EventType, string> = {
  [EventType.MALADIE]: 'Maladie',
  [EventType.HOSPITALISATION]: 'Hospitalisation',
  [EventType.MARIAGE]: 'Mariage',
  [EventType.DECES]: 'Décès',
  [EventType.NAISSANCE]: 'Naissance',
  [EventType.AUTRE]: 'Autre',
};

// Démo : solde et objectif de la caisse (en production, calculés à partir du grand livre).
const BALANCE = 120000;
const GOAL = 200000;


export function SolidarityView() {
  const [requests] = useState(mockSolidarityRequests);

  const voting = requests.filter((r) => r.status === AidRequestStatus.VOTING);
  const bureau = requests.filter((r) => r.status === AidRequestStatus.PENDING);
  const done = requests.filter(
    (r) => r.status === AidRequestStatus.APPROVED || r.status === AidRequestStatus.DISBURSED,
  );
  const pct = Math.min(100, Math.round((BALANCE / GOAL) * 100));

  return (
    <>
      <HeroBand>
        <HeroTitle
          title="Caisse de solidarité"
          subtitle="Demandes d'aide et solde du fonds d'entraide"
          right={
            <button type="button" className={btnAmber}>
              <Plus size={18} aria-hidden />
              <span className="hidden sm:inline">Demander une aide</span>
              <span className="sm:hidden">Demander</span>
            </button>
          }
        />
        <div className="mt-5 rounded-[20px] bg-white/10 p-4">
          <p className="text-[13px] text-white/75">Solde disponible</p>
          <p className="text-[30px] font-bold leading-tight text-white">{formatFcfa(BALANCE)}</p>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progression vers l'objectif"
          >
            <div className="h-full rounded-full bg-amber" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[13px] text-white/75">
            Objectif : {formatFcfa(GOAL)} · {pct} %
          </p>
        </div>
      </HeroBand>

      <PageBody>
        <div className="grid gap-6 lg:grid-cols-3">
          <Column title="En vote" icon={Vote} items={voting} vote />
          <Column title="Validation du bureau" icon={Clock} items={bureau} />
          <Column title="Traitées" icon={CheckCircle2} items={done} />
        </div>
      </PageBody>
    </>
  );
}

function Column({
  title,
  icon: Icon,
  items,
  vote = false,
}: {
  title: string;
  icon: LucideIcon;
  items: SolidarityRequest[];
  vote?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-[17px] font-bold text-ink">
        <Icon size={18} className="text-primary" aria-hidden />
        {title}
        <span className="text-[14px] font-semibold text-muted">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className={`${card} p-5 text-center text-[14px] text-muted`}>Aucune demande</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((r) => (
            <li key={r.id} className={`${card} p-4`}>
              <div className="flex items-start gap-3">
                <Avatar name={r.requesterName} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink">{r.requesterName}</p>
                  <p className="text-[13px] text-muted">
                    {EVENT_LABELS[r.eventType] ?? r.eventType} · {formatDate(r.createdAt)}
                  </p>
                </div>
                {r.status === AidRequestStatus.DISBURSED ? (
                  <Badge tone="green">Versée</Badge>
                ) : r.status === AidRequestStatus.APPROVED ? (
                  <Badge tone="green">Approuvée</Badge>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-2 text-[14px] text-ink-soft">{r.reason}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[17px] font-bold text-ink">{formatFcfa(r.amountRequested)}</p>
                {vote && (
                  <div className="flex gap-2">
                    <button type="button" className={btnSmallDanger} aria-label={`Refuser la demande de ${r.requesterName}`}>
                      <X size={16} aria-hidden />
                    </button>
                    <button type="button" className={btnSmallPrimary}>
                      <Check size={16} aria-hidden />
                      Approuver
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
