"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { RevenueAreaChart, OccupancyPieChart } from "@/components/charts/DashboardCharts";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Header title="Dashboard Overview" />
      <main className="p-container-padding max-w-[1440px] mx-auto w-full space-y-stack-lg page-transition">
        
        {/* Page Header Description */}
        <div className="mb-stack-lg">
          <p className="font-body-md text-body-md text-on-surface-variant">Real-time performance metrics and occupancy tracking.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter mb-stack-lg">
          {/* Total Students */}
          <div className="bg-surface-container-lowest border border-surface-border p-container-padding rounded-lg flex flex-col justify-between group hover:border-primary transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-[24px]">person</span>
              </div>
              <span className="text-success-emerald bg-success-emerald/10 px-2 py-1 rounded text-label-md font-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +12%
              </span>
            </div>
            <div>
              <p className="text-outline font-label-md text-label-md uppercase tracking-widest mb-1">Total Students</p>
              <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                {stats?.totalStudents?.toLocaleString() || "0"}
              </h3>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-surface-container-lowest border border-surface-border p-container-padding rounded-lg flex flex-col justify-between group hover:border-primary transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-[24px]">bed</span>
              </div>
              <span className="text-success-emerald bg-success-emerald/10 px-2 py-1 rounded text-label-md font-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +2.3%
              </span>
            </div>
            <div>
              <p className="text-outline font-label-md text-label-md uppercase tracking-widest mb-1">Occupancy Rate</p>
              <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                {stats?.occupancyRate ? `${stats.occupancyRate.toFixed(1)}%` : "0.0%"}
              </h3>
            </div>
          </div>

          {/* Active Complaints */}
          <div className="bg-surface-container-lowest border border-surface-border p-container-padding rounded-lg flex flex-col justify-between group hover:border-primary transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-error transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-[24px]">report_problem</span>
              </div>
              <span className="text-success-emerald bg-success-emerald/10 px-2 py-1 rounded text-label-md font-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_down</span>
                -3
              </span>
            </div>
            <div>
              <p className="text-outline font-label-md text-label-md uppercase tracking-widest mb-1">Active Complaints</p>
              <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                {stats?.pendingComplaints?.toString() || "0"}
              </h3>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-surface-container-lowest border border-surface-border p-container-padding rounded-lg flex flex-col justify-between group hover:border-primary transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <span className="text-success-emerald bg-success-emerald/10 px-2 py-1 rounded text-label-md font-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +8.5%
              </span>
            </div>
            <div>
              <p className="text-outline font-label-md text-label-md uppercase tracking-widest mb-1">Monthly Revenue</p>
              <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                ₹{stats?.monthlyRevenue?.toLocaleString() || "0"}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Revenue Analysis chart card */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-surface-border rounded-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-surface-border flex justify-between items-center">
              <div>
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Revenue Analysis</h3>
                <p className="text-label-md font-label-md text-outline">Fiscal performance vs previous month</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-label-md font-label-md rounded border border-surface-border hover:bg-surface transition-colors cursor-pointer">Week</button>
                <button className="px-3 py-1 text-label-md font-label-md rounded border border-primary bg-primary text-on-primary font-bold cursor-pointer">Month</button>
              </div>
            </div>
            <div className="p-6 flex-1 min-h-[300px] flex items-center">
              <div className="w-full">
                <RevenueAreaChart />
              </div>
            </div>
          </div>

          {/* Occupancy by Block Donut chart card */}
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Occupancy by Block</h3>
              <p className="text-label-md font-label-md text-outline">Resource allocation breakdown</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full">
                <OccupancyPieChart />
              </div>
              {/* Custom Legend to match template design */}
              <div className="mt-4 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-violet-500"></span>
                    <span className="text-body-md font-body-md text-on-surface font-semibold">Block Alpha</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-bold">36%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-body-md font-body-md text-on-surface font-semibold">Block Bravo</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-bold">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-body-md font-body-md text-on-surface font-semibold">Block Charlie</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-bold">17%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-body-md font-body-md text-on-surface font-semibold">Block Delta</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-bold">17%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities/Alerts Section */}
        <div className="mt-gutter mb-container-padding">
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-surface-border flex justify-between items-center">
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">System Alerts</h3>
              <button className="text-primary font-label-md text-label-md hover:underline font-bold cursor-pointer">View All Logs</button>
            </div>
            <div className="divide-y divide-surface-border">
              {/* Alert 1 */}
              <div className="p-6 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
                <div className="flex-1">
                  <p className="text-body-md font-body-md text-on-surface">Monthly revenue target achieved for Block Alpha.</p>
                  <p className="text-[10px] text-outline uppercase font-bold mt-1">14 minutes ago</p>
                </div>
                <span className="material-symbols-outlined text-outline cursor-pointer">more_vert</span>
              </div>
              {/* Alert 2 */}
              <div className="p-6 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                </div>
                <div className="flex-1">
                  <p className="text-body-md font-body-md text-on-surface">New student allocation pending review for Room 204.</p>
                  <p className="text-[10px] text-outline uppercase font-bold mt-1">2 hours ago</p>
                </div>
                <span className="material-symbols-outlined text-outline cursor-pointer">more_vert</span>
              </div>
              {/* Alert 3 */}
              <div className="p-6 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
                <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div className="flex-1">
                  <p className="text-body-md font-body-md text-on-surface">Water maintenance scheduled for Block Delta this weekend.</p>
                  <p className="text-[10px] text-outline uppercase font-bold mt-1">Yesterday</p>
                </div>
                <span className="material-symbols-outlined text-outline cursor-pointer">more_vert</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
