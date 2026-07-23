'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  X,
  User,
  FileText,
  Clock,
  CreditCard,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { mockMembershipRequests, mockCircles, mockUsers } from '@venega/types';
import { MembershipRequestStatus } from '@venega/types/enums';
import { useParams } from 'next/navigation';

export default function RequestsPage() {
  const params = useParams();
  const circleId = params.id as string;
  const [requests, setRequests] = useState(mockMembershipRequests);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const circle = mockCircles.find((c) => c.id === circleId);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: MembershipRequestStatus.APPROVED, decidedAt: new Date().toISOString() } : r
      )
    );
  };

  const handleReject = (id: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: MembershipRequestStatus.REJECTED, decidedAt: new Date().toISOString(), rejectionReason: reason } : r
      )
    );
  };

  const pending = requests.filter((r) => r.status === MembershipRequestStatus.PENDING);
  const processed = requests.filter((r) => r.status !== MembershipRequestStatus.PENDING);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/circles/${circleId}`} className="p-2 hover:bg-bg rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-main">Demandes d'adhésion</h1>
          <p className="text-text-muted text-sm">
            {pending.length} demande{pending.length > 1 ? 's' : ''} en attente — {circle?.name}
          </p>
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-lg text-text-main flex items-center gap-2">
            <Clock size={18} className="text-warning" />
            En attente
          </h2>
          {pending.map((req) => (
            <div key={req.id} className="bg-surface rounded-2xl border border-border overflow-hidden">
              {/* Summary row */}
              <button
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-bg/50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-tint rounded-full flex items-center justify-center text-primary font-semibold">
                  {req.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-main truncate">{req.fullName}</h3>
                  <p className="text-sm text-text-muted">{req.phoneNumber}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-primary">
                    {req.joiningFee.toLocaleString()} XOF
                  </div>
                  <div className="text-xs text-text-muted">frais de rachat</div>
                </div>
                {expandedId === req.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {/* Expanded detail */}
              {expandedId === req.id && (
                <div className="border-t border-border p-4 space-y-4 bg-bg/30">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted">Nom complet</span>
                      <p className="font-medium text-text-main">{req.fullName}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Téléphone</span>
                      <p className="font-medium text-text-main">{req.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Dépôt Mobile Money</span>
                      <p className="font-medium text-text-main">{req.depositNumber}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">CNIB</span>
                      <div className="flex gap-2 mt-1">
                        <a
                          href={req.cnibFrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-bg border border-border rounded-lg text-xs hover:border-primary/30 transition-colors"
                        >
                          Recto
                        </a>
                        <a
                          href={req.cnibBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-bg border border-border rounded-lg text-xs hover:border-primary/30 transition-colors"
                        >
                          Verso
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-surface rounded-xl p-4 border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Frais de rachat (tours passés)</span>
                      <span className="font-medium">{req.joiningFee.toLocaleString()} XOF</span>
                    </div>
                    {circle?.depositRequired && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Dépôt de garantie</span>
                        <span className="font-medium">{req.depositAmount.toLocaleString()} XOF</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-medium text-text-main">Total à payer</span>
                      <span className="font-bold text-primary">
                        {(req.joiningFee + req.depositAmount).toLocaleString()} XOF
                      </span>
                    </div>
                  </div>

                  {/* Conditions accepted */}
                  <div className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-success" />
                    <span className="text-success font-medium">Conditions acceptées par le candidat</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(req.id, 'Non conforme aux conditions du cercle')}
                      className="flex-1 py-3 border border-danger/30 text-danger rounded-xl font-medium hover:bg-danger/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Rejeter
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 py-3 bg-success text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Approuver
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-lg text-text-main">Traitées</h2>
          {processed.map((req) => (
            <div key={req.id} className="bg-surface rounded-2xl border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-bg rounded-full flex items-center justify-center text-text-muted font-semibold">
                  {req.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-main truncate">{req.fullName}</h3>
                  <p className="text-sm text-text-muted">{req.phoneNumber}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  req.status === MembershipRequestStatus.APPROVED
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                }`}>
                  {req.status === MembershipRequestStatus.APPROVED ? 'Approuvée' : 'Rejetée'}
                </div>
              </div>
              {req.rejectionReason && (
                <p className="mt-2 text-xs text-text-muted bg-bg rounded-lg p-2">{req.rejectionReason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {pending.length === 0 && processed.length === 0 && (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-text-muted" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-text-main">Aucune demande</h3>
          <p className="text-text-muted text-sm mt-1">Aucune demande d'adhésion en cours pour ce cercle.</p>
        </div>
      )}
    </div>
  );
}
