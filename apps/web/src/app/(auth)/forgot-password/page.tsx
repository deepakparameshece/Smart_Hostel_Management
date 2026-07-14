"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    setPreviewUrl(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage("A password reset OTP code has been generated. Check server terminal console logs to view the code.");
      
      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl);
        setMessage("A password reset OTP has been generated. Click the inbox preview link below to copy the OTP.");
      }

      // Auto redirect to reset password page after 4 seconds if previewUrl exists so user has time to click it
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, res.data.previewUrl ? 6000 : 2500);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to initiate password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="w-full max-w-md page-transition">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold mb-2 block tracking-tight text-slate-800">
            SmartHostel<span className="text-blue-600">.</span>
          </Link>
          <p className="text-slate-500">Recover your account password</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-xl text-sm text-center">
              {message}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="john.doe@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-600 text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="premium-button w-full py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-[0.6] disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? "Sending OTP Code..." : "Send Reset OTP"}
          </button>

          {previewUrl && (
            <div className="pt-2 text-center border-t border-slate-200">
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-emerald-600 text-slate-800 font-black text-xs uppercase tracking-wider rounded-lg shadow-md hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95"
              >
                View Simulated Email Inbox
              </a>
            </div>
          )}
        </form>

        <p className="text-center mt-8 text-slate-500">
          Return to <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-500 transition-all">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
