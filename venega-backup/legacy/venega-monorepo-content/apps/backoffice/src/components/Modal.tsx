'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export default function Modal({ open, onClose, title, subtitle, children, width = 'max-w-lg' }: ModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[85vh] flex flex-col`}>
        <div className="flex items-start justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-emerald-500 to-teal-500">
          <div>
            <h2 className="text-[15px] font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-[12px] text-emerald-100 mt-0.5 font-mono">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors -mt-1 -mr-1">
            <X size={16} className="text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-400">{label}</span>
      <span className={`text-[13px] font-medium text-gray-900 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
