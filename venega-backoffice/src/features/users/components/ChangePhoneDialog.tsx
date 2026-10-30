'use client';

import React, { useEffect, useState } from 'react';
import { Button, Dialog, FormField, Notice, TextArea, TextInput } from '@/components/ui';
import { formatPhone } from '@/lib/format';
import { toE164BF } from '@/lib/phone';
import { useAdminMutation } from '@/lib/useAdminMutation';
import { changePhone } from '../api';
import type { AdminUser } from '../types';

const CHECKS = [
  'L’appelant a donné ses nom et prénoms exacts',
  'Il a donné sa date de naissance',
  'Il a cité au moins un cercle dont il est membre',
];

/**
 * Perte de SIM / changement de numéro.
 * Exige un KYC vérifié et le numéro de pièce dicté par l'appelant (comparé côté serveur).
 */
export function ChangePhoneDialog({ user, open, onClose }: { user: AdminUser; open: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [doc, setDoc] = useState('');
  const [reason, setReason] = useState('');
  const [checks, setChecks] = useState<boolean[]>(CHECKS.map(() => false));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setPhone('');
      setDoc('');
      setReason('');
      setChecks(CHECKS.map(() => false));
      setTouched(false);
    }
  }, [open]);

  const mutation = useAdminMutation({
    mutationFn: () => changePhone(user.id, { newPhone: phone, documentNumber: doc, reason }),
    successTitle: (u) => `Numéro de ${u.displayName} changé : ${formatPhone(u.phoneNumber)}`,
    onSuccess: onClose,
  });

  const kycOk = user.kycStatus === 'VERIFIED';
  const phoneOk = !!toE164BF(phone);
  const valid = kycOk && phoneOk && doc.trim().length >= 4 && reason.trim().length >= 10 && checks.every(Boolean);

  return (
    <Dialog
      open={open}
      onClose={mutation.isPending ? () => undefined : onClose}
      title="Changer le numéro de téléphone"
      description={`Numéro actuel : ${formatPhone(user.phoneNumber)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button
            disabled={!kycOk}
            loading={mutation.isPending}
            onClick={() => {
              setTouched(true);
              if (valid) mutation.mutate(undefined);
            }}
          >
            Changer le numéro
          </Button>
        </>
      }
    >
      {!kycOk ? (
        <Notice tone="red">
          Identité non vérifiée (KYC {user.kycStatus === 'PENDING' ? 'en attente' : user.kycStatus === 'REJECTED' ? 'refusé' : 'non soumis'}). Le changement de numéro est impossible
          tant que la pièce d’identité n’a pas été validée : c’est la seule protection contre le vol de compte.
        </Notice>
      ) : (
        <div className="space-y-3">
          <Notice tone="amber">
            Toutes les sessions seront déconnectées et un SMS de confirmation sera envoyé au nouveau numéro. L’ancien numéro est conservé dans l’historique.
          </Notice>
          <fieldset>
            <legend className="mb-1 text-sm font-medium text-ink">
              Vérification de l’identité de l’appelant <span className="text-danger">*</span>
            </legend>
            <div className="space-y-1">
              {CHECKS.map((c, i) => (
                <label key={c} className="flex items-start gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[#0B6E4F]"
                    checked={checks[i]}
                    onChange={(e) => setChecks((xs) => xs.map((x, j) => (j === i ? e.target.checked : x)))}
                  />
                  {c}
                </label>
              ))}
            </div>
            {touched && !checks.every(Boolean) && <p className="mt-1 text-sm text-danger">Toutes les vérifications sont obligatoires.</p>}
          </fieldset>
          <FormField label="Numéro de CNIB / passeport dicté par l’appelant" required hint="Comparé au document validé lors du KYC. Ne le lisez pas à l’appelant.">
            {(id) => <TextInput id={id} value={doc} onChange={(e) => setDoc(e.target.value)} autoComplete="off" className="font-mono" />}
          </FormField>
          <FormField label="Nouveau numéro" required error={touched && !phoneOk ? '8 chiffres après +226.' : null}>
            {(id) => <TextInput id={id} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+226 70 00 00 00" />}
          </FormField>
          <FormField label="Motif" required error={touched && reason.trim().length < 10 ? '10 caractères minimum.' : null}>
            {(id) => <TextArea id={id} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex. : téléphone volé le 28/10, nouvelle puce Orange" />}
          </FormField>
        </div>
      )}
    </Dialog>
  );
}
