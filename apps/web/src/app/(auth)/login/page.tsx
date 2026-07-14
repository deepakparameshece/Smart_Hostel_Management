"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on user role
      if (user.role === 'ADMIN' || user.role === 'WARDEN') {
        router.push('/admin');
      } else if (user.role === 'MESS_MANAGER') {
        router.push('/mess');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-margin-mobile bg-background text-on-surface">
      <main className="w-full max-w-[440px] flex flex-col gap-stack-lg page-transition">
        
        {/* Brand Identity Container */}
        <div className="flex flex-col items-center text-center gap-stack-sm mb-stack-md">
          <div className="flex items-center gap-unit mb-stack-sm">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-cover rounded-lg border border-primary/20 scale-[1.2] overflow-hidden" />
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">SmartHostel</h1>
          </div>
          <p className="font-body-md text-text-muted">Access your dashboard</p>
        </div>

        {/* Centered Login Card */}
        <section className="bg-surface-container-lowest border border-surface-border rounded-xl p-container-padding shadow-sm">
          <form onSubmit={handleLogin} className="flex flex-col gap-stack-lg">
            {error && (
              <div className="bg-error-container/20 border border-error/20 text-error p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Email Input Group */}
            <div className="flex flex-col gap-unit">
              <label className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-info-cobalt transition-colors text-[20px]">
                  mail
                </span>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-surface-border rounded-lg font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-info-cobalt/20 focus:border-info-cobalt transition-all text-sm" 
                  id="email" 
                  name="email" 
                  placeholder="name@example.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="flex flex-col gap-unit">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="font-label-md text-[11px] font-bold text-info-cobalt hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-info-cobalt transition-colors text-[20px]">
                  lock
                </span>
                <input 
                  className="w-full pl-10 pr-12 py-3 bg-white border border-surface-border rounded-lg font-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-info-cobalt/20 focus:border-info-cobalt transition-all text-sm" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center gap-unit mt-stack-sm">
              <input 
                className="w-4 h-4 text-info-cobalt border-surface-border rounded focus:ring-info-cobalt cursor-pointer" 
                id="remember" 
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="font-body-md text-on-surface-variant text-sm select-none cursor-pointer" htmlFor="remember">
                Remember this device
              </label>
            </div>

            {/* Primary Action */}
            <button 
              className="premium-button w-full bg-info-cobalt text-on-primary py-3 rounded-lg font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-unit text-sm cursor-pointer disabled:opacity-50" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </section>

        {/* Secondary Actions & Footnote */}
        <div className="text-center">
          <p className="font-body-md text-sm text-on-surface-variant">
            New to SmartHostel? 
            <Link href="/register" className="text-info-cobalt font-semibold hover:underline ml-1">
              Request access
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <footer className="mt-stack-lg flex items-center justify-center gap-unit opacity-60 text-outline">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span className="font-label-md text-[10px] tracking-wider font-bold">SECURE ENTERPRISE ENCRYPTION</span>
        </footer>

      </main>
    </div>
  );
}
