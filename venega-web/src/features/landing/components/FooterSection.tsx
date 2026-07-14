'use client';

import React from 'react';
import Link from 'next/link';

const footerLinks = {
  produit: [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Comment ça marche', href: '#how-it-works' },
    { label: 'Sécurité', href: '#security' },
  ],
  compte: [
    { label: 'Se connecter', href: '/login' },
    { label: 'Créer un compte', href: '/register' },
  ],
  contact: [
    { label: '+226 70 00 00 00', href: '#' },
    { label: 'contact@benkadi.app', href: '#' },
    { label: 'Ouagadougou, Burkina Faso', href: '#' },
  ],
};

export default function FooterSection() {
  return (
    <footer className="border-t border-border mt-[70px]">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-12 md:py-[50px]">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-8">
          <div className="max-w-[260px]">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-7 h-7 bg-gradient-to-br from-[#0F8563] to-primary-dark rounded-lg" />
              <span className="font-heading font-extrabold text-lg text-primary-dark">Venega</span>
            </div>
            <p className="text-text-muted text-[13px] leading-relaxed">
              La confiance qui tourne. Tontine digitale et caisse de solidarité pour le Burkina Faso.
            </p>
          </div>

          <div className="flex gap-10 flex-wrap">
            <div>
              <h5 className="text-[12px] uppercase tracking-wide text-text-muted font-bold mb-3.5">Produit</h5>
              {footerLinks.produit.map((link) => (
                <Link key={link.label} href={link.href} className="block text-[13.5px] mb-2.5 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <h5 className="text-[12px] uppercase tracking-wide text-text-muted font-bold mb-3.5">Compte</h5>
              {footerLinks.compte.map((link) => (
                <Link key={link.label} href={link.href} className="block text-[13.5px] mb-2.5 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <h5 className="text-[12px] uppercase tracking-wide text-text-muted font-bold mb-3.5">Contact</h5>
              {footerLinks.contact.map((link) => (
                <span key={link.label} className="block text-[13.5px] mb-2.5">
                  {link.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between text-text-muted text-[12.5px]">
          <span>© 2026 Venega. Tous droits réservés.</span>
          <span>Fait avec confiance au Burkina Faso 🇧🇫</span>
        </div>
      </div>
    </footer>
  );
}
