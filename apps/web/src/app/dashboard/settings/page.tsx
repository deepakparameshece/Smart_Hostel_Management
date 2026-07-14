'use client';

import Header from "@/components/layout/Header";
import { useState } from "react";

export default function StudentSettings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <>
      <Header title="My Settings" />
      <main className="p-8 page-transition">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-8 mb-8 overflow-x-auto pb-4">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50/20 border border-slate-200'}`}
            >
              My Profile
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50/20 border border-slate-200'}`}
            >
              Account Security
            </button>
             <button 
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'preferences' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50/20 border border-slate-200'}`}
            >
              Room Preferences
            </button>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-slate-200/50">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Email</label>
                    <input type="text" disabled defaultValue="student@hostel.com" className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 cursor-not-allowed outline-none" />
                  </div>
                   <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Phone</label>
                    <input type="text" placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none focus:border-blue-500/50" />
                  </div>
                </div>
                <div className="pt-6">
                  <button className="premium-button px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                    Update Profile
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'security' && (
              <div className="space-y-6">
                 <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none focus:border-blue-500/50" />
                </div>
                <div className="pt-6">
                  <button className="premium-button px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                    Change Password
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'preferences' && <div className="text-slate-600 py-12 text-center">Preferences settings coming soon.</div>}
          </div>
        </div>
      </main>
    </>
  );
}
