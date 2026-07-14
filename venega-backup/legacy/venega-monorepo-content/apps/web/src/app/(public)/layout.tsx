'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="section py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
                <span className="text-white font-heading font-bold text-xl">V</span>
              </div>
              <span className="font-heading font-bold text-2xl text-primary">Venega</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-text-muted hover:text-primary font-medium transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#how-it-works" className="text-text-muted hover:text-primary font-medium transition-colors">
                Comment ça marche
              </Link>
              <Link href="#security" className="text-text-muted hover:text-primary font-medium transition-colors">
                Sécurité
              </Link>
              <Link href="/login" className="btn-ghost">
                <User size={18} />
                Connexion
              </Link>
              <Link href="/register" className="btn-primary">
                Commencer gratuitement
                <ArrowRight size={18} />
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-primary-tint rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface">
            <div className="section py-4 flex flex-col gap-4">
              <Link
                href="#features"
                className="py-2 text-text-muted hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fonctionnalités
              </Link>
              <Link
                href="#how-it-works"
                className="py-2 text-text-muted hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comment ça marche
              </Link>
              <Link
                href="#security"
                className="py-2 text-text-muted hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sécurité
              </Link>
              <div className="h-px bg-border my-2" />
              <Link
                href="/login"
                className="btn-outline justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="btn-primary justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      {children}

      {/* Footer */}
      <footer className="bg-primary-dark text-white pt-16 pb-8">
        <div className="section">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <span className="text-primary-dark font-heading font-bold text-xl">V</span>
                </div>
                <span className="font-heading font-bold text-2xl">Venega</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Digitalisez la tontine et la caisse de solidarité. Transparence, sécurité et simplicité pour votre communauté.
              </p>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Produit</h4>
              <ul className="space-y-3 text-white/70">
                <li><Link href="#features" className="hover:text-white transition-colors">Tontine rotative</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Caisse de solidarité</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Mobile Money</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Société</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-lg mb-4">Légal</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © 2026 Venega par Aniss Informatique. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              {/* Social icons placeholder */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
