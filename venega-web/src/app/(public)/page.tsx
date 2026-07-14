'use client';

import React from 'react';
import HeroSection from '@/features/landing/components/HeroSection';
import MarqueeSection from '@/features/landing/components/MarqueeSection';
import FeaturesSection from '@/features/landing/components/FeaturesSection';
import HowItWorksSection from '@/features/landing/components/HowItWorksSection';
import TypesSection from '@/features/landing/components/TypesSection';
import UseCasesSection from '@/features/landing/components/UseCasesSection';
import MarketStatSection from '@/features/landing/components/MarketStatSection';
import SecuritySection from '@/features/landing/components/SecuritySection';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection';
import PartnersSection from '@/features/landing/components/PartnersSection';
import CTASection from '@/features/landing/components/CTASection';
import FooterSection from '@/features/landing/components/FooterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <MarqueeSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TypesSection />
      <UseCasesSection />
      <MarketStatSection />
      <SecuritySection />
      <TestimonialsSection />
      <PartnersSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
