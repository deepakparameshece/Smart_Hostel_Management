'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import apiClient from "@/lib/api";

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, OPEN, IN_PROGRESS, RESOLVED, CLOSED
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // ALL, CRITICAL, HIGH, MEDIUM, LOW
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // Fetch all complaints without query filters so we can calculate live stats and filter in memory
      const response = await apiClient.get('/complaints');
      const data = response.data.data || response.data;
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    let nextStatus = 'IN_PROGRESS';
    if (currentStatus === 'IN_PROGRESS') nextStatus = 'RESOLVED';
    else if (currentStatus === 'RESOLVED') nextStatus = 'CLOSED';
    else if (currentStatus === 'OPEN') nextStatus = 'IN_PROGRESS';

    try {
      await apiClient.put(`/complaints/${id}`, { status: nextStatus });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert('Failed to update status');
    }
  };

  const getPriorityBadgeClasses = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL': return 'bg-error-container/20 text-error';
      case 'HIGH': return 'bg-error-container/20 text-error border border-error/10';
      case 'MEDIUM': return 'bg-tertiary-fixed text-tertiary';
      default: return 'bg-surface-container-highest text-outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'PLUMBING': return 'water_drop';
      case 'ELECTRICAL': return 'bolt';
      case 'WIFI': case 'INTERNET': return 'wifi';
      case 'FURNITURE': return 'bed';
      case 'HEATING': case 'AC': case 'AC_UNIT': return 'ac_unit';
      default: return 'build';
    }
  };

  const getRoomDetails = (complaint: any) => {
    const activeAlloc = complaint.student?.allocations?.find((a: any) => a.status === 'ACTIVE');
    if (activeAlloc?.room) {
      const blockName = activeAlloc.room.floor?.block?.name || '';
      const roomNum = activeAlloc.room.roomNumber || '';
      return blockName ? `${blockName} - Room ${roomNum}` : `Room ${roomNum}`;
    }
    return 'General Area';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  // Live stats computed from all loaded complaints
  const activeIssues = complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  const pendingHigh = complaints.filter(c => (c.status === 'OPEN' || c.status === 'IN_PROGRESS') && (c.priority === 'HIGH' || c.priority === 'CRITICAL')).length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  // Filter complaints list in memory
  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    
    const studentName = c.student ? `${c.student.firstName} ${c.student.lastName}` : '';
    const roomDetails = getRoomDetails(c);
    const textQuery = searchTerm.toLowerCase();
    
    const matchesSearch = c.title?.toLowerCase().includes(textQuery) || 
                          c.category?.toLowerCase().includes(textQuery) || 
                          studentName.toLowerCase().includes(textQuery) ||
                          roomDetails.toLowerCase().includes(textQuery);
                          
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <>
      <Header title="Complaints" />
      <main className="p-container-padding max-w-[1440px] mx-auto w-full space-y-stack-lg page-transition">
        
        {/* Quick Stats & Filters Section */}
        <div className="flex flex-wrap items-end justify-between gap-gutter mb-stack-lg">
          <div className="flex gap-stack-lg overflow-x-auto hide-scrollbar pb-2">
            <div className="bg-surface-container-lowest border border-surface-border px-stack-lg py-4 min-w-[180px] rounded-lg">
              <p className="font-label-md text-[11px] font-bold text-outline mb-1 uppercase tracking-wider">Active Issues</p>
              <p className="font-display-lg text-headline-lg font-bold text-primary">{activeIssues}</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-border px-stack-lg py-4 min-w-[180px] rounded-lg">
              <p className="font-label-md text-[11px] font-bold text-outline mb-1 uppercase tracking-wider">Pending High</p>
              <p className="font-display-lg text-headline-lg font-bold text-error">{pendingHigh}</p>
            </div>
            <div className="bg-surface-container-lowest border border-surface-border px-stack-lg py-4 min-w-[180px] rounded-lg">
              <p className="font-label-md text-[11px] font-bold text-outline mb-1 uppercase tracking-wider">Resolved History</p>
              <p className="font-display-lg text-headline-lg font-bold text-success-emerald">{resolvedCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-stack-md mb-2">
            {/* Search Input */}
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input 
                className="w-full bg-surface-container-lowest border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface placeholder:text-outline" 
                placeholder="Search room or tenant..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Priority filter */}
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-surface-container-lowest border border-surface-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none cursor-pointer text-on-surface"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
            
            {/* Status filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-lowest border border-surface-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none cursor-pointer text-on-surface"
            >
              <option value="ALL">Status: All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            
            <button 
              onClick={() => { setStatusFilter("ALL"); setPriorityFilter("ALL"); setSearchTerm(""); }}
              className="bg-surface-container-lowest border border-surface-border rounded-lg p-2 hover:bg-surface transition-colors cursor-pointer flex items-center justify-center"
              title="Clear Filters"
            >
              <span className="material-symbols-outlined text-outline text-[20px]">filter_alt_off</span>
            </button>
          </div>
        </div>

        {/* Complaints Grid (Bento style card layouts) */}
        {loading ? (
          <div className="text-center py-12 text-outline font-body-md">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-outline font-body-md bg-surface-container-lowest border border-surface-border rounded-xl">No complaints match search criteria.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {filteredComplaints.map((complaint) => {
              const studentName = complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'Guest';
              const categoryIcon = getCategoryIcon(complaint.category);
              const roomInfo = getRoomDetails(complaint);
              const priorityClasses = getPriorityBadgeClasses(complaint.priority);

              return (
                <div key={complaint.id} className="complaint-card bg-surface-container-lowest border border-surface-border rounded-xl p-6 flex flex-col justify-between gap-gutter group hover:border-primary transition-all duration-300">
                  <div>
                    {/* Header line */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-unit">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityClasses}`}>
                          {complaint.priority} Priority
                        </span>
                        <h3 className="font-title-lg text-title-lg font-bold text-on-surface mt-2 group-hover:text-primary transition-colors leading-tight">
                          {complaint.title}
                        </h3>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">{categoryIcon}</span>
                      </div>
                    </div>

                    {/* Metadata lines */}
                    <div className="space-y-stack-sm text-sm border-t border-surface-border pt-4 mt-2">
                      <div className="flex justify-between text-body-md">
                        <span className="text-outline">Room:</span>
                        <span className="font-semibold text-on-surface">{roomInfo}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="text-outline">Tenant:</span>
                        <span className="font-semibold text-on-surface">{studentName}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="text-outline">Reported:</span>
                        <span className="font-semibold text-outline-variant">{formatTime(complaint.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer status line */}
                  <div className="pt-stack-lg border-t border-surface-border flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 font-bold">
                      {complaint.status === 'IN_PROGRESS' && (
                        <div className="flex items-center gap-1 text-info-cobalt text-xs font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          In Progress
                        </div>
                      )}
                      {complaint.status === 'OPEN' && (
                        <div className="flex items-center gap-1 text-error text-xs font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[16px]">error</span>
                          Open
                        </div>
                      )}
                      {complaint.status === 'RESOLVED' && (
                        <div className="flex items-center gap-1 text-success-emerald text-xs font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Resolved
                        </div>
                      )}
                      {complaint.status === 'CLOSED' && (
                        <div className="flex items-center gap-1 text-outline text-xs font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[16px]">archive</span>
                          Closed
                        </div>
                      )}
                    </div>

                    {complaint.status !== 'CLOSED' && (
                      <button 
                        onClick={() => handleUpdateStatus(complaint.id, complaint.status)}
                        className="text-primary font-label-md text-xs font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer uppercase tracking-wider"
                      >
                        {complaint.status === 'OPEN' ? 'Start Work' : complaint.status === 'IN_PROGRESS' ? 'Mark Resolved' : 'Close'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Aesthetic Insights card to match reference layout */}
            <div className="relative overflow-hidden bg-inverse-surface border border-surface-border rounded-xl p-6 flex flex-col justify-between min-h-[240px] text-left">
              {/* Graphic background dots */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-1.5 text-white/50 text-[10px] uppercase font-bold tracking-widest">
                <span className="material-symbols-outlined text-xs">analytics</span>
                Live Metrics
              </div>

              <div className="relative z-10 flex flex-col gap-unit mt-4">
                <h4 className="font-title-lg text-title-lg font-bold text-white">Efficiency Insights</h4>
                <p className="text-body-md text-surface-variant text-sm mt-1 leading-relaxed">
                  Maintenance resolution time has improved by 14% this month. Keep up the great work!
                </p>
                <button 
                  onClick={() => { setStatusFilter("RESOLVED"); }}
                  className="mt-4 w-fit bg-white text-inverse-surface px-6 py-2 rounded-lg font-label-md text-xs font-bold hover:bg-surface-container transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  View Analytics
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </>
  );
}
