'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, FileCheck2, Upload, Camera, CheckCircle2, BadgeCheck } from 'lucide-react';

export default function KycUploadPage() {
  const router = useRouter();
  const [cnibFront, setCnibFront] = useState<File | null>(null);
  const [cnibBack, setCnibBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const complete = !!cnibFront && !!cnibBack && !!selfie;

  const handleSubmit = () => {
    if (!complete) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/kyc/success');
    }, 1200);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/kyc/intro" className="p-2 hover:bg-bg rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading font-bold text-2xl text-text-main">Vérification d'identité</h1>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-3 bg-primary-tint rounded-xl p-3.5">
          <ShieldCheck size={18} className="text-primary-dark shrink-0" />
          <p className="text-sm font-medium text-primary-dark">
            Vos documents d'identité sont cryptés et strictement confidentiels.
          </p>
        </div>

        <UploadCard
          label="CNIB — Recto"
          title="CNIB (face avant)"
          file={cnibFront}
          onChange={setCnibFront}
        />

        <UploadCard
          label="CNIB — Verso"
          title="CNIB (face arrière)"
          file={cnibBack}
          onChange={setCnibBack}
        />

        <div>
          <label className="block text-sm font-medium text-text-main mb-2">Selfie de vérification</label>
          <label
            className={`flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              selfie ? 'border-success bg-success/5' : 'border-primary/40 hover:border-primary'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-primary-tint flex items-center justify-center">
              {selfie ? <BadgeCheck size={26} className="text-success" /> : <Camera size={26} className="text-primary-dark" />}
            </div>
            <span className="font-medium text-text-main text-sm">
              {selfie ? 'Selfie capturé' : 'Prendre un selfie'}
            </span>
            <span className="text-xs text-text-muted">{selfie ? selfie.name : 'Placez votre visage au centre du cadrage'}</span>
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="sr-only"
              onChange={(e) => setSelfie(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!complete || loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Vérification en cours…' : 'Soumettre pour vérification'}
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-2 text-text-muted text-sm font-medium hover:text-text-main transition-colors"
        >
          Ignorer pour l'instant
        </button>
      </div>
    </div>
  );
}

function UploadCard({
  label,
  title,
  file,
  onChange,
}: {
  label: string;
  title: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-main mb-2">{label}</label>
      <label
        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
          file ? 'border-success bg-success/5' : 'border-border hover:border-primary/40'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${file ? 'bg-success/10' : 'bg-primary-tint'}`}>
          {file ? <CheckCircle2 size={20} className="text-success" /> : <FileCheck2 size={20} className="text-primary-dark" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-text-main">{title}</p>
          <p className="text-xs text-text-muted truncate">{file ? file.name : 'Prendre une photo ou importer un fichier'}</p>
        </div>
        <Upload size={16} className={file ? 'text-success' : 'text-text-muted'} />
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}
