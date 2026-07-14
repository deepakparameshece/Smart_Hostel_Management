"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import useStudentModals from "@/hooks/useStudentModals";
import FoodPoll from "@/components/FoodPoll";

export default function TenantDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { openModal, renderModals } = useStudentModals();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userObj = JSON.parse(storedUser);
    if (userObj.role !== 'STUDENT') {
      if (userObj.role === 'ADMIN' || userObj.role === 'WARDEN') {
        router.push('/admin');
      } else if (userObj.role === 'MESS_MANAGER') {
        router.push('/mess');
      }
      return;
    }
    setUser(userObj);

    async function fetchDashboardData() {
      try {
        const [statsRes, profileRes] = await Promise.all([
          api.get('/dashboard/stats').catch(() => ({ data: null })),
          api.get('/students/me').catch(() => ({ data: null }))
        ]);
        setStats(statsRes.data);
        setProfile(profileRes.data);
        
        try {
          const menuRes = await api.get('/food/results');
          setMenu(menuRes.data);
        } catch(e) {
          console.error("Failed to load winning menu", e);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/students/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.avatar = res.data.avatar;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      
      alert('Profile picture uploaded successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Failed to upload profile picture. Please make sure it is under 5MB.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeRoom = profile?.allocations?.[0]?.room;
  const individualRent = activeRoom ? (activeRoom.monthlyRent / (activeRoom.capacity || 1)) : 0;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1$/, '') : '';
  const avatarUrl = profile?.user?.avatar 
    ? (profile.user.avatar.startsWith('http') ? profile.user.avatar : `${apiBase}/${profile.user.avatar}`)
    : null;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header title="Resident Portal" />
      
      <main className="p-container-padding max-w-[1440px] mx-auto w-full space-y-stack-lg page-transition">
        {renderModals()}

        {/* Welcome & Info Banner */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <label className="w-16 h-16 rounded-xl bg-surface-container-high border border-surface-border flex items-center justify-center text-3xl shadow-sm cursor-pointer hover:border-primary hover:scale-105 transition-all overflow-hidden relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[36px] text-outline">person</span>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] text-white font-bold transition-all tracking-wider">
                <span>CHANGE</span>
              </div>
            </label>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Welcome back, {profile?.firstName || 'Resident'}!</h2>
                <span className="px-2 py-0.5 bg-success-emerald/10 border border-success-emerald/20 text-success-emerald text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  Verified Resident
                </span>
              </div>
              <p className="text-xs text-outline font-medium mt-1">
                Room {activeRoom ? `${activeRoom.roomNumber}` : 'Not Assigned'} • Tower B
              </p>
            </div>
          </div>
          <div className="flex gap-6 border-t md:border-t-0 border-surface-border pt-4 md:pt-0 w-full md:w-auto">
            <div>
              <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">Stay Duration</p>
              <p className="text-sm font-bold text-on-surface">Aug 2025 - May 2026</p>
            </div>
            <div>
              <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">Your Split Rent</p>
              <p className="text-sm font-bold text-success-emerald">{activeRoom ? `₹${individualRent.toLocaleString()}/mo` : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-outline uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction name="Raise Complaint" icon="report_problem" onClick={() => openModal('complaint')} description="File a support or maintenance ticket" />
            <QuickAction name="My Complaints" icon="list_alt" onClick={() => openModal('my-complaints')} description="View and track your filed complaints" />
            <QuickAction name="Pay Fees" icon="payments" onClick={() => openModal('fee')} description="View and settle your hostel invoices" />
            <QuickAction name="View Profile" icon="person" onClick={() => openModal('profile')} description="Update your personal contact details" />
          </div>
        </div>

        {/* Bento Dashboard Layout */}
        <div className="space-y-6">
          
          {/* Top Section: Food Poll (Full Width) */}
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 shadow-sm">
            <FoodPoll />
          </div>

          {/* Bottom Section: Operations Summary (Three Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            
            {/* Pending Payments Widget */}
            <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Pending Payments</h3>
                  <span className="material-symbols-outlined text-error">info</span>
                </div>
                <div className="mb-4">
                  <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">Total Outstanding</p>
                  <h4 className="text-3xl font-bold text-on-surface">₹{stats?.pendingPayments > 0 ? (individualRent * stats.pendingPayments).toLocaleString() : '0'}</h4>
                </div>
                <div className="space-y-2 mb-6">
                  {stats?.pendingPayments > 0 && (
                    <>
                      <div className="flex items-center gap-2 p-2 bg-error/5 border border-error/10 text-error text-xs rounded-lg animate-fade-in">
                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                        <span>Room Rent Invoice - Unpaid</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-amber-500/5 border border-amber-500/10 text-amber-600 text-xs rounded-lg animate-fade-in">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        <span>Utilities split (June) - Unpaid</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={() => openModal('fee')}
                className="w-full py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-95 transition-opacity shadow-sm cursor-pointer"
              >
                Settle Balance
              </button>
            </div>

            {/* Active Complaints Tracker */}
            <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Active Tickets ({stats?.myComplaints || 0})</h3>
                  <span className="material-symbols-outlined text-outline">support_agent</span>
                </div>
                <div className="space-y-3">
                  {stats?.myComplaints > 0 ? (
                    <div className="flex items-center justify-between p-3 bg-surface-container/50 border border-surface-border rounded-lg">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-outline text-[20px]">ac_unit</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-on-surface truncate">AC Remote Not Working</h4>
                          <p className="text-[10px] text-outline mt-0.5">Reported 2 days ago</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[9px] font-bold rounded uppercase tracking-wider">
                        In Progress
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-outline italic text-center py-4">No active complaints found.</p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => openModal('complaint')}
                className="w-full py-2.5 bg-surface-container border border-surface-border text-on-surface text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-surface-container-high transition-colors shadow-sm cursor-pointer"
              >
                New Ticket
              </button>
            </div>

            {/* Featured Community Poster Card */}
            <div 
              className="bg-cover bg-center rounded-xl p-6 text-white min-h-[200px] flex flex-col justify-between relative overflow-hidden group shadow-sm border border-surface-border"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsu1rsAoCexUjfboAKQmmVBTvW7zMHRDYDLCS8z7Mo9ckg6Rli8_h5lIXKtvQu8tNJQTNbIJGIqXvT8sZiFN29WP6bAn2YZVzYzyWqsPySYZ0MjgSwnudrIs-1ivLw6Kqkx7FcHqDCuH2sZ7Ci8YYpCjUFP5xhC7MACqnFC5IoePTZD8D2-4xE_Tvs4fH0QZ1w7n289raZOXYtKQ1nwumqKi3NfI6CZQPaMiSgGcq12zgk0WWJGBOoJA')` }}
            >
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/55 transition-colors"></div>
              <div className="relative z-10">
                <span className="bg-primary/95 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Community Update</span>
                <h4 className="font-title-lg text-sm font-bold mt-3 leading-snug">New Rooftop Lounge Opening This Weekend!</h4>
                <p className="text-[10px] text-white/80 mt-1 leading-normal">Join us for a barbecue session on Saturday evening.</p>
              </div>
              <div className="relative z-10 pt-4">
                <button className="px-4 py-1.5 bg-white text-primary text-[10px] font-bold uppercase tracking-wider rounded hover:bg-slate-50 transition-colors cursor-pointer">
                  RSVP Today
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Small Bottom Info Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">event</span>
            </div>
            <div>
              <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Next Social Event</p>
              <h4 className="text-xs font-semibold text-on-surface">Hostel Mixer Night - Fri, 7 PM</h4>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">cleaning_services</span>
            </div>
            <div>
              <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Housekeeping</p>
              <h4 className="text-xs font-semibold text-on-surface">Scheduled - Today, 2:30 PM</h4>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">shield</span>
            </div>
            <div>
              <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Security Status</p>
              <h4 className="text-xs font-semibold text-on-surface">All Secure - Gates Close at 11 PM</h4>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function QuickAction({ name, icon, onClick, description }: any) {
  return (
    <button 
      onClick={onClick} 
      className="w-full flex items-center gap-4 p-5 rounded-xl border border-surface-border bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/[0.01] transition-all text-left group shadow-sm cursor-pointer"
    >
      <span className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-outline group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary transition-all border border-surface-border">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </span>
      <div>
        <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors block">{name}</span>
        {description && <span className="text-[10px] text-outline block mt-1 font-medium leading-tight">{description}</span>}
      </div>
    </button>
  );
}
