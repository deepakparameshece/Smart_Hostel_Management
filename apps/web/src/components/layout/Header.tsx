"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";

export default function Header({ title }: { title: string }) {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/users/notifications/my');
      setNotifications(res.data);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async () => {
    try {
      await apiClient.put('/users/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Error marking notifications as read:', e);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const getInitials = (firstName: string, lastName: string, email: string) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    if (email) return email[0].toUpperCase();
    return "?";
  };

  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : (user?.firstName || user?.name || user?.email || "Admin");

  const apiBase = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1$/, '') : '';
  const avatarUrl = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `${apiBase}/${user.avatar}`)
    : null;

  return (
    <header className="h-16 border-b border-surface-border flex items-center justify-between px-container-padding bg-surface-container-lowest sticky top-0 z-40 w-full">
      <div className="flex items-center gap-8">
        <h2 className="text-body-lg font-title-lg font-bold text-on-surface tracking-tight">{title}</h2>
        
        {/* Top Search bar placeholder to match dashboard layout */}
        <div className="relative hidden lg:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
          <input 
            className="pl-9 pr-4 py-1.5 bg-surface border border-surface-border rounded-full text-body-md font-body-md w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
            placeholder="Search data, students, or blocks..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest animate-pulse"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-surface-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-on-surface">Notifications</span>
                {notifications.some(n => !n.isRead) && (
                  <button 
                    onClick={handleMarkRead}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-outline text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3 rounded-lg border text-left transition-all ${
                        n.isRead 
                          ? 'bg-surface border-surface-border text-on-surface-variant' 
                          : 'bg-surface-container-low border-surface-variant text-on-surface'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight">{n.title}</p>
                      <p className="text-[10px] text-outline mt-1 leading-normal">{n.message}</p>
                      <p className="text-[8px] text-outline-variant mt-1 font-bold">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px]">apps</span>
        </button>
        
        <div className="h-6 w-px bg-surface-border"></div>

        {/* User Profile Menu */}
        <div className="relative group">
          <button className="flex items-center gap-3 pl-2 hover:opacity-95 transition-all text-left">
            <div className="text-right hidden lg:block">
              <p className="font-label-md text-label-md text-on-surface font-bold leading-tight">{userName}</p>
              <p className="text-[9px] uppercase tracking-wider text-outline font-bold mt-0.5 leading-none">
                {user?.role === 'STUDENT' ? 'Tenant' : user?.role || 'Guest'}
              </p>
            </div>
            
            <div className="w-9 h-9 rounded-full overflow-hidden border border-surface-border bg-gradient-to-tr from-primary to-secondary-container flex items-center justify-center text-xs font-bold text-white uppercase tracking-tighter shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.firstName, user?.lastName, user?.email)
              )}
            </div>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest border border-surface-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-error-container/20 hover:text-error transition-all text-sm font-semibold text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
