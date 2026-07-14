"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Coins,
  Vote,
} from "lucide-react";
import {
  mockSolidarityRequests,
} from "@venega/types/mocks";

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat("fr-BF", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function SolidarityPage() {
  const [requests, setRequests] = useState(mockSolidarityRequests);

  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-sora text-text">
              Fonds de solidarité
            </h1>
            <p className="text-text-muted mt-1 font-worksans">
              Gérez les demandes d'aide et le solde du fonds
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-worksans font-semibold shadow-md hover:shadow-lg transition-all">
            <Plus size={20} />
            Demander une aide
          </button>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
              <p className="text-primary-tint font-worksans text-sm mb-2">
                Solde disponible
              </p>
              <p className="text-4xl font-bold font-sora mb-4">
                120 000 F CFA
              </p>
              <div className="flex items-center gap-2 text-sm font-worksans text-primary-tint">
                <Coins size={16} />
                <span>Objectif : 200 000 F CFA</span>
              </div>
              <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Voting */}
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Vote size={20} className="text-info" />
                <h3 className="text-lg font-bold font-sora text-text">
                  En vote ({requests.filter((r) => r.status === "VOTING").length})
                </h3>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {requests
                .filter((r) => r.status === "VOTING")
                .map((request, index) => (
                  <RequestCard key={request.id} request={request} index={index} />
                ))}
            </div>
          </div>

          {/* Column 2: Pending Bureau */}
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-accent" />
                <h3 className="text-lg font-bold font-sora text-text">
                  Validation bureau (0)
                </h3>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-center py-12">
                <p className="text-text-muted font-worksans">
                  Aucune demande en attente
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-success" />
                <h3 className="text-lg font-bold font-sora text-text">
                  Traitées (1)
                </h3>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {requests
                .filter((r) => r.status === "APPROVED")
                .map((request, index) => (
                  <RequestCard key={request.id} request={request} index={index} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({ request, index }: { request: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-bg rounded-xl p-4 border border-border"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold font-worksans text-text">
            {request.requesterName}
          </p>
          <p className="text-sm text-text-muted font-worksans">
            {request.eventType}
          </p>
        </div>
        <button className="text-text-muted hover:text-primary">
          <ArrowRight size={16} />
        </button>
      </div>
      <p className="text-sm text-text-muted font-worksans mb-3 line-clamp-2">
        {request.reason}
      </p>
      <div className="flex items-center justify-between">
        <p className="font-bold font-sora text-primary">
          {formatXOF(request.amountRequested)}
        </p>
        <div className="flex gap-1.5">
          <button className="p-2 bg-success-tint text-success rounded-lg">
            <CheckCircle2 size={16} />
          </button>
          <button className="p-2 bg-danger-tint text-danger rounded-lg">
            <XCircle size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
