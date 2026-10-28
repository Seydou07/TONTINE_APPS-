'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  History,
  HandHeart,
  Home,
  LogIn,
  LogOut,
  MessageSquare,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { mockCurrentUser } from '@venega/types';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Avatar } from '@/components/ui/misc';
import { formatPhone } from '@/lib/format';

interface NavItem {
  name: string;
  short?: string;
  icon: LucideIcon;
  href: string;
}

const SIDEBAR: { label?: string; items: NavItem[] }[] = [
  { items: [{ name: 'Accueil', icon: Home, href: '/dashboard' }] },
  {
    label: 'Cercles',
    items: [
      { name: 'Mes cercles', icon: Users, href: '/circles' },
      { name: 'Rejoindre un cercle', icon: LogIn, href: '/circles/join' },
      { name: 'Caisse de solidarité', icon: HandHeart, href: '/solidarity' },
    ],
  },
  {
    label: 'Suivi',
    items: [
      { name: 'Historique', icon: History, href: '/activity' },
      { name: 'Fiabilité', icon: ShieldCheck, href: '/reliability' },
      { name: 'Messages', icon: MessageSquare, href: '/messages' },
    ],
  },
  { label: 'Compte', items: [{ name: 'Profil', icon: User, href: '/profile' }] },
];

/** Onglets du bas sur téléphone — mêmes que l'app mobile. */
const TABS: NavItem[] = [
  { name: 'Accueil', icon: Home, href: '/dashboard' },
  { name: 'Cercles', icon: Users, href: '/circles' },
  { name: 'Historique', icon: History, href: '/activity' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { name: 'Profil', icon: User, href: '/profile' },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === '/circles') {
    return pathname === '/circles' || (pathname.startsWith('/circles/') && !pathname.startsWith('/circles/join'));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Coquille de l'espace membre : barre latérale blanche sur ordinateur,
 * onglets en bas d'écran sur téléphone (comme l'app mobile).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const fullName = `${mockCurrentUser.firstName} ${mockCurrentUser.lastName}`;

  return (
    <div className="flex min-h-screen bg-bg">
      {/* ── Ordinateur : barre latérale ── */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <BrandLogo href="/dashboard" />
        </div>

        <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-3 py-3">
          {SIDEBAR.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
              {group.label && (
                <p className="px-3 pb-1.5 text-[12px] font-semibold text-subtle">{group.label}</p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`flex h-11 items-center gap-3 rounded-[12px] px-3 text-[14px] transition-colors ${
                          active
                            ? 'bg-primary-tint font-semibold text-primary-dark'
                            : 'text-ink-soft hover:bg-fill hover:text-ink'
                        }`}
                      >
                        <Icon size={19} className={active ? 'text-primary' : 'text-muted'} aria-hidden />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-[12px] p-2">
            <Avatar name={fullName} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">{fullName}</p>
              <p className="truncate text-[12px] text-muted">{formatPhone(mockCurrentUser.phoneNumber)}</p>
            </div>
            <Link
              href="/login"
              aria-label="Se déconnecter"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-danger-tint hover:text-danger"
            >
              <LogOut size={17} aria-hidden />
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Contenu ── */}
      <main className="min-w-0 flex-1 pb-[76px] md:pb-0">{children}</main>

      {/* ── Téléphone : onglets du bas ── */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="grid h-16 grid-cols-5">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            const Icon = tab.icon;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                    active ? 'text-primary' : 'text-muted'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                  {tab.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
