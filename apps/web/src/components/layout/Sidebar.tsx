"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminItems = [
  { name: 'Overview', href: '/admin', icon: 'dashboard', roles: ['ADMIN', 'WARDEN'] },
  { name: 'Tenants', href: '/admin/students', icon: 'group', roles: ['ADMIN', 'WARDEN'] },
  { name: 'Rooms', href: '/admin/rooms', icon: 'bed', roles: ['ADMIN', 'WARDEN'] },
  { name: 'Revenue', href: '/admin/fees', icon: 'payments', roles: ['ADMIN', 'WARDEN'] },
  { name: 'Complaints', href: '/admin/complaints', icon: 'report_problem', roles: ['ADMIN', 'WARDEN', 'MESS_MANAGER'] },
  { name: 'Visitors', href: '/admin/visitors', icon: 'co_present', roles: ['ADMIN', 'WARDEN'] },
  { name: 'Bills', href: '/admin/bills', icon: 'receipt_long', roles: ['ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: 'settings', roles: ['ADMIN', 'WARDEN', 'MESS_MANAGER'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const filteredItems = adminItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <aside className="w-64 flex flex-col bg-surface border-r border-surface-border h-screen sticky top-0 z-45">
      {/* Brand Header */}
      <div className="p-container-padding pb-stack-lg">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-center shadow-sm group-hover:opacity-90 transition-opacity overflow-hidden">
            <img src="/logo.png" alt="SmartHostel Logo" className="w-full h-full object-cover scale-[1.2]" />
          </div>
          <div>
            <h1 className="font-title-lg text-title-lg font-bold text-primary leading-tight">SmartHostel</h1>
            <p className="font-label-md text-label-md text-text-muted">Management Pro</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 active:scale-[0.98] ${
                isActive 
                  ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-low shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-surface-border bg-surface-container-lowest/50">
        <div className="space-y-1">
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-error transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-label-md text-label-md">Sign Out</span>
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="mt-4 p-3 bg-surface-container rounded-xl border border-surface-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary-container flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase">
              {user.firstName?.[0] || user.name?.[0] || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-on-surface leading-tight truncate">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || 'Admin')}
              </p>
              <p className="text-[9px] uppercase tracking-wider text-outline font-bold mt-0.5 truncate">
                {user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
