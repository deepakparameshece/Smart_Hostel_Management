"use client";

import { useState } from "react";
import apiClient from "@/lib/api";

export default function SmartAllocationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchSuggestions = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await apiClient.post("/ai/smart-allocation", { studentId });
      setSuggestions(res.data.suggestions || []);
    } catch(e) {
      console.error(e);
      alert("Failed to fetch AI suggestions. Ensure student ID is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (roomId: string) => {
    try {
      await apiClient.post("/allocations", { studentId, roomId });
      alert("Student allocated successfully!");
      setIsOpen(false);
      window.location.reload(); // Refresh to see changes
    } catch (e) {
      console.error(e);
      alert("Failed to allocate student. Room might be full.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="premium-button px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-105 transition-all"
      >
        ✨ Smart Allocation
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-[500px] shadow-2xl relative">
            <button 
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-outfit font-bold text-white mb-2">AI Room Suggestion</h2>
            <p className="text-sm text-zinc-400 mb-6 font-medium">Enter a student ID to find the most compatible room based on their preferences.</p>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Student ID (UUID)..." 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
              <button 
                onClick={fetchSuggestions}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50 text-sm"
              >
                {loading ? "Matching..." : "Analyze"}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Top Matches</h3>
                {suggestions.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 flex flex-col gap-2 relative overflow-hidden group">
                     {i === 0 && <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">BEST MATCH</span>}
                     <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-lg">Room {s.roomNumber}</span>
                        <span className="font-black text-blue-600">{s.compatibilityScore}%</span>
                     </div>
                     <p className="text-xs text-zinc-400 leading-relaxed">{s.reason}</p>
                     <button 
                        onClick={() => handleAllocate(s.roomId)}
                        className="mt-2 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-violet-300 hover:text-white transition-colors text-[10px] font-bold text-center border border-violet-500/30 uppercase tracking-wider"
                      >
                        Allocate Student Here
                     </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
