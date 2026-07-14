"use client";

import React from "react";
import { motion } from "framer-motion";
import { Coins, Users, Plus, ArrowRight, Filter } from "lucide-react";
import { mockCircles } from '../../../packages/types/src/mock-data';
import { CircleType } from '../../../packages/types/src';

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat("fr-BF", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CirclesPage() {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-sora text-text">
              Mes cercles
            </h1>
            <p className="text-text-muted mt-1 font-worksans">
              Gérez vos tontines et caisses de solidarité
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-worksans font-semibold shadow-md hover:shadow-lg transition-all">
            <Plus size={20} />
            Créer un cercle
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-muted font-worksans">
            <Filter size={18} />
            Filtrer
          </button>
        </div>

        {/* Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCircles.map((circle, index) => (
            <CircleCard key={circle.id} circle={circle} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CircleCard({ circle, index }: { circle: any; index: number }) {
  const getCircleTypeStyle = () => {
    switch (circle.type) {
      case CircleType.TONTINE_ONLY:
        return {
          bg: "bg-primary-tint",
          color: "text-primary-dark",
          label: "Tontine",
          icon: <Coins size={24} />,
        };
      case CircleType.SOLIDARITY_ONLY:
        return {
          bg: "bg-purple-tint",
          color: "text-purple",
          label: "Solidarité",
          icon: <Users size={24} />,
        };
      default:
        return {
          bg: "bg-accent-tint",
          color: "text-accent-dark",
          label: "Hybride",
          icon: <Users size={24} />,
        };
    }
  };
  const style = getCircleTypeStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl ${style.bg} flex items-center justify-center ${style.color}`}
          >
            {style.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold font-sora text-text">
              {circle.name}
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-worksans ${style.bg} ${style.color} mt-1`}
            >
              {style.label}
            </span>
          </div>
        </div>
        <button className="text-text-muted hover:text-primary transition-colors">
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {circle.type !== CircleType.SOLIDARITY_ONLY && (
          <div>
            <p className="text-xs text-text-muted font-worksans">
              Cotisation tontine
            </p>
            <p className="text-lg font-bold font-sora text-text">
              {formatXOF(circle.tontineAmount)}
            </p>
          </div>
        )}
        {circle.type !== CircleType.TONTINE_ONLY && (
          <div>
            <p className="text-xs text-text-muted font-worksans">
              Cotisation solidarité
            </p>
            <p className="text-lg font-bold font-sora text-text">
              {formatXOF(circle.solidarityAmount)}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-text-muted" />
          <span className="text-sm font-worksans text-text-muted">
            {circle.memberCount} membres
          </span>
        </div>
        <span className="text-sm font-worksans text-text-muted">
          {circle.frequency === "MONTHLY" ? "Mensuel" : "Hebdomadaire"}
        </span>
      </div>
    </motion.div>
  );
}
