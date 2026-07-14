import type { Metadata } from 'next';
import { Sora, Work_Sans } from 'next/font/google';
import './globals.css';

/**
 * Polices Venega — chargées via next/font pour des performances optimales
 * (pas de CDN externe, polices servies en local après le build).
 */
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Venega — Tontine Digitale & Caisse de Solidarité',
    template: '%s | Venega',
  },
  description:
    'Venega digitalise la tontine rotative et la caisse de solidarité au Burkina Faso. Cotisez, épargnez et entraidez-vous en toute transparence via Orange Money et Moov Money.',
  keywords: [
    'tontine',
    'tontine digitale',
    'Burkina Faso',
    'caisse de solidarité',
    'épargne communautaire',
    'mobile money',
    'Orange Money',
    'Moov Money',
    'ROSCA',
    'Venega',
  ],
  authors: [{ name: 'Aniss Informatique' }],
  openGraph: {
    title: 'Venega — Tontine Digitale & Caisse de Solidarité',
    description:
      'La plateforme de gestion financière communautaire pour le Burkina Faso.',
    type: 'website',
    locale: 'fr_BF',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${sora.variable} ${workSans.variable}`}>
      <body className="min-h-screen bg-bg text-text-main font-body antialiased">
        {children}
      </body>
    </html>
  );
}
