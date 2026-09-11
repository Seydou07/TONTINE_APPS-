'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';

export function MarketingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white/95 backdrop-blur-md border-border py-4 shadow-md`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <span className="font-heading font-extrabold text-lg text-primary-dark tracking-tight">
            Venega
          </span>
        </Link>

        {/* Liens de navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            className="text-sm font-semibold text-text-muted hover:text-primary transition-colors"
          >
            Fonctionnalités
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className="text-sm font-semibold text-text-muted hover:text-primary transition-colors"
          >
            Comment ça marche
          </a>
          <a
            href="#security"
            onClick={(e) => scrollToSection(e, 'security')}
            className="text-sm font-semibold text-text-muted hover:text-primary transition-colors"
          >
            Sécurité
          </a>
        </div>

        {/* Actions Auth */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">
            Se connecter
          </Link>
          <Link href="/register" className="btn-primary py-2.5 px-5 text-sm">
            Créer un compte
          </Link>
        </div>
      </div>
    </nav>
  );
}
