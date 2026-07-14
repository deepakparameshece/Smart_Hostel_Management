"use client";

import { useState } from "react";

export default function PredictiveRiskWidget() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchRisk = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/ai/fee-prediction/${studentId}`);
      const json = await res.json();
      setData(json);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-info-cobalt to-primary bg-primary p-6 rounded-xl border border-surface-border group w-full transition-all duration-300 shadow-sm hover:shadow-md">
      {/* AI Background Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary-container rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex-1">
          <h3 className="text-body-lg font-title-lg font-bold text-white flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Gemini Risk Analytics
          </h3>
          <p className="text-body-md text-white/80 max-w-2xl leading-relaxed">
            Predict payment delays and identify high-risk accounts using AI-driven behavioral modeling. Enter a student ID to analyze.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto self-center md:self-auto">
          <input 
            type="text"
            placeholder="Student ID..."
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="flex-1 md:w-48 bg-white/10 border border-white/25 rounded-lg px-4 py-2.5 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-sm transition-all"
          />
          <button 
            onClick={fetchRisk}
            disabled={loading}
            className="bg-white text-primary hover:bg-white/90 active:scale-95 text-sm font-bold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                Analyzing...
              </>
            ) : (
              <>
                <span>Analyze</span>
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {data && (
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
          <div className="col-span-1 border border-white/10 bg-white/5 rounded-xl p-4 flex flex-col justify-center items-center backdrop-blur-md">
            <div className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">Risk Score</div>
            <div className={`text-3xl font-black ${
              data.riskLevel === 'HIGH' ? 'text-error' : 
              data.riskLevel === 'MEDIUM' ? 'text-tertiary-fixed-dim' : 'text-secondary-fixed'
            }`}>
              {data.riskScore}
            </div>
            <div className="text-[10px] text-white/80 font-bold mt-1.5 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">{data.riskLevel} RISK</div>
          </div>
          
          <div className="col-span-1 md:col-span-3 border border-white/10 bg-white/5 rounded-xl p-5 backdrop-blur-md relative flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-white/70 uppercase font-black mb-2 tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs">analytics</span>
                AI Insight
              </div>
              <p className="text-sm text-white leading-relaxed italic">
                "{data.aiInsight}"
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-white/65 font-bold uppercase tracking-widest border-t border-white/10 pt-3">
              <span>Total Records: {data.factors?.totalPayments || 0}</span>
              <span>Overdue: {data.factors?.overdueCount || 0}</span>
              <span>Historically Late: {data.factors?.latePayments || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
