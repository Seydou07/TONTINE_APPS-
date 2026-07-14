'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import Image from 'next/image';
import { mockCurrentUser } from '../../../packages/types/src/mock-data';
import { Logo } from '@/components/Logo';

const sidebarItems = [
  { name: 'Tableau de bord', icon: Home, href: '/dashboard' },
  { name: 'Mes cercles', icon: Users, href: '/circles' },
  { name: 'Fonds de solidarité', icon: HandHeart, href: '/solidarity' },
  { name: 'Activité', icon: CreditCard, href: '/activity' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { name: 'Profil', icon: User, href: '/profile' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-surface border-r border-border">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="font-heading font-extrabold text-xl text-primary-dark tracking-tight">Venega</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                pathname === item.href
                  ? 'bg-primary-tint text-primary font-medium'
                  : 'text-text-muted hover:bg-bg hover:text-text-main'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg transition-colors cursor-pointer">
            <Image
              src={mockCurrentUser.avatarUrl || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80'}
              alt={mockCurrentUser.firstName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-main truncate">
                {mockCurrentUser.firstName} {mockCurrentUser.lastName}
              </p>
              <p className="text-sm text-text-muted truncate">
                {mockCurrentUser.phoneNumber}
              </p>
            </div>
            <button className="p-2 hover:bg-primary-tint rounded-lg transition-colors text-text-muted hover:text-danger">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-64 bg-surface z-50 flex flex-col md:hidden"
            >
              <div className="p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <Logo className="w-10 h-10" />
                  <span className="font-heading font-extrabold text-xl text-primary-dark tracking-tight">Venega</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-bg rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-2">
                {sidebarItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                      pathname === item.href
                        ? 'bg-primary-tint text-primary font-medium'
                        : 'text-text-muted hover:bg-bg hover:text-text-main'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 rounded-xl">
                  <Image
                    src={mockCurrentUser.avatarUrl || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80'}
                    alt={mockCurrentUser.firstName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-main truncate">
                      {mockCurrentUser.firstName} {mockCurrentUser.lastName}
                    </p>
                    <p className="text-sm text-text-muted truncate">
                      {mockCurrentUser.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-bg rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 w-80 bg-bg border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-bg rounded-lg transition-colors">
                <Bell size={20} className="text-text-muted" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
