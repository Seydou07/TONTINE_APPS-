import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Venega Admin',
    template: '%s · Venega Admin',
  },
  description: 'Administration Venega : validation KYC, modération des cagnottes, suivi de la fraude.',
  icons: { icon: '/venega-logo.png' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#074B36',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
