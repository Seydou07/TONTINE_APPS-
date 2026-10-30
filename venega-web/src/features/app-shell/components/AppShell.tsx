'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, Home, Plus, User, Users, type LucideIcon } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Avatar } from '@/components/ui/Avatar';
import { useDemoStore } from '@/lib/demoStore';
import { loadLocalData, saveOnChange } from '@/lib/persistence';
import { getProfile } from '@/features/profile/store';

interface NavItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

/** Onglets de l'app mobile : Accueil, Cercles, [+ Créer], Historique, Profil. */
const TABS_BEFORE: NavItem[] = [
  { name: 'Accueil', icon: Home, href: '/dashboard' },
  { name: 'Cercles', icon: Users, href: '/circles' },
];
const TABS_AFTER: NavItem[] = [
  { name: 'Historique', icon: History, href: '/activity' },
  { name: 'Profil', icon: User, href: '/profile' },
];
const CREATE: NavItem = { name: 'Créer un cercle', icon: Plus, href: '/circles/create' };

/** Écrans qui portent la barre d'onglets sur téléphone (comme le groupe `(tabs)` mobile). */
const TAB_ROUTES = ['/dashboard', '/circles', '/activity', '/profile', '/notifications'];

function isActive(pathname: string, href: string) {
  if (href === '/circles') {
    return pathname === '/circles' || (pathname.startsWith('/circles/') && pathname !== '/circles/create');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Coquille de l'espace connecté : barre latérale sur ordinateur, onglets en bas
 * sur téléphone (seulement sur les écrans d'onglet, comme l'app mobile).
 * Charge aussi les données de démonstration sauvegardées dans le navigateur.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const [ready, setReady] = useState(false);
  useDemoStore();
  const profile = getProfile();

  useEffect(() => {
    loadLocalData();
    setReady(true);
    return saveOnChange();
  }, []);

  const showTabs = TAB_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen bg-fill">
      {/* ── Ordinateur : barre latérale ── */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <BrandLogo href="/dashboard" />
        </div>
        <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-0.5">
            {[...TABS_BEFORE, CREATE, ...TABS_AFTER].map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} active={isActive(pathname, item.href)} />
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/profile" className="flex items-center gap-3 border-t border-line p-4 hover:bg-fill">
          <Avatar name={profile.name} uri={profile.avatarUrl} size={36} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-ink">{profile.name}</span>
            <span className="block truncate text-[12px] text-muted">+226 {profile.phone}</span>
          </span>
        </Link>
      </aside>

      {/* ── Contenu ── */}
      <main className={`min-w-0 flex-1 ${showTabs ? 'pb-[76px] md:pb-0' : ''}`}>{ready ? children : null}</main>

      {/* ── Téléphone : onglets du bas ── */}
      {showTabs && (
        <nav
          aria-label="Navigation principale"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-white md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <ul className="grid h-16 grid-cols-5 items-center">
            {TABS_BEFORE.map((tab) => (
              <TabLink key={tab.href} item={tab} active={isActive(pathname, tab.href)} />
            ))}
            <li className="flex justify-center">
              <Link
                href={CREATE.href}
                aria-label={CREATE.name}
                className="flex h-10 w-12 items-center justify-center rounded-[14px] bg-primary text-white"
              >
                <Plus size={24} strokeWidth={2.4} aria-hidden />
              </Link>
            </li>
            {TABS_AFTER.map((tab) => (
              <TabLink key={tab.href} item={tab} active={isActive(pathname, tab.href)} />
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`flex h-11 items-center gap-3 rounded-[12px] px-3 text-[14px] transition-colors ${
        active ? 'bg-primary-tint font-semibold text-primary-dark' : 'text-ink-soft hover:bg-fill hover:text-ink'
      }`}
    >
      <Icon size={19} className={active ? 'text-primary' : 'text-muted'} aria-hidden />
      {item.name}
    </Link>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`flex h-16 flex-col items-center justify-center gap-[3px] text-[11px] ${
          active ? 'font-semibold text-primary' : 'font-medium text-subtle'
        }`}
      >
        <Icon size={24} strokeWidth={active ? 2.2 : 1.7} aria-hidden />
        {item.name}
      </Link>
    </li>
  );
}
