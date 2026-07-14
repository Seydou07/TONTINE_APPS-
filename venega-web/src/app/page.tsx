'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DownloadBadges } from '@/components/DownloadBadges';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, RefreshCw, HandHeart, Users, ArrowRight, Star, CheckCircle2, Bell, Search, Coins, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const TRUST_ITEMS = ['Local', 'Sûr', 'Facile', 'Sécurisé'];

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const STAGGER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const testimonials = [
  {
    name: 'Aminata Ouédraogo',
    role: 'Présidente de tontine',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80',
    text: 'Venega a complètement transformé notre tontine familiale. Plus de litiges, tout est clair et sécurisé !',
    rating: 5
  },
  {
    name: 'Issouf Kaboré',
    role: 'Membre actif',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    text: 'J\'épargne pour mon projet depuis 2 ans et je vois clairement l\'évolution. C\'est simple et efficace !',
    rating: 5
  }
];

const formatXOF = (amount: number) => {
  return new Intl.NumberFormat('fr-BF', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const heroImages = ['/section.png', '/section2.png', '/section3.png'];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#FAF7F1] min-h-screen flex flex-col overflow-hidden">
      <MarketingNavbar />

      {/* ===== SUPER HERO SECTION ===== */}
      <section className="relative pt-24 pb-20 px-6 lg:px-12 max-w-[1180px] mx-auto w-full overflow-hidden flex flex-col lg:flex-row items-center gap-14">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#E4F0EB] rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FBF1DD] rounded-full blur-[100px] -z-10" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER}
          className="z-10 flex-1 max-w-[560px]"
        >
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 bg-[#E4F0EB] text-[#074B36] text-[12.5px] font-bold px-4 py-2 rounded-full mb-5 border border-[#0B6E4F]/20">
            <span>🇧🇫</span> Fait pour le Burkina Faso
          </motion.div>
          
          <motion.h1 variants={FADE_UP} className="text-[44px] md:text-[44px] font-[var(--font-heading)] font-extrabold text-[#22271F] leading-[1.15] mb-5">
            Gérez vos tontines avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B6E4F] to-[#074B36]">transparence totale</span>
          </motion.h1>
          
          <motion.p variants={FADE_UP} className="text-[16px] text-[#6E7568] mb-8 leading-[1.6]">
            Venega digitalise la tontine et la caisse de solidarité : cotisez, suivez les tours et gérez votre fonds d'entraide depuis votre téléphone, sans jamais perdre confiance.
          </motion.p>
          
          <motion.div variants={FADE_UP} className="flex flex-wrap gap-3.5 mb-8">
            <Link href="/register" className="bg-gradient-to-r from-[#0B6E4F] to-[#074B36] text-white px-6 py-3.5 rounded-xl text-[15px] font-bold shadow-lg shadow-[#0B6E4F]/25 hover:-translate-y-1 transition-all duration-300">
              Créer mon compte gratuitement
            </Link>
            <a href="#how-it-works" className="bg-transparent text-[#22271F] px-6 py-3.5 rounded-xl text-[15px] font-bold border-[1.5px] border-[#D8D2C2] hover:border-[#0B6E4F] hover:text-[#0B6E4F] transition-all duration-300">
              Voir comment ça marche
            </a>
          </motion.div>

          <motion.div variants={FADE_UP} className="flex gap-3 mb-8">
            <div className="flex items-center gap-2.5 bg-[#0B0D0B] text-white rounded-xl px-4 py-2.5 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M16.4 1c.1 1-.3 2-1 2.8-.7.8-1.8 1.4-2.8 1.3-.1-1 .4-2 1-2.8.7-.8 1.9-1.4 2.8-1.3zM20 17.2c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.4.9-3.7.9c-1.6 0-2.8-1.5-3.7-2.9C1.4 17.4.5 13 1.8 10c.6-1.5 1.8-2.5 3-2.5 1.4 0 2.3 1 3.5 1 1.1 0 1.8-1 3.7-1 1.1 0 2.3.3 3.2 1.6-2.8 1.5-2.3 5.5.8 6.6-.3.7-.4.9-1 1.5z"/></svg>
              <div className="flex flex-col leading-[1.1]">
                <span className="text-[9px] opacity-80">Télécharger sur</span>
                <span className="text-[14.5px] font-bold font-[var(--font-heading)]">App Store</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-[#0B0D0B] text-white rounded-xl px-4 py-2.5 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M3.6 2.3c-.4.3-.6.8-.6 1.4v16.6c0 .6.2 1.1.6 1.4l.1.1L13 12.6v-.2L3.7 2.2z"/><path d="M16.1 15.7l-3.1-3.1v-.2l3.1-3.1 3.7 2.1c1 .6 1 1.5 0 2.1z" fill="#D9A441"/><path d="M16.1 8.3L12.9 12l-9.3 9.3c.4.4 1 .4 1.7 0l10.8-3z"/><path d="M16.1 15.7l-10.8 6c-.7.4-1.3.4-1.7 0l9.4-9.3z"/></svg>
              <div className="flex flex-col leading-[1.1]">
                <span className="text-[9px] opacity-80">Disponible sur</span>
                <span className="text-[14.5px] font-bold font-[var(--font-heading)]">Google Play</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="flex gap-7">
            <div>
              <div className="font-[var(--font-heading)] text-2xl font-extrabold text-[#22271F]">2 400+</div>
              <div className="text-[11.5px] text-[#6E7568] font-semibold mt-1">Membres actifs</div>
            </div>
            <div>
              <div className="font-[var(--font-heading)] text-2xl font-extrabold text-[#22271F]">340+</div>
              <div className="text-[11.5px] text-[#6E7568] font-semibold mt-1">Cercles gérés</div>
            </div>
            <div>
              <div className="font-[var(--font-heading)] text-2xl font-extrabold text-[#22271F]">98%</div>
              <div className="text-[11.5px] text-[#6E7568] font-semibold mt-1">Cotisations à temps</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex-shrink-0 w-full lg:w-[650px]"
        >
          <div className="relative w-full h-[500px]">
            {heroImages.map((image, index) => (
              <motion.img
                key={image}
                src={image}
                alt={`Venega ${index + 1}`}
                className="w-full h-full object-cover absolute top-0 left-0"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentImageIndex === index ? 1 : 0,
                  scale: currentImageIndex === index ? 1 : 0.95
                }}
                transition={{ duration: 0.8 }}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== TRUST MARQUEE ===== */}
      <div className="w-full overflow-hidden bg-white border-y border-[#D8D2C2] py-5 flex items-center relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        <motion.div
          className="flex gap-16 whitespace-nowrap px-10"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
        >
          {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[14px] font-bold text-[#6E7568]">
              <ShieldCheck size={18} className="text-[#0B6E4F]" />
              <span className="uppercase tracking-wide">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-[1180px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-[#0B6E4F] font-bold text-[12.5px] uppercase tracking-[0.06em] mb-2.5">Fonctionnalités</div>
          <h2 className="text-[32px] font-[var(--font-heading)] font-extrabold text-[#22271F] mb-3">
            Tout ce qu'il vous faut pour une tontine sereine
          </h2>
          <p className="text-[15px] text-[#6E7568] leading-[1.6]">Des outils simples, puissants et adaptés à vos besoins.</p>
        </div>

        {/* Feature 1: Tontine rotative */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-12 items-center mb-16"
        >
          <div>
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 bg-[#E4F0EB] rounded-xl flex items-center justify-center">
                <RefreshCw size={24} className="text-[#0B6E4F]" />
              </div>
              <h3 className="text-2xl font-[var(--font-heading)] font-extrabold text-[#22271F]">Tontine rotative</h3>
            </div>
            <p className="text-[15px] text-[#6E7568] mb-6 leading-relaxed">
              Cotisez à votre rythme, suivez l'ordre de passage et le prochain bénéficiaire. Tous les mouvements sont transparents pour tout le monde.
            </p>
            <ul className="space-y-3">
              {['Suivi temps réel', 'Notifications push', 'Historique complet'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E4F0EB] flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-[#0B6E4F]" />
                  </div>
                  <span className="text-[#22271F] text-[14.5px] font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <img
              src="/tontine_rot.png"
              alt="Groupe africain qui cotise et s'entraide"
              className="w-full h-auto"
            />
          </div>
        </motion.div>

        {/* Feature 2: Caisse de solidarité */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 bg-[#FBF1DD] rounded-xl flex items-center justify-center">
                <HandHeart size={24} className="text-[#B9852A]" />
              </div>
              <h3 className="text-2xl font-[var(--font-heading)] font-extrabold text-[#22271F]">Caisse de solidarité</h3>
            </div>
            <p className="text-[15px] text-[#6E7568] mb-6 leading-relaxed">
              Un fonds d'entraide avec vote des membres et double validation. Aidez vos proches en toute confiance.
            </p>
            <ul className="space-y-3">
              {['Vote démocratique', 'Double validation', 'Transparence totale'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FBF1DD] flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-[#B9852A]" />
                  </div>
                  <span className="text-[#22271F] text-[14.5px] font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <img
              src="/solidarite.png"
              alt="Groupe d'amis africains heureux et solidaires"
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-16 px-6 lg:px-12">
        <div className="max-w-[1180px] mx-auto w-full bg-white rounded-[28px] p-10 lg:p-14 shadow-sm border border-[#E9E4D8]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[#0B6E4F] font-bold text-[12.5px] uppercase tracking-[0.06em] mb-2.5">Comment ça marche</div>
            <h2 className="text-[32px] font-[var(--font-heading)] font-extrabold text-[#22271F] mb-3">
              Quatre étapes, zéro complication
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              { num: 1, title: 'Créez ou rejoignez un cercle', desc: 'En tant que Président, ou via un lien d\'invitation partagé sur WhatsApp.' },
              { num: 2, title: 'Cotisez via Mobile Money', desc: 'Orange Money ou Moov Money, en un clic, sans frais cachés.' },
              { num: 3, title: 'Suivez tout en direct', desc: 'Qui a payé, qui reste, qui est le prochain bénéficiaire — visible par tous.' },
              { num: 4, title: 'Recevez votre tour', desc: 'La cagnotte arrive directement sur votre Mobile Money, sans intermédiaire.' }
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center relative z-10"
              >
                <div className="w-[52px] h-[52px] bg-gradient-to-br from-[#0C7A57] to-[#074B36] text-white font-[var(--font-heading)] font-extrabold text-[19px] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_10px_20px_-8px_rgba(11,110,79,0.4)]">
                  {step.num}
                </div>
                <h4 className="text-[14.5px] font-[var(--font-heading)] font-bold text-[#22271F] mb-2">{step.title}</h4>
                <p className="text-[#6E7568] text-[12.5px] leading-[1.5]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POLYVALENCE ===== */}
      <section className="py-[70px] px-6 lg:px-12 max-w-[1180px] mx-auto w-full">
        <div className="text-center max-w-[640px] mx-auto mb-[46px]">
          <div className="text-[#0B6E4F] font-bold text-[12.5px] uppercase tracking-[0.06em] mb-2.5">Polyvalence</div>
          <h2 className="text-[32px] font-[var(--font-heading)] font-extrabold text-[#22271F] mb-3">
            Toutes les tontines que vous connaissez
          </h2>
          <p className="text-[15px] text-[#6E7568] leading-[1.6]">Venega s'adapte à vos traditions, pas l'inverse.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {[
            { 
              bg: 'linear-gradient(145deg,#0F8563,#074B36)', 
              title: 'Tontine Argent', 
              desc: 'Cagnotte classique versée au bénéficiaire du tour',
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 012-2h13a1 1 0 011 1v3"/><path d="M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-8a1 1 0 00-1-1H8a2 2 0 01-2-2"/><circle cx="16" cy="14" r="1.5"/></svg>
            },
            { 
              bg: 'linear-gradient(145deg,#E7B559,#B9852A)', 
              title: 'Tontine Moto', 
              desc: 'Cotisation groupée pour l\'achat d\'une moto',
              svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 5"/><path d="M13 9l3 0"/></svg>
            },
            { 
              bg: 'linear-gradient(145deg,#A879CC,#7A4E9C)', 
              title: 'Tontine Vivres', 
              desc: 'Paniers de vivres distribués à chaque tour',
              svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
            },
            { 
              bg: 'linear-gradient(145deg,#2B7FB0,#1B5A80)', 
              title: 'Tontine Pagne', 
              desc: 'Cotisation pour des pagnes lors des grandes occasions',
              svg: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-[20px] p-[24px_20px] text-center text-white relative overflow-hidden"
              style={{ background: item.bg }}
            >
              <div className="w-[46px] h-[46px] rounded-[13px] bg-white/18 flex items-center justify-center mx-auto mb-[14px]">
                {item.svg}
              </div>
              <h4 className="text-[14.5px] font-bold font-[var(--font-heading)] mb-[6px]">{item.title}</h4>
              <p className="text-[12px] text-white/80 leading-[1.5]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== POUR QUI ===== */}
      <section className="py-[70px] px-6 lg:px-12 max-w-[1180px] mx-auto w-full">
        <div className="text-center max-w-[640px] mx-auto mb-[46px]">
          <div className="text-[#0B6E4F] font-bold text-[12.5px] uppercase tracking-[0.06em] mb-2.5">Pour qui ?</div>
          <h2 className="text-[32px] font-[var(--font-heading)] font-extrabold text-[#22271F] mb-3">
            Une seule appli, toutes vos cagnottes
          </h2>
          <p className="text-[15px] text-[#6E7568] leading-[1.6]">Familles, bureaux, associations : Venega s'adapte à chaque groupe qui met de l'argent en commun.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {[
            { iconBg: '#E4F0EB', iconColor: '#0B6E4F', title: 'Familles', desc: 'Fonds de solidarité familiale et collectes spéciales', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg> },
            { iconBg: '#FBF1DD', iconColor: '#B9852A', title: 'Bureau & collègues', desc: 'Groupe de collègues qui cotisent ensemble', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> },
            { iconBg: '#EFE6F4', iconColor: '#7A4E9C', title: 'Associations religieuses', desc: 'Collecte des contributions et des dons', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 015 5v2a5 5 0 01-10 0V7a5 5 0 015-5z"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/></svg> },
            { iconBg: '#E3EEF7', iconColor: '#2B7FB0', title: 'Funérailles', desc: 'Fonds familial pour cérémonies et dons', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg> },
            { iconBg: '#E4F0EB', iconColor: '#0B6E4F', title: 'Entrepreneuriat', desc: 'Mettre de l\'argent ensemble pour un projet', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg> },
            { iconBg: '#FBF1DD', iconColor: '#B9852A', title: 'Clubs d\'épargne', desc: 'Amis ou voisins qui épargnent à plusieurs', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 012-2h13a1 1 0 011 1v3"/><path d="M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-8a1 1 0 00-1-1H8a2 2 0 01-2-2"/><circle cx="16" cy="14" r="1.5"/></svg> },
            { iconBg: '#EFE6F4', iconColor: '#7A4E9C', title: 'Quartier / Zone', desc: 'Caisse de solidarité de voisinage', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
            { iconBg: '#E3EEF7', iconColor: '#2B7FB0', title: 'Événements de vie', desc: 'Mariage, naissance, nouvelle maison', svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg> },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.15, delay: i * 0.05 }}
              className="bg-white border border-[#E9E4D8] rounded-[18px] p-[22px_18px] text-center hover:-translate-y-[3px] hover:shadow-[0_14px_26px_-14px_rgba(11,110,79,0.22)] transition-all duration-150"
            >
              <div 
                className="w-[44px] h-[44px] rounded-[13px] flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: item.iconBg, color: item.iconColor }}
              >
                {item.svg}
              </div>
              <h4 className="text-[13.5px] font-bold font-[var(--font-heading)] text-[#22271F] mb-[5px]">{item.title}</h4>
              <p className="text-[11.5px] text-[#6E7568] leading-[1.4]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== MARKET STAT ===== */}
      <section className="py-10 px-6 lg:px-12 max-w-[1180px] mx-auto w-full">
        <div className="rounded-[28px] p-14 text-center text-white bg-[radial-gradient(120%_200%_at_50%_0%,#0F8563_0%,#0B6E4F_55%,#074B36_100%)]">
          <div className="text-[13px] text-white/75 font-semibold mb-3.5 tracking-wider">L'ÉPARGNE INFORMELLE EN AFRIQUE DE L'OUEST</div>
          <div className="font-[var(--font-heading)] text-[56px] font-extrabold mb-3">200 Milliards $</div>
          <div className="text-[15px] text-white/85 max-w-[520px] mx-auto leading-relaxed">
            estimés en circulation dans les tontines et caisses de solidarité informelles — largement invisibles du système financier officiel. Venega rend cette épargne aussi fiable et traçable qu'une banque, sans lui retirer sa chaleur humaine.
          </div>
        </div>
      </section>

      {/* ===== SÉCURITÉ SECTION ===== */}
      <section className="py-16 px-6 lg:px-12 max-w-[1180px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-14 bg-[#E4F0EB] rounded-[28px] p-14">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-[#0B6E4F] font-bold text-[12.5px] uppercase tracking-[0.06em] mb-2.5">Sécurité & confiance</div>
            <h2 className="text-[26px] font-[var(--font-heading)] font-extrabold text-[#22271F] mb-6">
              La confiance, garantie par le système
            </h2>
            
            <div className="space-y-5">
              <div className="flex gap-3.5">
                <div className="w-9 h-9 rounded-[10px] bg-white text-[#0B6E4F] flex items-center justify-center flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
                </div>
                <div>
                  <h4 className="text-[14.5px] font-bold font-[var(--font-heading)] text-[#22271F] mb-1">L'argent ne transite jamais par un compte personnel</h4>
                  <p className="text-[12.5px] text-[#6E7568] leading-[1.5]">Chaque cotisation va vers un compte de collecte dédié au cercle, jamais dans le portefeuille du Président.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <div className="w-9 h-9 rounded-[10px] bg-white text-[#0B6E4F] flex items-center justify-center flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div>
                  <h4 className="text-[14.5px] font-bold font-[var(--font-heading)] text-[#22271F] mb-1">Double validation obligatoire</h4>
                  <p className="text-[12.5px] text-[#6E7568] leading-[1.5]">Tout décaissement de la caisse de solidarité exige l'accord du Président ET du Trésorier.</p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <div className="w-9 h-9 rounded-[10px] bg-white text-[#0B6E4F] flex items-center justify-center flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div>
                  <h4 className="text-[14.5px] font-bold font-[var(--font-heading)] text-[#22271F] mb-1">Historique immuable</h4>
                  <p className="text-[12.5px] text-[#6E7568] leading-[1.5]">Chaque mouvement est horodaté et visible par tous les membres du cercle, en temps réel.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex-shrink-0 w-[280px]"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <img
              src="/securite.png"
              alt="Sécurité et confiance"
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-16 px-6 lg:px-12 max-w-[1180px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-[#0B6E4F] font-bold text-[12.5px] uppercase tracking-[0.06em] mb-2.5">Témoignages</div>
          <h2 className="text-[32px] font-[var(--font-heading)] font-extrabold text-[#22271F] mb-3">
            Ils gèrent déjà leur tontine avec Venega
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              text: '"Avant, on se disputait toujours sur qui avait payé ou non. Avec Venega, tout le monde voit la même chose. Plus aucune tension dans le groupe."',
              name: 'Fatoumata O.',
              role: 'Présidente, Tontine Bureau',
              avatar: '/avatar-female-1.png'
            },
            {
              text: '"La caisse de solidarité nous a vraiment sauvés quand mon oncle a été hospitalisé. La demande a été validée en deux jours, en toute transparence."',
              name: 'Salif Z.',
              role: 'Membre, Zone 1',
              avatar: '/avatar-male-1.png'
            },
            {
              text: '"On a monté une tontine moto entre collègues. Chaque mois quelqu\'un reçoit sa moto, et tout est justifié avec preuve d\'achat. Génial."',
              name: 'Adama P.',
              role: 'Trésorier, Tontine Moto',
              avatar: '/avatar-male-2.png'
            }
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-white rounded-[20px] p-6 border border-[#E9E4D8]"
            >
              <div className="text-[#D9A441] text-[13px] mb-3 tracking-widest">★★★★★</div>
              <p className="text-[#22271F] text-[13.5px] mb-4 leading-[1.6]">{t.text}</p>
              <div className="flex items-center gap-2.5">
                <div className="w-[38px] h-[38px] rounded-full bg-[#E4F0EB] flex items-center justify-center text-[#0B6E4F] font-bold text-[13px]">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold font-[var(--font-heading)] text-[#22271F] text-[13px]">{t.name}</div>
                  <div className="text-[11px] text-[#6E7568]">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== PAIEMENT ===== */}
      <section className="py-[70px] px-6 lg:px-12 max-w-[1180px] mx-auto w-full">
        <div className="text-center mb-[46px]">
          <div className="text-[#0B6E4F] font-bold text-[12.5px] uppercase tracking-[0.06em] mb-2.5">Paiement</div>
          <h2 className="text-[32px] font-[var(--font-heading)] font-extrabold text-[#22271F] mb-3">
            Intégré à vos moyens de paiement habituels
          </h2>
          <p className="text-[15px] text-[#6E7568] leading-[1.6]">Orange Money, Moov Money — sécurisé par CinetPay.</p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-[40px]">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-[12px] border border-[#E9E4D8] bg-white text-[#6E7568] font-bold text-[14px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            Orange Money
          </div>
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-[12px] border border-[#E9E4D8] bg-white text-[#6E7568] font-bold text-[14px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            Moov Money
          </div>
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-[12px] border border-[#E9E4D8] bg-white text-[#6E7568] font-bold text-[14px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
            Sécurisé par CinetPay
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-10 px-6 lg:px-12 max-w-[1180px] mx-auto w-full mb-10">
        <div className="rounded-[28px] p-14 text-center relative overflow-hidden bg-[radial-gradient(120%_160%_at_50%_0%,#0F8563_0%,#0B6E4F_50%,#074B36_100%)]">
          <h2 className="text-[30px] font-[var(--font-heading)] font-extrabold text-white mb-3.5">
            Prêt à digitaliser votre tontine ?
          </h2>
          <p className="text-[14.5px] text-white/80 mb-7">
            Créez votre compte en moins de deux minutes. Sur mobile, ou directement depuis votre navigateur.
          </p>
          
          <div className="flex gap-3 justify-center flex-wrap mb-4">
            <div className="flex items-center gap-2.5 bg-[#0B0D0B] text-white rounded-xl px-4 py-2 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M16.4 1c.1 1-.3 2-1 2.8-.7.8-1.8 1.4-2.8 1.3-.1-1 .4-2 1-2.8.7-.8 1.9-1.4 2.8-1.3zM20 17.2c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.4.9-3.7.9c-1.6 0-2.8-1.5-3.7-2.9C1.4 17.4.5 13 1.8 10c.6-1.5 1.8-2.5 3-2.5 1.4 0 2.3 1 3.5 1 1.1 0 1.8-1 3.7-1 1.1 0 2.3.3 3.2 1.6-2.8 1.5-2.3 5.5.8 6.6-.3.7-.4.9-1 1.5z"/></svg>
              <div className="flex flex-col leading-[1.1] text-left">
                <span className="text-[9px] opacity-80">Télécharger sur</span>
                <span className="text-[14.5px] font-bold font-[var(--font-heading)]">App Store</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-[#0B0D0B] text-white rounded-xl px-4 py-2 cursor-pointer hover:-translate-y-0.5 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3.6 2.3c-.4.3-.6.8-.6 1.4v16.6c0 .6.2 1.1.6 1.4l.1.1L13 12.6v-.2L3.7 2.2z"/><path d="M16.1 15.7l-3.1-3.1v-.2l3.1-3.1 3.7 2.1c1 .6 1 1.5 0 2.1z" fill="#D9A441"/><path d="M16.1 8.3L12.9 12l-9.3 9.3c.4.4 1 .4 1.7 0l10.8-3z"/><path d="M16.1 15.7l-10.8 6c-.7.4-1.3.4-1.7 0l9.4-9.3z"/></svg>
              <div className="flex flex-col leading-[1.1] text-left">
                <span className="text-[9px] opacity-80">Disponible sur</span>
                <span className="text-[14.5px] font-bold font-[var(--font-heading)]">Google Play</span>
              </div>
            </div>
          </div>

          <Link href="/register" className="inline-flex bg-gradient-to-r from-[#E7B559] to-[#B9852A] text-[#382b09] px-[30px] py-[15px] rounded-xl text-[15px] font-bold shadow-lg shadow-[#D9A441]/30 hover:-translate-y-0.5 transition-transform">
            Ou continuer sur navigateur →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
