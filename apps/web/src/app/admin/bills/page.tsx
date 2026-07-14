'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import apiClient from '@/lib/api';

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [newBill, setNewBill] = useState({
    roomId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    unitsConsumed: 0,
    ratePerUnit: 10
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, roomsRes] = await Promise.all([
        apiClient.get('/bills'),
        apiClient.get('/rooms?limit=1000')
      ]);
      setBills(billsRes.data);
      setRooms(roomsRes.data.data || roomsRes.data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await apiClient.post('/bills/generate', newBill);
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to generate bill');
    } finally {
      setGenerating(false);
    }
  };

  const getMonthName = (m: number) => {
    return new Date(2000, m - 1).toLocaleString('default', { month: 'long' });
  };

  if (loading) return <div className="p-8 text-slate-800 bg-slate-50 min-h-screen">Loading Bills...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header title="Electricity Bills" />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Room Billing</h3>
            <p className="text-slate-500 text-sm italic">Track units and generate payments for each room sensor.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="premium-button px-6 py-3 rounded-2xl font-bold text-white shadow-xl shadow-blue-500/20"
          >
            🔌 New Reading (IoT)
          </button>
        </div>

        {/* Bills Table */}
        <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Room</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Period</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Units</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-bold text-blue-600">Room {bill.room?.roomNumber}</td>
                  <td className="p-6 text-sm text-slate-700">
                    {getMonthName(bill.month)} {bill.year}
                  </td>
                  <td className="p-6 font-black text-slate-700">{bill.unitsConsumed} Units</td>
                  <td className="p-6 font-black text-emerald-600">₹{bill.totalAmount.toLocaleString()}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      bill.status === 'PAID' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="p-6 text-xs text-slate-500">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bills.length === 0 && (
            <div className="p-20 text-center text-slate-500 italic">No bill history found. Generate a reading to begin.</div>
          )}
        </div>
      </main>

      {/* Generate Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Sync IoT Reading</h2>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Room</label>
                <select 
                  required
                  value={newBill.roomId}
                  onChange={e => setNewBill({...newBill, roomId: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none text-slate-800 appearance-none transition-all"
                >
                  <option value="">Choose Room...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Month</label>
                   <input 
                      type="number" min="1" max="12"
                      value={newBill.month}
                      onChange={e => setNewBill({...newBill, month: Number(e.target.value)})}
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none text-slate-800 transition-all"
                    />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Year</label>
                   <input 
                      type="number"
                      value={newBill.year}
                      onChange={e => setNewBill({...newBill, year: Number(e.target.value)})}
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none text-slate-800 transition-all"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Units Consumed</label>
                  <input 
                    required
                    type="number" step="0.1"
                    placeholder="e.g. 150.5"
                    value={newBill.unitsConsumed}
                    onChange={e => setNewBill({...newBill, unitsConsumed: Number(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none text-slate-800 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Price Per Unit (₹)</label>
                  <input 
                    required
                    type="number" step="0.01"
                    value={newBill.ratePerUnit}
                    onChange={e => setNewBill({...newBill, ratePerUnit: Number(e.target.value)})}
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none text-slate-800 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-all">Cancel</button>
                 <button type="submit" disabled={generating} className="flex-1 py-4 premium-button text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20">
                    {generating ? 'Syncing...' : 'Generate Bill'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
