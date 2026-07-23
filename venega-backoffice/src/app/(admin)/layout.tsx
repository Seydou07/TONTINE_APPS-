'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Circle, CreditCard,
  HandHeart, BarChart3, Shield, Bell, Menu, X, LogOut, ChevronRight, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { ToastProvider } from '@/lib/admin-store';

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Utilisateurs', icon: Users, href: '/users' },
  { label: 'KYC', icon: UserCheck, href: '/kyc' },
  { label: 'Cercles', icon: Circle, href: '/circles' },
  { label: 'Transactions', icon: CreditCard, href: '/transactions' },
  { label: 'Solidarité', icon: HandHeart, href: '/solidarity' },
  { label: 'Rapports', icon: BarChart3, href: '/reports' },
  { label: 'Audit', icon: Shield, href: '/audit' },
];

const titles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/users': 'Utilisateurs',
  '/kyc': 'Vérification KYC',
  '/circles': 'Cercles',
  '/transactions': 'Transactions',
  '/solidarity': 'Solidarité',
  '/reports': 'Rapports',
  '/audit': 'Journal d\'audit',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const pageTitle = titles[pathname] || 'Venega Admin';

  useEffect(() => {
    const token = localStorage.getItem('venega_admin_token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('venega_admin_token');
    localStorage.removeItem('venega_admin_user');
    router.push('/login');
  };

  if (isAuthed === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50/80">
        {/* Desktop sidebar */}
        <aside className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-100 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[260px]'}`}>
          <div className={`h-16 flex items-center border-b border-gray-100 ${collapsed ? 'justify-center px-2' : 'px-5 gap-3'}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            {!collapsed && (
              <>
                <span className="font-semibold text-gray-900 text-[15px] tracking-tight">Venega</span>
                <span className="ml-auto text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Admin</span>
              </>
            )}
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                    active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && active && <ChevronRight size={14} className="ml-auto text-emerald-400" />}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <div
              className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}
              onClick={handleLogout}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">AD</div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">Admin Venega</p>
                    <p className="text-[11px] text-gray-400 truncate">Super admin</p>
                  </div>
                  <LogOut size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
                </>
              )}
              {collapsed && <LogOut size={18} className="text-gray-500" />}
            </div>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-[260px] bg-white z-50 lg:hidden flex flex-col shadow-xl">
              <div className="h-16 px-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-[15px]">Venega</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {nav.map((item) => {
                  const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                      <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-gray-100">
                <div
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">AD</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">Admin Venega</p>
                    <p className="text-[11px] text-gray-400 truncate">Super admin</p>
                  </div>
                  <LogOut size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-100 px-4 lg:px-6 flex items-center shrink-0">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-3">
              <Menu size={18} className="text-gray-600" />
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 mr-3 transition-colors" title={collapsed ? 'Déplier le menu' : 'Plier le menu'}>
              {collapsed ? <PanelLeftOpen size={18} className="text-gray-500" /> : <PanelLeftClose size={18} className="text-gray-500" />}
            </button>
            <h1 className="text-[15px] font-semibold text-gray-900 tracking-tight">{pageTitle}</h1>
            <div className="flex items-center gap-2 ml-auto">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell size={18} className="text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[11px] font-bold cursor-pointer hover:shadow-md transition-shadow">
                AD
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
