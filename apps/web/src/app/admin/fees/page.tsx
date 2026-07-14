'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import PredictiveRiskWidget from "@/components/PredictiveRiskWidget";
import apiClient from "@/lib/api";

export default function FeeManagement() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    outstanding: 0, 
    overdueCount: 0, 
    successRate: 0 
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }
    const userObj = JSON.parse(storedUser);
    if (userObj.role !== 'ADMIN' && userObj.role !== 'WARDEN') {
      if (userObj.role === 'MESS_MANAGER') {
        window.location.href = '/mess';
      } else if (userObj.role === 'STUDENT') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/login';
      }
      return;
    }

    setUser(userObj);
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/fees');
      const data = response.data.data || response.data;
      const paymentList = Array.isArray(data) ? data : [];
      setPayments(paymentList);
      
      calculateStats(paymentList);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list: any[]) => {
    let totalRevenue = 0;
    let outstanding = 0;
    let overdueCount = 0;
    let paidCount = 0;
    const now = new Date();

    list.forEach(p => {
      if (p.status === 'PAID') {
        totalRevenue += p.amount;
        paidCount++;
      } else {
        outstanding += p.amount;
        if (new Date(p.dueDate) < now) {
          overdueCount++;
        }
      }
    });

    const totalCount = list.length;
    const successRate = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

    setStats({
      totalRevenue,
      outstanding,
      overdueCount,
      successRate
    });
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await apiClient.put(`/fees/${id}`, { 
        status: 'PAID',
        paidDate: new Date().toISOString()
      });
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'PAID') return 'bg-success-emerald/10 text-success-emerald border border-success-emerald/20';
    if (new Date(dueDate) < new Date()) return 'bg-error/10 text-error border border-error/20';
    return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
  };

  const handleGenerateInvoices = async () => {
    try {
      const now = new Date();
      await apiClient.post('/fees/generate-monthly', { 
        month: now.getMonth() + 1, 
        year: now.getFullYear() 
      });
      alert('Monthly invoices generated successfully');
      fetchPayments();
    } catch (error) {
      console.error('Error generating invoices:', error);
      alert('Failed to generate invoices');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredPayments = payments.filter(p => {
    const studentName = p.student ? `${p.student.firstName} ${p.student.lastName}` : '';
    const invoiceNum = p.invoiceNumber || '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           invoiceNum.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Header title="Revenue & Fees" />
      <main className="p-container-padding max-w-[1440px] mx-auto w-full space-y-stack-lg page-transition">
        
        {/* Header & Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-stack-lg space-y-4 md:space-y-0">
          <div>
            <p className="font-body-md text-body-md text-outline">Manage and track your hostel's financial health.</p>
          </div>
          {user?.role !== 'WARDEN' && (
            <button 
              onClick={handleGenerateInvoices}
              className="bg-primary text-on-primary px-gutter py-3 rounded-lg font-label-md text-label-md shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Generate Monthly Invoices
            </button>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
          {/* Total Revenue */}
          <div className="bg-surface-container-lowest border border-surface-border p-6 rounded-xl flex flex-col justify-between group hover:border-primary transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary-fixed rounded-lg text-primary">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <span className="font-label-md text-label-md text-success-emerald font-bold">+12.5%</span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Total Revenue</h3>
              <p className="font-headline-md text-headline-md font-bold text-on-surface">₹{stats.totalRevenue.toLocaleString()}</p>
              <div className="mt-4 w-full bg-surface-container h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Outstanding Amount */}
          <div className="bg-surface-container-lowest border border-surface-border p-6 rounded-xl flex flex-col justify-between group hover:border-primary transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-error-container/20 rounded-lg text-error">
                <span className="material-symbols-outlined text-[24px]">pending_actions</span>
              </div>
              <span className="font-label-md text-label-md text-error font-bold">-4.2%</span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Outstanding Amount</h3>
              <p className="font-headline-md text-headline-md font-bold text-on-surface">₹{stats.outstanding.toLocaleString()}</p>
              <p className="font-caption text-caption text-outline mt-1.5 font-bold uppercase tracking-wider">{stats.overdueCount} Overdue Invoices</p>
            </div>
          </div>

          {/* Payment Success Rate */}
          <div className="bg-surface-container-lowest border border-surface-border p-6 rounded-xl flex flex-col justify-between group hover:border-primary transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <span className="font-label-md text-label-md text-success-emerald font-bold">+0.8%</span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Payment Success</h3>
              <p className="font-headline-md text-headline-md font-bold text-on-surface">{stats.successRate.toFixed(1)}%</p>
              <p className="font-caption text-caption text-outline mt-1.5 font-bold uppercase tracking-wider">Last 30 days performance</p>
            </div>
          </div>
        </div>

        {/* Gemini AI Risk Analysis Widget */}
        <div className="mb-stack-lg">
          <PredictiveRiskWidget />
        </div>

        {/* Invoices Table Section */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-gutter py-stack-lg border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Recent Invoices</h3>
              <span className="bg-surface-container-highest px-2 py-0.5 rounded text-caption font-caption text-on-surface-variant font-bold">
                {filteredPayments.length} Total
              </span>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Search invoices or students..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-surface-border bg-surface rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-64 text-on-surface placeholder:text-outline"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-surface-border rounded-lg text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                <span>Filters</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-surface-border rounded-lg text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-surface-border">
                  <th className="px-gutter py-4 font-label-md text-[11px] font-bold text-outline uppercase tracking-wider">Invoice ID</th>
                  <th className="px-gutter py-4 font-label-md text-[11px] font-bold text-outline uppercase tracking-wider">Student Name</th>
                  <th className="px-gutter py-4 font-label-md text-[11px] font-bold text-outline uppercase tracking-wider">Amount</th>
                  <th className="px-gutter py-4 font-label-md text-[11px] font-bold text-outline uppercase tracking-wider">Due Date</th>
                  <th className="px-gutter py-4 font-label-md text-[11px] font-bold text-outline uppercase tracking-wider">Status</th>
                  <th className="px-gutter py-4 font-label-md text-[11px] font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-gutter py-10 text-center text-outline font-body-md">
                      Loading payments...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-gutter py-10 text-center text-outline font-body-md">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const studentName = p.student ? `${p.student.firstName} ${p.student.lastName}` : 'N/A';
                    const isOverdue = p.status !== 'PAID' && new Date(p.dueDate) < new Date();
                    const displayStatus = p.status === 'PAID' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending';

                    return (
                      <tr key={p.id} className="hover:bg-surface border-none transition-colors group">
                        <td className="px-gutter py-4">
                          <span className="font-body-md text-sm text-on-surface font-semibold">
                            #{p.invoiceNumber?.split('-')[1] || p.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-gutter py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-fixed text-primary font-bold text-[10px] flex items-center justify-center uppercase shadow-inner">
                              {getInitials(studentName)}
                            </div>
                            <span className="font-body-md text-sm text-on-surface font-medium">{studentName}</span>
                          </div>
                        </td>
                        <td className="px-gutter py-4">
                          <span className="font-body-md text-sm text-on-surface font-black">₹{p.amount?.toLocaleString()}</span>
                        </td>
                        <td className="px-gutter py-4">
                          <span className="font-body-md text-xs text-outline font-medium">
                            {new Date(p.dueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-gutter py-4">
                          <span className={`px-2.5 py-1 rounded text-caption font-bold text-[10px] uppercase tracking-wider ${getStatusColor(p.status, p.dueDate)}`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-gutter py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {p.status !== 'PAID' && user?.role !== 'WARDEN' && (
                              <button 
                                onClick={() => handleMarkAsPaid(p.id)}
                                className="px-3 py-1 rounded-lg bg-success-emerald/10 hover:bg-success-emerald text-success-emerald hover:text-white text-[10px] font-bold transition-all uppercase tracking-wider border border-success-emerald/20 cursor-pointer shadow-sm"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button className="material-symbols-outlined text-outline hover:text-primary cursor-pointer p-1">more_vert</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-gutter py-4 bg-surface-container-low flex items-center justify-between border-t border-surface-border text-xs">
            <p className="font-caption text-caption text-outline font-semibold">Showing 1-{filteredPayments.length} of {payments.length} entries</p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-surface-border rounded bg-white font-label-md text-label-md text-on-surface-variant disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-surface-border rounded bg-white font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-lowest cursor-pointer">Next</button>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
