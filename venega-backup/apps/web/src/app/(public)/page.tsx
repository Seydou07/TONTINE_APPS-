'use client';

import React from 'react';
import HeroSection from '@/features/landing/components/HeroSection';
import FeaturesSection from '@/features/landing/components/FeaturesSection';
import HowItWorksSection from '@/features/landing/components/HowItWorksSection';
import SecuritySection from '@/features/landing/components/SecuritySection';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection';
import CTASection from '@/features/landing/components/CTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
