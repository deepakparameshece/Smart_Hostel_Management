"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post('/auth/reset-password', { email, token, password });
      setMessage("Your password has been successfully reset! Redirecting to login...");
      
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to reset password. Please check your OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      
      <div className="space-y-4">
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 ml-1">6-Digit Reset OTP Code</label>
          <input 
            type="text" 
            required
            maxLength={6}
            placeholder="123456" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-600 text-center tracking-widest text-lg font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 ml-1">New Password</label>
          <input 
            type="password" 
            required
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 focus:border-blue-500/55 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-600 text-sm"
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className="premium-button w-full py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-[0.6] disabled:cursor-not-allowed text-sm"
      >
        {isLoading ? "Resetting Password..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="w-full max-w-md page-transition">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold mb-2 block tracking-tight text-slate-800">
            SmartHostel<span className="text-blue-600">.</span>
          </Link>
          <p className="text-slate-500">Set your new password</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center mt-8 text-slate-500">
          Return to <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-500 transition-all">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
