import type { Metadata } from 'next';
import { Sora, Work_Sans } from 'next/font/google';
import './globals.css';

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
    default: 'Venega Admin - Gestion de la plateforme',
    template: '%s | Venega Admin',
  },
  description:
    'Interface d\'administration Venega pour gérer les utilisateurs, les cercles, et les transactions.',
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
