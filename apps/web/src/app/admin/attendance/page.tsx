'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import apiClient from "@/lib/api";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, leave: 0 });
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all students
      const studentsRes = await apiClient.get('/students');
      const studentsData = studentsRes.data.data || studentsRes.data;
      setStudents(Array.isArray(studentsData) ? studentsData : []);

      // Fetch today's attendance
      const attendanceRes = await apiClient.get(`/attendance?date=${today}`);
      const attendanceData = attendanceRes.data.data || attendanceRes.data;
      
      const attMap: Record<string, any> = {};
      let p = 0, a = 0, l = 0;
      
      if (Array.isArray(attendanceData)) {
        attendanceData.forEach((rec: any) => {
          attMap[rec.studentId] = rec;
          if (rec.status === 'PRESENT') p++;
          else if (rec.status === 'ABSENT') a++;
          else if (rec.status === 'LEAVE') l++;
        });
      }
      
      setAttendance(attMap);
      setStats({ present: p, absent: a, leave: l });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: string) => {
    try {
      await apiClient.post('/attendance/mark', {
        studentId,
        date: today,
        status
      });
      
      // Update local state and stats
      const oldStatus = attendance[studentId]?.status;
      setAttendance(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], status, updatedAt: new Date() }
      }));

      setStats(prev => {
        const newStats = { ...prev };
        if (oldStatus === 'PRESENT') newStats.present--;
        else if (oldStatus === 'ABSENT') newStats.absent--;
        else if (oldStatus === 'LEAVE') newStats.leave--;

        if (status === 'PRESENT') newStats.present++;
        else if (status === 'ABSENT') newStats.absent++;
        else if (status === 'LEAVE') newStats.leave++;
        
        return newStats;
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  const handleMarkAllPresent = async () => {
    const unmarkedStudents = students.filter(s => !attendance[s.id]);
    if (unmarkedStudents.length === 0) return;

    try {
      const records = unmarkedStudents.map(s => ({
        studentId: s.id,
        date: today,
        status: 'PRESENT'
      }));

      await apiClient.post('/attendance/bulk-mark', { records });
      fetchData(); // Refresh all
    } catch (error) {
      console.error('Error bulk marking attendance:', error);
      alert('Failed to mark all as present');
    }
  };

  return (
    <>
      <Header title="Daily Attendance" />
      <main className="p-8 page-transition">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
           <div>
              <h3 className="text-3xl font-black text-white tracking-tighter">Attendance Portal</h3>
              <p className="text-sm text-slate-500 font-bold">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &bull; Session Active
              </p>
           </div>
           
           <div className="flex gap-3">
              <button className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 hover:text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest">
                 Export Report
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="glass-card p-6 rounded-3xl border border-slate-200/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-500">✅</div>
              <div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Present</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.present}</p>
              </div>
           </div>
           <div className="glass-card p-6 rounded-3xl border border-slate-200/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl text-rose-500">❌</div>
              <div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Absent</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.absent}</p>
              </div>
           </div>
           <div className="glass-card p-6 rounded-3xl border border-slate-200/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-blue-100 flex items-center justify-center text-xl text-blue-600">✈️</div>
              <div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">On Leave</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.leave}</p>
              </div>
           </div>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50">
           <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Student List</h4>
              <div className="flex gap-2">
                 <button 
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                 >
                   Mark Unmarked Present
                 </button>
              </div>
           </div>
           
           <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 text-center text-slate-500">Loading student attendance list...</div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No students found in the database.</div>
              ) : students.map((s) => {
                const record = attendance[s.id];
                const status = record?.status || 'UNMARKED';
                const name = `${s.firstName} ${s.lastName}`;
                const activeAllocation = s.allocations?.find((a: any) => a.status === 'ACTIVE');
                const roomInfo = activeAllocation ? `Room ${activeAllocation.room?.roomNumber}` : 'Unassigned';

                return (
                 <div key={s.id} className="p-6 flex items-center justify-between hover:bg-slate-800/20 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-500">
                          {name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-white tracking-tight leading-tight">{name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{roomInfo}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-6">
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Status</p>
                          <p className={`text-xs font-bold ${status === 'UNMARKED' ? 'text-slate-600' : 'text-slate-700'}`}>
                            {status === 'UNMARKED' ? 'Not Marked' : status}
                          </p>
                       </div>
                       
                       <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          {[
                            { key: 'PRESENT', label: 'P', color: 'bg-emerald-500 shadow-emerald-500/20' },
                            { key: 'ABSENT', label: 'A', color: 'bg-rose-500 shadow-rose-500/20' },
                            { key: 'LEAVE', label: 'L', color: 'bg-violet-500 shadow-blue-500/20' }
                          ].map((btn) => {
                             const active = status === btn.key;
                             return (
                                <button 
                                  key={btn.key} 
                                  onClick={() => handleMarkAttendance(s.id, btn.key)}
                                  className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                                    active ? `${btn.color} text-white shadow-lg` : 'text-slate-600 hover:text-slate-700 hover:bg-slate-800'
                                  }`}
                                >
                                   {btn.label}
                                </button>
                             )
                          })}
                       </div>
                    </div>
                 </div>
              )})}
           </div>
        </div>
      </main>
    </>
  );
}
