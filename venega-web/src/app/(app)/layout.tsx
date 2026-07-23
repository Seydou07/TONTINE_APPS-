'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  CreditCard,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  HandHeart,
  MessageSquare,
  User,
  PlusCircle,
  LogIn,
  Shield,
} from 'lucide-react';
import Image from 'next/image';
import { mockCurrentUser } from '@venega/types';
import { Logo } from '@/components/Logo';

const navItems = [
  { name: 'Tableau de bord', icon: Home, href: '/dashboard' },
  { divider: true, label: 'MES CERCLES' },
  { name: 'Mes cercles', icon: Users, href: '/circles' },
  { name: 'Créer un cercle', icon: PlusCircle, href: '/circles/create' },
  { name: 'Rejoindre un cercle', icon: LogIn, href: '/circles/join' },
  { divider: true, label: 'FONDS' },
  { name: 'Solidarité', icon: HandHeart, href: '/solidarity' },
  { divider: true, label: 'SUIVI' },
  { name: 'Activité', icon: CreditCard, href: '/activity' },
  { name: 'Fiabilité', icon: Shield, href: '/reliability' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { divider: true, label: 'COMPTE' },
  { name: 'Profil', icon: User, href: '/profile' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Desktop Sidebar (STATIC, never collapses) ── */}
      <aside className="hidden md:flex md:flex-col bg-surface border-r border-border w-64 shrink-0 h-screen sticky top-0">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9" />
            <span className="font-heading font-extrabold text-lg text-primary-dark tracking-tight">Venega</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) => {
            if ('divider' in item) {
              return (
                <div key={i} className="pt-4 pb-1.5 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/60">{item.label}</span>
                </div>
              );
            }
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  isActive
                    ? 'bg-primary-tint text-primary font-medium'
                    : 'text-text-muted hover:bg-bg hover:text-text-main'
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg transition-colors cursor-pointer">
            <Image
              src={mockCurrentUser.avatarUrl || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80'}
              alt={mockCurrentUser.firstName}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-main truncate text-sm">
                {mockCurrentUser.firstName} {mockCurrentUser.lastName}
              </p>
              <p className="text-xs text-text-muted truncate">{mockCurrentUser.phoneNumber}</p>
            </div>
            <button className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors text-text-muted hover:text-danger">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar (overlay, no animation) ── */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-surface z-50 flex flex-col md:hidden">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <Logo className="w-9 h-9" />
                <span className="font-heading font-extrabold text-lg text-primary-dark tracking-tight">Venega</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-bg rounded-lg">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {navItems.map((item, i) => {
                if ('divider' in item) {
                  return (
                    <div key={i} className="pt-4 pb-1.5 px-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/60">{item.label}</span>
                    </div>
                  );
                }
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                      isActive
                        ? 'bg-primary-tint text-primary font-medium'
                        : 'text-text-muted hover:bg-bg hover:text-text-main'
                    }`}
                  >
                    <Icon size={19} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-primary-tint flex items-center justify-center text-primary font-semibold text-sm">
                  {mockCurrentUser.firstName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-main truncate text-sm">
                    {mockCurrentUser.firstName} {mockCurrentUser.lastName}
                  </p>
                  <p className="text-xs text-text-muted truncate">{mockCurrentUser.phoneNumber}</p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 hover:bg-bg rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 w-72 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 hover:bg-bg rounded-lg transition-colors">
                <Bell size={18} className="text-text-muted" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
