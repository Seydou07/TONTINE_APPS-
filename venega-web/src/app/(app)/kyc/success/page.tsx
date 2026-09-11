'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

export default function KycSuccessPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary-tint flex items-center justify-center mx-auto mb-6">
          <Check size={36} className="text-primary-dark" strokeWidth={3} />
        </div>
        <h1 className="font-heading font-bold text-xl text-text-main mb-2">Identité vérifiée</h1>
        <p className="text-text-muted text-sm leading-relaxed max-w-sm mx-auto mb-8">
          Vous pouvez maintenant créer des cercles, inviter des membres et profiter de toutes les fonctionnalités de Venega.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
