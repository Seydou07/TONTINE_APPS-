'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CircleDot,
  HandHeart,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { CountPill } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Button';
import { ToastProvider } from '@/components/ui/Toast';
import { getSession, signOut, type AdminSession } from '@/features/auth/api';
import { getKycStats } from '@/features/kyc/api';
import { getOpenAlertCounts } from '@/features/alerts/api';
import { getFundraiserCounts } from '@/features/fundraisers/api';
import { BrandLogo } from './BrandLogo';
import { QueryProvider } from './QueryProvider';

type NavKey = 'kyc' | 'fundraisers' | 'alerts';

const NAV: { href: string; label: string; icon: React.ElementType; count?: NavKey }[] = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/kyc', label: 'Validation KYC', icon: UserCheck, count: 'kyc' },
  { href: '/cagnottes', label: 'Cagnottes publiques', icon: HandHeart, count: 'fundraisers' },
  { href: '/alertes', label: 'Alertes fraude', icon: AlertTriangle, count: 'alerts' },
  { href: '/users', label: 'Utilisateurs', icon: Users },
  { href: '/circles', label: 'Cercles', icon: CircleDot },
  { href: '/journal', label: 'Journal', icon: ScrollText },
];

function useNavCounts() {
  return useQuery({
    queryKey: ['nav-counts'],
    queryFn: async () => {
      const [kyc, alerts, fundraisers] = await Promise.all([getKycStats(), getOpenAlertCounts(), getFundraiserCounts()]);
      return {
        kyc: kyc.pending,
        alerts: alerts.total,
        alertsCritical: alerts.CRITICAL,
        fundraisers: fundraisers.PENDING + fundraisers.REPORTED,
      };
    },
  });
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data } = useNavCounts();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3" aria-label="Navigation principale">
      {NAV.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const count = item.count && data ? data[item.count] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-10 items-center gap-3 rounded-md px-3 text-base font-medium transition-colors',
              active ? 'bg-white text-brand-dark' : 'text-white/85 hover:bg-white/10 hover:text-white',
            )}
          >
            <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-brand' : ''} />
            <span className="flex-1 truncate">{item.label}</span>
            <CountPill value={count} tone={item.count === 'alerts' && data?.alertsCritical ? 'red' : 'amber'} />
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <BrandLogo size={44} onDark />
      <div className="leading-tight">
        <p className="text-base font-semibold text-white">Administration</p>
        <p className="text-sm text-white/70">Backoffice Venega</p>
      </div>
    </div>
  );
}

function SidebarFooter({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-ink">
          {session.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{session.name}</p>
          <p className="truncate text-xs text-white/60">{session.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) router.replace('/login');
    setSession(s);
  }, [router]);

  useEffect(() => setDrawer(false), [pathname]);

  const logout = () => {
    signOut();
    router.replace('/login');
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-brand">
        <Spinner />
      </div>
    );
  }

  return (
    <QueryProvider>
      <ToastProvider>
        <div className="flex h-screen">
          <aside className="hidden w-64 shrink-0 flex-col bg-brand-dark lg:flex">
            <SidebarBrand />
            <SideNav />
            <SidebarFooter session={session} onLogout={logout} />
          </aside>

          {drawer && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} aria-hidden />
              <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-brand-dark">
                <div className="flex items-start justify-between pr-2">
                  <SidebarBrand />
                  <button
                    type="button"
                    onClick={() => setDrawer(false)}
                    className="mt-4 rounded p-2 text-white/80 hover:bg-white/10"
                    aria-label="Fermer le menu"
                  >
                    <X size={18} />
                  </button>
                </div>
                <SideNav onNavigate={() => setDrawer(false)} />
                <SidebarFooter session={session} onLogout={logout} />
              </aside>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-4 lg:px-6">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="-ml-1 rounded p-2 text-ink-soft hover:bg-canvas lg:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu size={20} />
              </button>
              <span className="text-base font-semibold text-ink lg:hidden">Venega Admin</span>
              <div
                className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-accent-line bg-accent-tint px-2.5 py-1 text-sm font-medium text-accent-ink"
                title="Les données affichées sont des données de démonstration. Les actions ne sont pas envoyées au serveur."
              >
                <HardDrive size={14} />
                <span className="hidden sm:inline">Mode démo · données locales, rien n’est envoyé au serveur</span>
                <span className="sm:hidden">Mode démo</span>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">{children}</div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}
