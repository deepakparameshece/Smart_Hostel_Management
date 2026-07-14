'use client';

import Header from "@/components/layout/Header";
import { useState } from "react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header title="Settings" />
      <main className="p-container-padding max-w-[1000px] mx-auto w-full space-y-stack-lg page-transition">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-surface-border">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-primary text-white' 
                : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Profile Settings
          </button>
          <button 
            onClick={() => setActiveTab('hostel')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'hostel' 
                ? 'bg-primary text-white' 
                : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Hostel Configuration
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'notifications' 
                ? 'bg-primary text-white' 
                : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'security' 
                ? 'bg-primary text-white' 
                : 'bg-surface-container border border-surface-border text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Security Settings
          </button>
        </div>

        {/* Content Container */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 md:p-8">
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'hostel' && <HostelForm />}
          {activeTab === 'notifications' && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">notifications_paused</span>
              <p className="text-sm font-semibold text-on-surface">Notification settings coming soon</p>
              <p className="text-xs text-outline mt-1">Configure email alerts and mobile push notifications.</p>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">admin_panel_settings</span>
              <p className="text-sm font-semibold text-on-surface">Security preferences coming soon</p>
              <p className="text-xs text-outline mt-1">Update passwords, enable 2FA and view active sessions.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileForm() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-surface-border">
        <div className="w-20 h-20 rounded-xl bg-surface-container border border-surface-border flex items-center justify-center text-outline">
          <span className="material-symbols-outlined text-[40px]">person</span>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Profile Picture</h3>
          <p className="text-xs text-outline mb-3">Upload a high resolution profile portrait.</p>
          <button className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded hover:opacity-95 transition-opacity cursor-pointer">
            Upload Avatar
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Full Name</label>
          <input 
            type="text" 
            defaultValue="Admin User" 
            className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            defaultValue="admin@hostel.com" 
            className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
          />
        </div>
      </div>
      
      <div className="pt-4">
        <button className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-95 transition-opacity shadow-sm cursor-pointer">
          Save Profile Changes
        </button>
      </div>
    </div>
  );
}

function HostelForm() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Hostel Facility Name</label>
          <input 
            type="text" 
            defaultValue="Smart Hostel Main Campus" 
            className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Total Resident Capacity</label>
          <input 
            type="number" 
            defaultValue="250" 
            className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface" 
          />
        </div>
      </div>
      
      <div>
        <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Facility Address</label>
        <textarea 
          defaultValue="123 Hostel Lane, Education District, City" 
          className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface h-24 resize-none" 
        />
      </div>
      
      <div className="pt-4">
        <button className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-95 transition-opacity shadow-sm cursor-pointer">
          Save Configuration
        </button>
      </div>
    </div>
  );
}
