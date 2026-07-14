'use client';

import { useState, useEffect } from 'react';
import apiClient from "@/lib/api";

type ModalType = 'complaint' | 'fee' | 'leave' | 'profile' | 'my-complaints' | null;

export default function useStudentModals() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  const renderModals = () => {
    if (!activeModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-300">
          <button 
            onClick={closeModal}
            className="absolute top-6 right-6 text-slate-500 hover:text-slate-800 transition-colors"
          >
            ✕
          </button>
          
          {activeModal === 'complaint' && <ComplaintModal onClose={closeModal} />}
          {activeModal === 'fee' && <FeeModal onClose={closeModal} />}
          {activeModal === 'leave' && <LeaveModal onClose={closeModal} />}
          {activeModal === 'profile' && <ProfileModal onClose={closeModal} />}
          {activeModal === 'my-complaints' && <MyComplaintsModal onClose={closeModal} />}
        </div>
      </div>
    );
  };

  return { openModal, renderModals };
}

function ComplaintModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: '', category: 'PLUMBING', description: '', priority: 'MEDIUM' });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/students/me').then(res => setProfile(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/complaints', form);
      alert('Complaint submitted successfully');
      onClose();
    } catch (error: any) {
      console.error('Complaint error:', error);
      const msg = error.response?.data?.error || 'Failed to submit complaint';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const activeRoom = profile?.allocations?.[0]?.room;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Raise a Complaint</h2>
        <div className="flex flex-wrap gap-2 mt-2">
           <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-600 text-[9px] font-bold uppercase tracking-wider border border-slate-200">
             Student: {profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}
           </span>
           {activeRoom && (
             <>
               <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-blue-600 text-[9px] font-bold uppercase tracking-wider border border-blue-100">
                 Room: {activeRoom.roomNumber}
               </span>
               <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                 Rent: ₹{activeRoom.monthlyRent}
               </span>
             </>
           )}
        </div>
      </div>
      
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Issue Title</label>
        <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none focus:border-blue-500/50" placeholder="e.g. WiFi not working" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none">
            <option value="PLUMBING">Plumber (Plumbing)</option>
            <option value="ELECTRICAL">Electrician (Electrical)</option>
            <option value="WIFI">Wi-Fi / Internet</option>
            <option value="HOUSEKEEPING">Housekeeping (Cleaning)</option>
            <option value="FURNITURE">Furniture Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Priority</label>
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none text-sm font-bold">
            <option value="LOW" className="text-emerald-400">Low</option>
            <option value="MEDIUM" className="text-amber-400">Medium</option>
            <option value="HIGH" className="text-rose-400">High</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Detailed Description (Min 10 characters)</label>
        <textarea required minLength={10} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none focus:border-blue-500/50 h-32 resize-none" placeholder="Explain the problem in detail (minimum 10 characters)..." />
      </div>
      
      <button disabled={loading} className="w-full premium-button py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02]">
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>
    </form>
  );
}

function LeaveModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4 text-center py-8">
      <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-4">
        📅
      </div>
      <h2 className="text-xl font-bold text-slate-800">Leave Application</h2>
      <p className="text-sm text-slate-600 max-w-xs mx-auto mb-8">This module is currently being integrated with the hostel ERP system.</p>
      <button onClick={onClose} className="px-8 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700">Go Back</button>
    </div>
  );
}

function FeeModal({ onClose }: { onClose: () => void }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMyPayments();
  }, []);

  const fetchMyPayments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/fees/my');
      const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setPayments(list.filter((p: any) => p.status === 'PENDING'));
    } catch (err) {
      console.error('Error fetching student payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setProcessing(true);

    try {
      const finalTxnId = transactionId.trim() || 'TXN_ONLINE_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      await apiClient.post(`/fees/${selectedPayment.id}/pay`, {
        transactionId: finalTxnId,
        paymentMethod: paymentMethod || 'ONLINE'
      });
      alert('Payment processed successfully! Your fee invoice status is updated.');
      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Payment processing failed:', err);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading Invoices...</p>
      </div>
    );
  }

  if (!selectedPayment) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Pay Hostel Fees</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Select an invoice to settle</p>
        </div>

        {payments.length === 0 ? (
          <div className="py-12 text-center text-slate-600">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-sm font-bold text-slate-800 mb-1">No Pending Fees</p>
            <p className="text-xs text-slate-500">All your fee invoices are fully paid up.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {payments.map((p) => (
              <div 
                key={p.id} 
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-violet-500/30 transition-all flex justify-between items-center group"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">#{p.invoiceNumber?.split('-')[1] || p.invoiceNumber}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{p.description}</p>
                  <p className="text-[9px] text-rose-400 font-bold mt-1">Due: {new Date(p.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-800">₹{p.amount}</p>
                  <button 
                    onClick={() => { setSelectedPayment(p); setPaymentMethod('UPI'); }}
                    className="mt-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Pay Now &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-700 text-xs font-bold rounded-xl uppercase tracking-widest transition-all font-outfit">Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfirmPayment} className="space-y-6">
      <div>
        <button onClick={() => { setSelectedPayment(null); setPaymentMethod(null); }} className="text-xs text-blue-600 hover:underline font-bold mb-2">&larr; Back to Invoices</button>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Scan to Pay</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Amount: ₹{selectedPayment.amount}</p>
      </div>

      <div className="space-y-4 text-center">
        <div className="p-3 bg-white rounded-3xl w-48 h-48 mx-auto flex items-center justify-center shadow-xl border border-slate-200">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=deepak28306@oksbi%26pn=SmartHostel%26am=${selectedPayment.amount}%26cu=INR`} 
            alt="UPI QR Code" 
            className="w-[160px] h-[160px]"
          />
        </div>
        <p className="text-xs text-slate-600">Scan this QR code using any UPI app (GPay, PhonePe, Paytm) to pay <strong>₹{selectedPayment.amount}</strong>.</p>
        
        <div className="text-left">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Transaction Ref / UTR Number</label>
          <input 
            required
            type="text" 
            placeholder="e.g. 123456789012"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 outline-none focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={processing}
        className="w-full py-4 premium-button text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
      >
        {processing ? 'Processing Securely...' : 'Confirm Payment'}
      </button>
    </form>
  );
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    idType: 'AADHAR',
    address: '',
    city: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiClient.get('/students/me');
        const p = res.data;
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phone || '',
          idType: p.idType || 'AADHAR',
          address: p.address || '',
          city: p.city || ''
        });
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/students/me', form);
      alert('Profile updated successfully! Some changes may require a refresh.');
      onClose();
      window.location.reload(); // Refresh to update header and dashboard
    } catch (error: any) {
      console.error('Update profile error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="py-12 flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading Your Profile...</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
         <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-violet-500/30 flex items-center justify-center text-2xl">👤</div>
         <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Your Profile</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tenant Information</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">First Name</label>
          <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none focus:border-blue-500/50" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Last Name</label>
          <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none focus:border-blue-500/50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none focus:border-blue-500/50" placeholder="+1234567890" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Identity ID Type</label>
          <select value={form.idType} onChange={e => setForm({...form, idType: e.target.value})} className="w-full px-4 py-3 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none appearance-none">
            <option value="AADHAR">Aadhar Card</option>
            <option value="PAN">PAN Card</option>
            <option value="PASSPORT">Passport</option>
            <option value="VOTER_ID">Voter ID</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Permanent Address</label>
        <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none focus:border-blue-500/50 h-20 resize-none font-medium text-sm" placeholder="Street, Building, etc." />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Home City</label>
        <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-4 py-3 bg-slate-800 border border-slate-200 rounded-xl text-white outline-none focus:border-blue-500/50" placeholder="e.g. New York" />
      </div>

      <div className="flex gap-4 pt-2">
         <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-white/5 transition-all text-sm uppercase tracking-widest">Cancel</button>
         <button disabled={saving} className="flex-1 premium-button py-3 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 active:scale-95 transition-all outline-none text-sm uppercase tracking-widest">
           {saving ? 'Updating...' : 'Save Changes'}
         </button>
      </div>
    </form>
  );
}

function MyComplaintsModal({ onClose }: { onClose: () => void }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyComplaints() {
      try {
        const res = await apiClient.get('/complaints/my');
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setComplaints(list);
      } catch (err) {
        console.error('Error fetching student complaints:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyComplaints();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-violet-400/5 border border-blue-100';
      case 'IN_PROGRESS': return 'text-amber-400 bg-amber-400/5 border border-amber-500/20';
      case 'RESOLVED': return 'text-emerald-400 bg-emerald-400/5 border border-emerald-500/20';
      default: return 'text-slate-600 bg-slate-400/5 border border-slate-200/50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">My Complaints History</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Track status of raised complaints</p>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading History...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="py-12 text-center text-slate-600">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-sm font-bold text-slate-800 mb-1">No Complaints Found</p>
          <p className="text-xs text-slate-500">You haven't filed any complaints yet.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
          {complaints.map((c) => (
            <div 
              key={c.id} 
              className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight">{c.title}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{c.category}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusColor(c.status)}`}>
                  {c.status?.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/20">{c.description}</p>
              
              {c.resolution && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                  <p className="text-[9px] text-emerald-400 font-black uppercase tracking-wider mb-0.5">Resolution Notes</p>
                  <p className="text-xs text-emerald-300 font-medium">{c.resolution}</p>
                </div>
              )}
              
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-right mt-1">
                Raised on: {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
      <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-700 text-xs font-bold rounded-xl uppercase tracking-widest transition-all">Close</button>
    </div>
  );
}
