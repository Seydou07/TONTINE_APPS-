"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
} from "lucide-react";
import {
  mockTransactions,
} from "../../../packages/types/src/mock-data";
import { TransactionType } from "../../../packages/types/src";

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat("fr-BF", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ActivityPage() {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-sora text-text">
              Activité
            </h1>
            <p className="text-text-muted mt-1 font-worksans">
              Historique complet des transactions
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg text-text font-worksans font-medium">
            <Filter size={18} />
            Filtrer
          </button>
        </div>

        {/* Transactions List */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold font-worksans text-text-muted">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold font-worksans text-text-muted">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold font-worksans text-text-muted">
                    Description
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold font-worksans text-text-muted">
                    Montant
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold font-worksans text-text-muted">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockTransactions.map((tx, index) => (
                  <TransactionRow key={tx.id} tx={tx} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ tx, index }: { tx: any; index: number }) {
  const isCredit =
    tx.type === TransactionType.TONTINE_CONTRIBUTION ||
    tx.type === TransactionType.SOLIDARITY_CONTRIBUTION;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="hover:bg-bg/50 transition-colors"
    >
      <td className="px-6 py-4 text-sm font-worksans text-text">
        {formatDate(tx.createdAt)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              isCredit ? "bg-success-tint" : "bg-primary-tint"
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft
                size={18}
                className={isCredit ? "text-success" : "text-primary"}
              />
            ) : (
              <ArrowUpRight
                size={18}
                className={isCredit ? "text-success" : "text-primary"}
              />
            )}
          </div>
          <span className="text-sm font-worksans text-text">
            {tx.type === TransactionType.TONTINE_CONTRIBUTION
              ? "Cotisation tontine"
              : tx.type === TransactionType.SOLIDARITY_CONTRIBUTION
              ? "Cotisation solidarité"
              : tx.type === TransactionType.PAYOUT
              ? "Paiement tontine"
              : "Décaissement solidarité"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-worksans text-text-muted">
        {tx.memberName}
      </td>
      <td className="px-6 py-4 text-right">
        <span
          className={`text-sm font-bold font-sora ${
            isCredit ? "text-success" : "text-primary"
          }`}
        >
          {isCredit ? "+" : "-"}
          {formatXOF(tx.amount)}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-worksans ${
            tx.status === "COMPLETED"
              ? "bg-success-tint text-success"
              : tx.status === "PENDING"
              ? "bg-accent-tint text-accent-dark"
              : "bg-danger-tint text-danger"
          }`}
        >
          {tx.status === "COMPLETED"
            ? "Terminé"
            : tx.status === "PENDING"
            ? "En attente"
            : "Échoué"}
        </span>
      </td>
    </motion.tr>
  );
}
