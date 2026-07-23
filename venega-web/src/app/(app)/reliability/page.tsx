'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Check,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Ban,
} from 'lucide-react';
import {
  mockUsers,
  mockCircles,
  mockMemberships,
  mockReliabilityEvents,
} from '@venega/types';
import { ReliabilityEventType } from '@venega/types/enums';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);
};

export default function ReliabilityPage() {
  const currentUser = mockUsers.find((u) => u.id === 'u1');
  const userMemberships = mockMemberships.filter((m) => m.userId === 'u1');
  const userEvents = mockReliabilityEvents.filter((e) => e.userId === 'u1');
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);

  if (!currentUser) return null;

  // Calculate aggregate stats
  const totalEvents = userEvents.length;
  const lateEvents = userEvents.filter((e) => e.type === ReliabilityEventType.LATE).length;
  const missedEvents = userEvents.filter((e) => e.type === ReliabilityEventType.MISSED).length;
  const onTimeEvents = userEvents.filter((e) => e.type === ReliabilityEventType.ON_TIME).length;
  const avgScore = userMemberships.length > 0
    ? Math.round(userMemberships.reduce((sum, m) => sum + (m.reliabilityScore || 0), 0) / userMemberships.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-main flex items-center gap-2">
          <Shield size={24} className="text-primary" />
          Score de fiabilité
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Votre historique de paiements et votre score dans chaque cercle
        </p>
      </div>

      {/* Global Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center gap-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-heading font-bold ${
            avgScore >= 80 ? 'bg-success/10 text-success'
            : avgScore >= 50 ? 'bg-warning/10 text-warning'
            : 'bg-danger/10 text-danger'
          }`}>
            {avgScore}
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-semibold text-lg text-text-main">Score global</h2>
            <p className="text-sm text-text-muted mt-0.5">Moyenne de fiabilité dans tous vos cercles</p>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-text-muted">{onTimeEvents} à temps</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-text-muted">{lateEvents} retard{lateEvents > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-text-muted">{missedEvents} manqué{missedEvents > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score explanation */}
        <div className="mt-4 bg-bg rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-medium text-text-main">Comment fonctionne le score ?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-success shrink-0" />
              <span className="text-text-muted">Paiement à temps = <strong className="text-success">+1 point</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-warning shrink-0" />
              <span className="text-text-muted">Retard = <strong className="text-warning">-1 point</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-danger shrink-0" />
              <span className="text-text-muted">Manqué = <strong className="text-danger">-3 points</strong></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Score per circle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-heading font-semibold text-lg text-text-main mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          Score par cercle
        </h2>

        <div className="space-y-3">
          {userMemberships.map((membership) => {
            const circle = mockCircles.find((c) => c.id === membership.circleId);
            const circleEvents = userEvents.filter((e) => e.circleId === membership.circleId);
            const isExpanded = expandedCircle === membership.circleId;

            if (!circle) return null;

            return (
              <div key={membership.circleId} className="bg-surface rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedCircle(isExpanded ? null : membership.circleId)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-bg/50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-heading font-bold ${
                    membership.reliabilityScore >= 80 ? 'bg-success/10 text-success'
                    : membership.reliabilityScore >= 50 ? 'bg-warning/10 text-warning'
                    : 'bg-danger/10 text-danger'
                  }`}>
                    {membership.reliabilityScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-main truncate">{circle.name}</h3>
                    <p className="text-sm text-text-muted">
                      {circleEvents.length} événement{circleEvents.length > 1 ? 's' : ''} — Tour {membership.turnOrder || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      membership.reliabilityScore >= 80 ? 'bg-success/10 text-success'
                      : membership.reliabilityScore >= 50 ? 'bg-warning/10 text-warning'
                      : 'bg-danger/10 text-danger'
                    }`}>
                      {membership.reliabilityScore >= 80 ? 'Bon' : membership.reliabilityScore >= 50 ? 'Moyen' : 'Critique'}
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded events */}
                {isExpanded && circleEvents.length > 0 && (
                  <div className="border-t border-border divide-y divide-border">
                    {circleEvents.map((event) => (
                      <div key={event.id} className="px-4 py-3 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          event.type === ReliabilityEventType.ON_TIME ? 'bg-success'
                          : event.type === ReliabilityEventType.LATE ? 'bg-warning'
                          : event.type === ReliabilityEventType.MISSED ? 'bg-danger'
                          : 'bg-text-muted'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-main">{event.description}</p>
                          <p className="text-xs text-text-muted">{new Date(event.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`text-xs font-semibold ${
                          event.scoreImpact > 0 ? 'text-success' : event.scoreImpact < 0 ? 'text-danger' : 'text-text-muted'
                        }`}>
                          {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && circleEvents.length === 0 && (
                  <div className="border-t border-border p-4 text-center">
                    <p className="text-sm text-text-muted">Aucun événement de fiabilité dans ce cercle</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Warnings */}
      {userMemberships.some((m) => m.reliabilityScore < 50) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-danger/5 rounded-2xl border border-danger/20 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Ban size={20} className="text-danger" />
            <h2 className="font-heading font-semibold text-lg text-danger">Avertissement</h2>
          </div>
          <p className="text-sm text-text-muted">
            Votre score de fiabilité est bas dans certains cercles. Un score inférieur à 0 bloque la réception de la cagnotte.
            Après <strong>{3}</strong> retards, le président peut vous exclure du cercle, ce qui vous bloquera dans tous les cercles de la plateforme.
          </p>
          <p className="text-sm text-text-muted">
            <strong>Important :</strong> En cas d'exclusion, vos cotisations passées ne sont pas remboursées et vous pourriez faire l'objet d'une procédure judiciaire pour impayés.
          </p>
        </motion.div>
      )}

      {/* Empty state */}
      {userMemberships.length === 0 && (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-text-muted" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-text-main">Aucun cercle</h3>
          <p className="text-text-muted text-sm mt-1">Rejoignez un cercle pour commencer à construire votre score de fiabilité.</p>
          <Link href="/circles" className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
            Explorer les cercles
          </Link>
        </div>
      )}
    </div>
  );
}
