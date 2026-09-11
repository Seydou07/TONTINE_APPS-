import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20 py-16 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between gap-12">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <Logo className="w-8 h-8" />
            <span className="font-heading font-extrabold text-lg text-primary-dark">
              Venega
            </span>
          </Link>
          <p className="text-sm text-text-muted leading-relaxed">
            Venega digitalise la tontine et la caisse de solidarité. Cotisez, suivez les tours et gérez votre fonds d'entraide depuis votre téléphone ou votre ordinateur, sans jamais perdre confiance.
          </p>
        </div>

        <div className="flex gap-16 flex-wrap">
          <div>
            <h5 className="text-xs uppercase tracking-wider font-bold text-text-muted mb-4">
              Produit
            </h5>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#security" className="text-sm font-medium hover:text-primary transition-colors">
                  Sécurité & Confiance
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-bold text-text-muted mb-4">
              Entreprise
            </h5>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Venega. Fait pour le Burkina Faso 🇧🇫. Tous droits réservés.
        </p>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <Link href="#" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
          <Link href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</Link>
        </div>
      </div>
    </footer>
  );
}
