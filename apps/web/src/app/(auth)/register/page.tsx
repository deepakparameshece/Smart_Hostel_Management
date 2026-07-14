"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [purpose, setPurpose] = useState("STUDENT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post('/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password,
        role: 'STUDENT',
        purpose
      });
      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed. Please check your inputs.");
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
          <p className="text-slate-500">Create your tenant account</p>
        </div>

        <form onSubmit={handleRegister} className="glass-card p-8 rounded-3xl space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">First Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-600 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Last Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-600 text-sm"
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-600 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Purpose of Stay</label>
              <select 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 text-sm"
              >
                <option value="STUDENT">Student</option>
                <option value="WORK">Work / Job</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="premium-button w-full py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-[0.6] disabled:cursor-not-allowed text-sm mt-2"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500">
          Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-500 transition-all">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
