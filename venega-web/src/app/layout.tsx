import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Police système (system-ui / -apple-system / Segoe UI / Roboto), comme l'app
 * mobile : aucune police à télécharger, pages plus légères sur réseau lent.
 */

export const metadata: Metadata = {
  title: {
    default: 'Venega — Tontine et caisse de solidarité',
    template: '%s | Venega',
  },
  description:
    'Venega gère la tontine et la caisse de solidarité au Burkina Faso. Cotisez par Orange Money, Moov Money ou Wave et suivez chaque tour en toute transparence.',
  keywords: [
    'tontine',
    'Burkina Faso',
    'caisse de solidarité',
    'épargne communautaire',
    'mobile money',
    'Orange Money',
    'Moov Money',
    'Wave',
    'Venega',
  ],
  authors: [{ name: 'Aniss Informatique' }],
  icons: { icon: '/venega-icon.png' },
  openGraph: {
    title: 'Venega — Tontine et caisse de solidarité',
    description: 'La tontine et la caisse de solidarité sur votre téléphone, au Burkina Faso.',
    type: 'website',
    locale: 'fr_BF',
  },
};

export const viewport: Viewport = {
  themeColor: '#074B36',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
