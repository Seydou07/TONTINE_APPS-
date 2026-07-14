"use client";

import React from "react";
import {
  User,
  Phone,
  Shield,
  Settings,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { mockCurrentUser } from '../../../packages/types/src/mock-data';
import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold font-sora">
                {mockCurrentUser.firstName[0]}
                {mockCurrentUser.lastName[0]}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold font-sora text-text flex items-center justify-center sm:justify-start gap-2">
                {mockCurrentUser.firstName} {mockCurrentUser.lastName}
                {mockCurrentUser.kycStatus === "VERIFIED" && (
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-semibold font-worksans">
                      Vérifié
                    </span>
                  </span>
                )}
              </h1>
              <p className="text-text-muted font-worksans mt-1">
                {mockCurrentUser.phoneNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold font-sora text-primary">
              {mockCurrentUser.completedCycles}
            </p>
            <p className="text-sm text-text-muted font-worksans">
              Cycles complétés
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold font-sora text-accent">
              {mockCurrentUser.reliabilityScore}
            </p>
            <p className="text-sm text-text-muted font-worksans">
              Score de confiance
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold font-sora text-purple">6</p>
            <p className="text-sm text-text-muted font-worksans">
              Cercles actifs
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-bg transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-tint rounded-lg">
                <User size={20} className="text-primary" />
              </div>
              <span className="font-worksans font-medium text-text">
                Modifier le profil
              </span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-bg transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-tint rounded-lg">
                <Shield size={20} className="text-accent-dark" />
              </div>
              <span className="font-worksans font-medium text-text">
                Vérification KYC
              </span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-bg transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info-tint rounded-lg">
                <Phone size={20} className="text-info" />
              </div>
              <span className="font-worksans font-medium text-text">
                Sécurité & mot de passe
              </span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-bg transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-tint rounded-lg">
                <Settings size={20} className="text-purple" />
              </div>
              <span className="font-worksans font-medium text-text">
                Paramètres
              </span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-bg transition-colors text-left text-danger">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger-tint rounded-lg">
                <LogOut size={20} className="text-danger" />
              </div>
              <span className="font-worksans font-medium">
                Se déconnecter
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
