'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function MessDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  const [newOption, setNewOption] = useState({
    name: '',
    mealType: 'BREAKFAST',
    pricePerPlate: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, optionsRes] = await Promise.all([
        apiClient.get('/food/stats'),
        apiClient.get('/food/options')
      ]);
      setStats(statsRes.data);
      setOptions(optionsRes.data);
    } catch (error) {
      console.error('Error fetching mess data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/food/options', newOption);
      setShowModal(false);
      setNewOption({ name: '', mealType: 'BREAKFAST', pricePerPlate: 0 });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add option. Ensure you have permissions.');
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm('Delete this food option?')) return;
    try {
      await apiClient.delete(`/food/options/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete option');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (user?.role === 'STUDENT') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-slate-800">
        <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center text-4xl mb-6 text-rose-600">🔒</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Permission Denied</h2>
        <p className="text-slate-500 max-w-md mb-8">
          You are currently logged in as a <b>Tenant</b>. Access to mess management and polling creation is restricted to Mess Managers and Administrators.
        </p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-8 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-all"
        >
          Go to Student Dashboard
        </button>
      </div>
    );
  }

  // Winner calculation
  const getWinnerForMeal = (meal: string) => {
    const winnersByVote = stats?.optionWiseBreakdown?.filter((o: any) => o.mealType === meal).sort((a: any, b: any) => b._count._all - a._count._all);
    const winner = winnersByVote?.[0];
    return options.find(o => o.id === winner?.optionId);
  };

  const getWinnerImage = (meal: string) => {
    switch (meal) {
      case 'BREAKFAST': return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlZVny4VQiM8Gz6ebjxYMDvS_WrqOBrPy7bXKAR9CmvZiUjBB_z5C-1hQ6bw2WTOadg8yDOrKbWMhb006W0H24xOzWS2Aho_OsSZcgMa-Iane1tmrNHq4BdwMCNSUtnliU2zwVMMxnPiTjXuVp1veHmDM7HNiB2BtLVCYz6CSJAF6Ts4v_5Gk0d7RQfW1V5V-k7pbOwnWc2-O_6ifqSETcgcXnEEVOnZpTLDhwpC-m1Md2HE_fvB9j3Q';
      case 'LUNCH': return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsu1rsAoCexUjfboAKQmmVBTvW7zMHRDYDLCS8z7Mo9ckg6Rli8_h5lIXKtvQu8tNJQTNbIJGIqXvT8sZiFN29WP6bAn2YZVzYzyWqsPySYZ0MjgSwnudrIs-1ivLw6Kqkx7FcHqDCuH2sZ7Ci8YYpCjUFP5xhC7MACqnFC5IoePTZD8D2-4xE_Tvs4fH0QZ1w7n289raZOXYtKQ1nwumqKi3NfI6CZQPaMiSgGcq12zgk0WWJGBOoJA';
      default: return 'https://lh3.googleusercontent.com/aida-public/AB6AXuChInGjOXX1IgSgjhhmeJt5nhX2EAtm7WYb3zKDqpf9PAavs2lN46G7647kaTra-1sfwDV1Ds3Uufv5vRuegRvJbMGenszYz2dFIYZic6emx6GSu7cHikfdfNuJiNdJk-4dw3H06dYdtvYQOVgNbJo0gsjqyk271-TSNJveGjRvwbI510f80HADs2SWbS2-st9ZFJ-e_mPEOdXwvca6lo0a7Kma15Cmu0Mxyd46tm-qSOrvD2S2JU17GQ';
    }
  };

  const getWinnerVoteCount = (meal: string) => {
    const winnersByVote = stats?.optionWiseBreakdown?.filter((o: any) => o.mealType === meal).sort((a: any, b: any) => b._count._all - a._count._all);
    return winnersByVote?.[0]?._count?._all || 0;
  };

  const totalStudents = stats?.totalStudents || 0;
  const breakfastWinner = getWinnerForMeal('BREAKFAST');
  const lunchWinner = getWinnerForMeal('LUNCH');
  const dinnerWinner = getWinnerForMeal('DINNER');

  const breakfastCost = (breakfastWinner?.pricePerPlate || 0) * totalStudents;
  const lunchCost = (lunchWinner?.pricePerPlate || 0) * totalStudents;
  const dinnerCost = (dinnerWinner?.pricePerPlate || 0) * totalStudents;
  const totalEstBudget = breakfastCost + lunchCost + dinnerCost;

  // Mock total votes from voteBreakdown
  const totalVotesCount = stats?.voteBreakdown?.reduce((acc: number, curr: any) => acc + (curr._count?._all || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header title="Mess Manager Dashboard" />
      
      <main className="p-container-padding max-w-[1440px] mx-auto w-full space-y-stack-lg page-transition">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-stack-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-1">Mess Manager Dashboard</h2>
            <p className="text-body-md text-on-surface-variant">Real-time meal polling and budget estimation for Week 24.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-surface-container border border-surface-border text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Item
            </button>
            <button 
              onClick={async () => {
                if (confirm("Publish voting results as tomorrow's official menu?")) {
                  try {
                    await apiClient.post('/food/finalize');
                    alert("Official menu published and expense reported to Admin!");
                    fetchData();
                  } catch (err) {
                    alert("Failed to finalize menu");
                  }
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">publish</span>
              Publish Official Menu Early
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="bento-grid grid grid-cols-12 gap-gutter">
          
          {/* Total Estimated Budget */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-surface-border rounded-xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Estimated Weekly Budget</p>
                <h3 className="font-display-lg text-[40px] text-primary font-bold">₹{totalEstBudget.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-surface-container rounded-lg text-primary">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-on-surface-variant">Budget Utilization</span>
                <span className="font-bold text-success-emerald">74%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-success-emerald h-full w-[74%] rounded-full"></div>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-3 italic">Calculated based on {totalVotesCount} active meal votes.</p>
            </div>
          </div>

          {/* Winning Meals Trackers */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {['BREAKFAST', 'LUNCH', 'DINNER'].map(meal => {
              const winner = getWinnerForMeal(meal);
              const imgUrl = getWinnerImage(meal);
              const votes = getWinnerVoteCount(meal);
              const price = winner?.pricePerPlate || 0;
              const totalCost = price * totalStudents;

              return (
                <div key={meal} className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-default group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-surface-container px-3 py-1 rounded text-[10px] font-bold text-primary tracking-wider">{meal}</span>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">trending_up</span>
                    </div>
                    <div 
                      className="w-full h-24 bg-cover bg-center rounded-lg mb-4" 
                      style={{ backgroundImage: `url('${imgUrl}')` }}
                    ></div>
                    <h4 className="font-title-lg text-sm font-bold text-on-surface mb-1 truncate">{winner?.name || 'No Winner Yet'}</h4>
                    <div className="flex items-center gap-1 mb-3 text-outline text-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">how_to_vote</span>
                      <span>{votes} Votes</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-surface-border">
                    <span className="text-[10px] text-outline uppercase tracking-wider">Est. Cost</span>
                    <span className="font-bold text-success-emerald text-sm">₹{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Table & Management */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-white">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Menu Options & Pricing Masterlist</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 text-outline hover:bg-surface-container rounded cursor-pointer"><span className="material-symbols-outlined">filter_list</span></button>
                <button className="p-2 text-outline hover:bg-surface-container rounded cursor-pointer"><span className="material-symbols-outlined">download</span></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Votes</th>
                    <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {options.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-outline text-sm">No food options registered yet.</td>
                    </tr>
                  ) : options.map(opt => {
                    const votes = stats?.optionWiseBreakdown?.find((b: any) => b.optionId === opt.id)?._count?._all || 0;
                    const pct = totalVotesCount > 0 ? (votes / totalVotesCount) * 100 : 0;

                    return (
                      <tr key={opt.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-on-surface">{opt.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-bold text-outline uppercase tracking-wider">{opt.mealType}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-on-surface">₹{opt.pricePerPlate}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 w-24 bg-surface-container rounded-full h-1">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className="text-[11px] text-outline font-bold">{votes}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteOption(opt.id)} 
                            className="text-outline hover:text-error transition-colors p-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Voting details */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-surface-border rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Live Poll Stats</h3>
                <div className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                  Until 10 PM
                </div>
              </div>
              
              <div className="space-y-6">
                {['BREAKFAST', 'LUNCH', 'DINNER'].map(meal => {
                  const mealOptions = stats?.optionWiseBreakdown?.filter((b: any) => b.mealType === meal) || [];
                  const totalForMeal = stats?.voteBreakdown?.find((b: any) => b.mealType === meal)?._count?._all || 0;

                  return (
                    <div key={meal} className="space-y-3">
                      <div className="flex justify-between items-center border-b border-surface-border pb-1">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{meal}</p>
                        <p className="text-[11px] text-outline font-semibold">{totalForMeal} Votes</p>
                      </div>
                      
                      <div className="space-y-2">
                        {mealOptions.length > 0 ? mealOptions.map((opt: any) => {
                          const pct = totalForMeal > 0 ? (opt._count._all / totalForMeal) * 100 : 0;
                          return (
                            <div key={opt.optionId}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-on-surface-variant font-medium">{opt.name}</span>
                                <span className="text-on-surface font-bold">{opt._count._all} v</span>
                              </div>
                              <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        }) : (
                          <p className="text-[10px] text-outline italic">No options voted yet.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button 
              onClick={async () => {
                if (confirm("Finalize meal choices and post official daily menu?")) {
                  try {
                    await apiClient.post('/food/finalize');
                    alert("Menu finalized and published successfully!");
                    fetchData();
                  } catch (err) {
                    alert("Failed to publish menu");
                  }
                }
              }}
              className="mt-6 w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 hover:border-transparent text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            >
              🚀 Publish Menu Early
            </button>
          </div>

          {/* Voter Participation Trend (Mock Graph mapping mess_manager/code.html) */}
          <div className="col-span-12 bg-surface-container-lowest border border-surface-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Voter Participation Trend</h3>
                <p className="text-xs text-outline font-medium">Monitoring student engagement levels over the last 7 days.</p>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-xs text-outline"><span className="w-2.5 h-2.5 bg-primary rounded-full"></span> This Week</span>
                <span className="flex items-center gap-1.5 text-xs text-outline"><span className="w-2.5 h-2.5 bg-surface-variant rounded-full"></span> Goal</span>
              </div>
            </div>
            <div className="h-32 flex items-end gap-4 px-4 pt-4 border-b border-surface-border">
              <div className="flex-1 bg-surface-container-high rounded-t group relative" style={{ height: "40%" }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Mon</span>
              </div>
              <div className="flex-1 bg-surface-container-high rounded-t group relative" style={{ height: "65%" }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Tue</span>
              </div>
              <div className="flex-1 bg-surface-container-high rounded-t group relative" style={{ height: "55%" }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Wed</span>
              </div>
              <div className="flex-1 bg-surface-container-high rounded-t group relative" style={{ height: "85%" }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Thu</span>
              </div>
              <div className="flex-1 bg-primary rounded-t group relative" style={{ height: "92%" }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">Fri</span>
              </div>
              <div className="flex-1 bg-surface-container rounded-t group relative" style={{ height: "15%" }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-outline">Sat</span>
              </div>
              <div className="flex-1 bg-surface-container rounded-t group relative" style={{ height: "8%" }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-outline">Sun</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Add Food Option Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6 transform transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">Add New Food Item</h3>
              <button 
                className="p-1 hover:bg-surface-container rounded text-outline cursor-pointer" 
                onClick={() => setShowModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddOption} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Item Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Quinoa Salad"
                  value={newOption.name}
                  onChange={e => setNewOption({ ...newOption, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-lg text-sm text-on-surface"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Category</label>
                  <select 
                    value={newOption.mealType}
                    onChange={e => setNewOption({ ...newOption, mealType: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-surface-border focus:border-primary outline-none rounded-lg text-sm text-on-surface"
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Est. Price (₹)</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="0.00" 
                    value={newOption.pricePerPlate || ''}
                    onChange={e => setNewOption({ ...newOption, pricePerPlate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-lg text-sm text-on-surface"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
