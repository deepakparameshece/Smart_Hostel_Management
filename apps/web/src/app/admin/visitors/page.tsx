'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import apiClient from "@/lib/api";

export default function VisitorManagement() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [newVisitor, setNewVisitor] = useState({ 
    studentId: '', 
    visitorName: '', 
    phone: '', 
    email: '', 
    purpose: '' 
  });

  useEffect(() => {
    fetchVisitors();
    fetchStudents();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await apiClient.get('/visitors');
      const data = response.data.data || response.data;
      setVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/students');
      const data = response.data.data || response.data;
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await apiClient.put(`/visitors/${id}/check-out`);
      fetchVisitors();
    } catch (error) {
      console.error('Error checking out visitor:', error);
      alert('Failed to check out visitor');
    }
  };

  const handleCreateVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { email, ...payload } = newVisitor;
      await apiClient.post('/visitors', payload);
      setShowModal(false);
      setNewVisitor({ studentId: '', visitorName: '', phone: '', email: '', purpose: '' });
      fetchVisitors();
    } catch (error) {
      console.error('Error creating visitor:', error);
      alert('Failed to create visitor pass');
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header title="Visitor & Gate Management" />
      <main className="p-container-padding max-w-[1280px] mx-auto w-full space-y-stack-lg page-transition">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
           <div>
             <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Active Passes & Logs</h3>
             <p className="text-xs text-outline mt-0.5">Track external visitor check-ins and check-outs.</p>
           </div>
           <button 
             onClick={() => setShowModal(true)}
             className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-sm w-full sm:w-auto justify-center cursor-pointer"
           >
             <span className="material-symbols-outlined text-[18px]">add_card</span>
             New Visitor Pass
           </button>
        </div>

        {/* Visitor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
             <div className="col-span-full text-center text-outline py-12 uppercase font-bold text-[10px] tracking-widest">
               Loading gate records...
             </div>
           ) : visitors.length === 0 ? (
             <div className="col-span-full text-center text-outline py-12 italic text-xs">
               No active visitor logs found for today.
             </div>
           ) : visitors.map((visitor) => (
             <div 
               key={visitor.id} 
               className="bg-surface-container-lowest border border-surface-border p-6 rounded-xl relative overflow-hidden group shadow-sm flex flex-col justify-between"
             >
                <div className="flex items-center justify-between gap-4 mb-6">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-surface-container border border-surface-border flex items-center justify-center text-primary font-bold text-lg">
                       {visitor.visitorName?.charAt(0) || '?'}
                     </div>
                     <div>
                        <h4 className="font-bold text-on-surface text-sm tracking-tight leading-tight">{visitor.visitorName}</h4>
                        <p className="text-[10px] text-outline mt-0.5">
                          Visiting: <span className="font-semibold text-on-surface">{visitor.student?.firstName} {visitor.student?.lastName}</span>
                        </p>
                     </div>
                   </div>
                   <span className="text-[10px] font-bold text-outline bg-surface-container border border-surface-border px-2 py-0.5 rounded">
                     Token V-{visitor.id.split('-').pop()?.substring(0, 4).toUpperCase()}
                   </span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs border-t border-b border-surface-border py-4">
                   <div className="flex justify-between items-center">
                      <span className="text-outline">Purpose</span>
                      <span className="font-semibold text-on-surface">{visitor.purpose || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-outline">Checked In</span>
                      <span className="font-semibold text-on-surface uppercase">{formatTime(visitor.checkIn)}</span>
                   </div>
                   {visitor.checkOut ? (
                     <div className="flex justify-between items-center">
                        <span className="text-outline">Checked Out</span>
                        <span className="font-bold text-success-emerald uppercase">{formatTime(visitor.checkOut)}</span>
                     </div>
                   ) : (
                     <div className="flex justify-between items-center">
                        <span className="text-outline">Duration</span>
                        <span className="font-semibold text-primary animate-pulse">On Premise</span>
                     </div>
                   )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                   <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      visitor.status === 'CHECKED_IN' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'bg-surface-container text-outline border border-surface-border'
                   }`}>
                      {visitor.status?.replace('_', ' ')}
                   </span>
                   
                   {visitor.status === 'CHECKED_IN' && (
                     <button 
                       onClick={() => handleCheckOut(visitor.id)}
                       className="px-3.5 py-1.5 bg-error/10 hover:bg-error text-error hover:text-white text-[10px] font-bold rounded uppercase tracking-wider border border-error/20 hover:border-transparent transition-all cursor-pointer"
                     >
                        Check Out
                     </button>
                   )}
                </div>
             </div>
           ))}
        </div>
      </main>

      {/* New Visitor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Generate Visitor Pass</h3>
                <p className="text-xs text-outline mt-0.5">Issue a temporary check-in token for a guest.</p>
              </div>
              <button className="p-1 hover:bg-surface-container rounded text-outline cursor-pointer" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateVisitor} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Hostel Resident to Visit</label>
                <select 
                  required
                  value={newVisitor.studentId}
                  onChange={e => setNewVisitor({...newVisitor, studentId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                >
                  <option value="">Choose resident...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Visitor Full Name</label>
                <input 
                  required
                  type="text" 
                  value={newVisitor.visitorName}
                  onChange={e => setNewVisitor({...newVisitor, visitorName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Contact Number</label>
                <input
                  type="text" 
                  value={newVisitor.phone}
                  onChange={e => setNewVisitor({...newVisitor, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Purpose of Entry</label>
                <input 
                  type="text" 
                  value={newVisitor.purpose}
                  onChange={e => setNewVisitor({...newVisitor, purpose: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm cursor-pointer">
                  Check In Visitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
