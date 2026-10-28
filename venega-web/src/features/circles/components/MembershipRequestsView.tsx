'use client';

import { useState } from 'react';
import { Check, ChevronDown, Clock, FileImage, UserRound, X } from 'lucide-react';
import { mockCircles, mockMembershipRequests, MembershipRequestStatus } from '@venega/types';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { btnSmallDanger, btnSmallPrimary, card } from '@/components/ui/classes';
import { Avatar, EmptyState, SummaryRow } from '@/components/ui/misc';
import { formatDate, formatFcfa, formatPhone } from '@/lib/format';

/** Demandes d'adhésion d'un cercle (président). */
export function MembershipRequestsView({ circleId }: { circleId: string }) {
  const [requests, setRequests] = useState(mockMembershipRequests);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const circle = mockCircles.find((c) => c.id === circleId);

  const decide = (id: string, status: MembershipRequestStatus, rejectionReason?: string) =>
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, decidedAt: new Date().toISOString(), rejectionReason } : r)),
    );

  const pending = requests.filter((r) => r.status === MembershipRequestStatus.PENDING);
  const processed = requests.filter((r) => r.status !== MembershipRequestStatus.PENDING);

  return (
    <>
      <PageHeader
        title="Demandes d'adhésion"
        subtitle={`${pending.length} en attente · ${circle?.name ?? ''}`}
        backHref={`/circles/${circleId}`}
      />

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-5 sm:px-6">
        {pending.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-[17px] font-bold text-ink">
              <Clock size={18} className="text-amber-dark" aria-hidden />
              En attente
            </h2>
            <ul className="space-y-2.5">
              {pending.map((req) => {
                const open = expandedId === req.id;
                return (
                  <li key={req.id} className={`${card} overflow-hidden`}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setExpandedId(open ? null : req.id)}
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-fill"
                    >
                      <Avatar name={req.fullName} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-ink">{req.fullName}</p>
                        <p className="text-[13px] text-muted">
                          {formatPhone(req.phoneNumber)} · {formatDate(req.createdAt)}
                        </p>
                      </div>
                      <span className="shrink-0 text-right">
                        <span className="block text-[14px] font-bold text-primary-dark">
                          {formatFcfa(req.joiningFee + req.depositAmount)}
                        </span>
                        <span className="block text-[12px] text-muted">à l&apos;entrée</span>
                      </span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-subtle transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>

                    {open && (
                      <div className="space-y-4 border-t border-line p-4">
                        <dl className="divide-y divide-line">
                          <SummaryRow label="Téléphone">{formatPhone(req.phoneNumber)}</SummaryRow>
                          <SummaryRow label="Mobile Money">{formatPhone(req.depositNumber)}</SummaryRow>
                          <SummaryRow label="Frais de rachat">{formatFcfa(req.joiningFee)}</SummaryRow>
                          {circle?.depositRequired && (
                            <SummaryRow label="Dépôt de garantie">{formatFcfa(req.depositAmount)}</SummaryRow>
                          )}
                          <SummaryRow label="Total">
                            <span className="text-primary-dark">{formatFcfa(req.joiningFee + req.depositAmount)}</span>
                          </SummaryRow>
                        </dl>

                        <div>
                          <p className="mb-2 text-[13px] font-semibold text-ink">Pièce d&apos;identité</p>
                          <div className="flex gap-2">
                            {[
                              { href: req.cnibFrontUrl, label: 'CNIB recto' },
                              { href: req.cnibBackUrl, label: 'CNIB verso' },
                            ].map((doc) => (
                              <a
                                key={doc.label}
                                href={doc.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-line px-3 text-[13px] font-semibold text-ink hover:bg-fill"
                              >
                                <FileImage size={15} aria-hidden />
                                {doc.label}
                              </a>
                            ))}
                          </div>
                        </div>

                        <p className="flex items-center gap-2 text-[14px] font-medium text-primary-dark">
                          <Check size={16} aria-hidden />
                          Conditions acceptées par le candidat
                        </p>

                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              decide(req.id, MembershipRequestStatus.REJECTED, 'Non conforme aux conditions du cercle')
                            }
                            className={btnSmallDanger}
                          >
                            <X size={16} aria-hidden />
                            Refuser
                          </button>
                          <button
                            type="button"
                            onClick={() => decide(req.id, MembershipRequestStatus.APPROVED)}
                            className={btnSmallPrimary}
                          >
                            <Check size={16} aria-hidden />
                            Accepter
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {processed.length > 0 && (
          <section>
            <h2 className="mb-3 text-[17px] font-bold text-ink">Traitées</h2>
            <ul className={`${card} divide-y divide-line`}>
              {processed.map((req) => (
                <li key={req.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={req.fullName} tone="neutral" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">{req.fullName}</p>
                      <p className="text-[13px] text-muted">{formatPhone(req.phoneNumber)}</p>
                    </div>
                    <Badge tone={req.status === MembershipRequestStatus.APPROVED ? 'green' : 'danger'}>
                      {req.status === MembershipRequestStatus.APPROVED ? 'Acceptée' : 'Refusée'}
                    </Badge>
                  </div>
                  {req.rejectionReason && (
                    <p className="mt-2 rounded-[10px] bg-fill p-2.5 text-[13px] text-muted">{req.rejectionReason}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {requests.length === 0 && (
          <EmptyState icon={UserRound} title="Aucune demande" text="Aucune demande d'adhésion pour ce cercle." />
        )}
      </div>
    </>
  );
}
