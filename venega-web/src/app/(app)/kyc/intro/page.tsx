'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ShieldCheck, FileText, Camera } from 'lucide-react';

export default function KycIntroPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="p-2 hover:bg-bg rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading font-bold text-2xl text-text-main">Vérification d'identité</h1>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-tint flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} className="text-primary-dark" />
        </div>

        <h2 className="font-heading font-bold text-xl text-text-main mb-2">Identification conforme</h2>
        <p className="text-text-muted text-sm leading-relaxed mb-6">
          Pour sécuriser les cotisations et la confiance de votre cercle, votre identité doit être vérifiée.
        </p>

        <div className="bg-bg rounded-xl border border-border divide-y divide-border text-left mb-8">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-primary-tint flex items-center justify-center shrink-0">
              <FileText size={17} className="text-primary-dark" />
            </div>
            <span className="text-sm font-medium text-text-main">Pièce d'identité (CNIB ou passeport)</span>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-primary-tint flex items-center justify-center shrink-0">
              <Camera size={17} className="text-primary-dark" />
            </div>
            <span className="text-sm font-medium text-text-main">Selfie de vérification</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/kyc/upload')}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Commencer la vérification
          <ArrowRight size={18} />
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 mt-2 text-text-muted font-medium hover:text-text-main transition-colors"
        >
          Ignorer pour le moment
        </button>
      </div>
    </div>
  );
}
