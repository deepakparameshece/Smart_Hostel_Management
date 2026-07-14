"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (['ADMIN', 'WARDEN'].includes(user.role)) {
      return '/admin';
    }
    return '/dashboard';
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col overflow-x-hidden selection:bg-primary/20">
      {/* Top Navigation Bar */}
      <header 
        className={`flex justify-between items-center w-full px-container-padding h-16 sticky top-0 z-50 transition-all duration-300 border-b border-surface-border ${
          scrolled 
            ? 'shadow-md bg-white/95 backdrop-blur-[10px]' 
            : 'bg-surface-container-lowest'
        }`}
      >
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-cover rounded-lg border border-primary/20 scale-[1.2] overflow-hidden" />
          <span className="font-headline-md text-headline-md font-extrabold text-primary tracking-tight">SmartHostel</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link className="text-primary border-b-2 border-primary pb-1 font-label-md text-label-md transition-all" href={getDashboardLink()}>Overview</Link>
          <Link className="text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all" href={getDashboardLink()}>Analytics</Link>
          <Link className="text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all" href={getDashboardLink()}>Reports</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">apps</button>
          <Link href={getDashboardLink()} className="w-8 h-8 rounded-full border border-surface-border overflow-hidden bg-surface-dim block">
            <img 
              className="w-full h-full object-cover" 
              alt="User Avatar" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqV46Y8kDqInRexKbMRfuJeZ2JEYc-vHxxjGhs6ySgQAks7-8SgrydYue7J8y80JivFPVaLya9FeUCjuMLidl3OzNhoW-eZ7BC1FJBLnm5qfe4V3BR-VDukV5omwJUTPslzeUaNHCZZJfI8pHnzk8xkEMn3U78mKzgrqeg35-zK2TVsfG0vujjPlPoLuqalh1wA_EWqhWwMXva3zol2UdNA28YTE3JGisfnEdC50ZXa_je4P8DRmGEnw"
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-surface">
        <div className="relative z-10 max-w-[1440px] w-full px-container-padding grid lg:grid-cols-12 gap-gutter items-center py-12 lg:py-0">
          {/* Hero Content */}
          <div className="lg:col-span-6 space-y-stack-lg text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <span className="font-label-md text-label-md uppercase tracking-widest">Version 4.0 Now Live</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface max-w-xl">
              SmartHostel. <span className="text-primary">Elevated.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
              The all-in-one platform for modern student accommodation. Experience a refined management ecosystem designed for precision, speed, and institutional growth.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href={getDashboardLink()} 
                className="bg-primary-container text-on-primary font-title-lg text-title-lg px-8 py-4 rounded hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-sm font-semibold"
              >
                Launch System
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link 
                href="#features" 
                className="bg-transparent border border-surface-border text-on-surface font-title-lg text-title-lg px-8 py-4 rounded hover:bg-surface-container-low transition-all active:scale-95 font-semibold"
              >
                Explore Plan
              </Link>
            </div>
            {/* Trust Badges */}
            <div className="pt-12 border-t border-surface-border flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="font-label-md text-label-md">TRUSTED BY LEADERS:</span>
              <div className="flex gap-6">
                <span className="material-symbols-outlined text-3xl">corporate_fare</span>
                <span className="material-symbols-outlined text-3xl">school</span>
                <span className="material-symbols-outlined text-3xl">apartment</span>
              </div>
            </div>
          </div>
          {/* Bento Grid Visualization */}
          <div className="lg:col-span-6 hidden lg:block">
            <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-surface-border group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuJkalSePd1PVaT8TSpDgzmwcmJiu0R8yy1nH6bjVfa2zgLo91ZDcQjM24eIdztNPGQw2LBh-OVfV9XPgt2_83NVweh0KZpNtOGQjyF09ntc8d1ayDv5hxy0oF0KPH16Mh4-t2X_sxqSD-U26Uc95_WD3R4ByRXEuCA7bb6mfObNyaDpqXJEDrYRRhDk7IbplmYzVXN3zplDP2DSnqXv61N1L2EZdgYfc2m5tJvg-aCicn203IE_kZVxRrAGqP043Jn78" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Modern Campus Amphitheater" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white text-left">
                <p className="font-label-md text-label-md uppercase tracking-widest mb-2">Premium Facilities</p>
                <h3 className="font-headline-md text-headline-md">Main Entrance</h3>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Value Proposition Section */}
      <section id="features" className="bg-white py-24 border-t border-surface-border">
        <div className="max-w-[1440px] mx-auto px-container-padding">
          <div className="grid md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center text-primary bg-primary/5 rounded">
                <span className="material-symbols-outlined text-3xl">analytics</span>
              </div>
              <h3 className="font-headline-md text-headline-md">Deep Analytics</h3>
              <p className="text-on-surface-variant leading-relaxed">Granular insights into revenue, occupancy, and maintenance patterns across your entire portfolio.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center text-primary bg-primary/5 rounded">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h3 className="font-headline-md text-headline-md">Rapid Allocation</h3>
              <p className="text-on-surface-variant leading-relaxed">Automated room assignment engine that optimizes for community dynamics and preferences.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center text-primary bg-primary/5 rounded">
                <span className="material-symbols-outlined text-3xl">shield_person</span>
              </div>
              <h3 className="font-headline-md text-headline-md">Tenant Safety</h3>
              <p className="text-on-surface-variant leading-relaxed">Enterprise-grade security protocols for managing sensitive student data and access controls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Image */}
      <section className="bg-surface py-24 border-t border-surface-border">
        <div className="max-w-[1440px] mx-auto px-container-padding">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display-lg text-display-lg text-on-surface">Life at <span className="text-primary">SmartHostel</span></h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Experience a secure, modern, and vibrant community designed for academic excellence and personal growth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
            <div className="md:col-span-8 relative rounded-2xl overflow-hidden group border border-surface-border min-h-[300px]">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw9pz13VnVCx13-fxo8HzBTt9F2d4aKLM9FUJU13KSjmj061gwulglJQxnj0DXcw3pQLvxGQsA1I0zGtnK-gCfCaAeJj6YygDYvU2BjApOdlUNPiuVF2shjRxr0HYVmQ5MUg2J1DEY9f8nNQUOKKGI88MLy2W5LCMIJq44ZBZ6JAMau-PtfVsOtj-QM1GFYR0zSCqvZtoK6UkNC63TLEeyi77OpmNzqqLl9s-098hf8HR_hd29E8eWRuN2Hv67ncqzY1E" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Hostel Exterior" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white text-left">
                <p className="font-label-md text-label-md uppercase">Modern Living Spaces</p>
                <h4 className="font-title-lg text-title-lg">Academic-Focused Rooms</h4>
              </div>
            </div>
            
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden group border border-surface-border min-h-[300px]">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjJ37e_MVoOBuLSdyLJchggkI8BA52dF0cf5WNc50fnseZb9_CagCNd9pMdUvrA4RF-_pgeEkfduAeWjk2OJyp8w_CWffN7iCV1qXWpBDz9r_Wj7QFbRU6E_jKT129DJHywnCKyVxJwGpwGMnbzbFluKzXXR5lTOy82uA_akJOIQFF6SQpUBVxYRK50eg1I9rtvNllb2Hf1askOmUEa9eChM8WzXZAInEcxNr7R-qO0735kkgYB68doT8FYnRX0TPhSLk" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Biometric Security" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white text-left">
                <p className="font-label-md text-label-md uppercase">Secure Campus</p>
                <h4 className="font-title-lg text-title-lg">Collaborative Courtyard</h4>
              </div>
            </div>
            
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden group border border-surface-border min-h-[300px]">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjhAyIEUIVQi5Nj3SJspX6T11zQ7H7rRJg8D6jkxLndl4b7LiwSQU-N-uvi86Y1Vgyrke1kCgJJIiM6x_-Xtlx_6bZkmU8cFfOAOs4xXXGrLyqrU_hFXUUizcsdZA8sStVnIAAZV9ZUDVXjjnt7llAYUbpSbbscIkwLNPF3ocHkHq9abb1sBsD3Ya5OqDmpWkH5FyOAvxDMqN9NNFK9BTmk5y1zeg1ZA683Vp6H9MU-KUtKOFPk3qeHEDN_rJAd7NWxYg" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Campus Buildings" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white text-left">
                <p className="font-label-md text-label-md uppercase">Infrastructure</p>
                <h4 className="font-title-lg text-title-lg">Premium Accommodations</h4>
              </div>
            </div>
            
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden group border border-surface-border min-h-[300px]">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcSRZfCo2TkPgICDYFu_E2J2Y4roxLU2A1X5aMmEWNJ-Pq3HGZrEVK1ubLLuYtQOgVx9Z-kHJGkydRHksstTNi44FwxOvvFSV6n2NqG7QACSVfd2U73xvtFl2WnKuH99gjNVl-ZVz9MRYHKlKCy95sd1BU5ELhQC5dMbWO8jWzcxrKL5pDzazjWQe00euQZofEF06PwkZmgdVgoGbjzM1qhMPL6-bOZ5ggE0URLPJkzjUlFZz_q5rwJQonWDDDq-eFBVQ" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Hallway" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white text-left">
                <p className="font-label-md text-label-md uppercase">Interiors</p>
                <h4 className="font-title-lg text-title-lg">Modern Infrastructure</h4>
              </div>
            </div>
            
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden group border border-surface-border min-h-[300px]">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCROvIluBWwonVSaO0PgUMUzBGJGRTiMhaLptX-ZMp9ktvW5AGvEIMBZAJUiCD734W2AMFsCgVN8lQHqevsA7kS9UYfHa2uDyJQRyGY6Sxz2cQ7Y5y3Jd3OunhFM12ABA4NDp7-sXUm21DNIkLOK472Vy2X-wPC_N7TmILeQGrkK8x6NLrDAKW0Ek-mDtiPZde8EClV41BxXgrZLZ-sqR-Q3GMpogbeLXN_FHOzOjNQwTb5JvVEdi5o6lVVI-CLTooTSEI" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Entrance" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white text-left">
                <p className="font-label-md text-label-md uppercase">Welcome</p>
                <h4 className="font-title-lg text-title-lg">Secure Entryway</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface text-on-surface-variant py-16">
        <div className="max-w-[1440px] mx-auto px-container-padding flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-cover rounded-lg border border-primary/20 scale-[1.2] overflow-hidden" />
              <span className="font-title-lg text-title-lg font-bold text-white tracking-tight">SmartHostel</span>
            </div>
            <p className="max-w-xs text-sm text-on-surface-variant">Empowering property managers with refined technology for the modern student housing era.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 text-left">
            <div className="space-y-4">
              <h4 className="text-white font-label-md text-label-md uppercase">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link className="hover:text-primary transition-colors" href={getDashboardLink()}>Launch System</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#features">Pricing Plans</Link></li>
                <li><Link className="hover:text-primary transition-colors" href={getDashboardLink()}>API Docs</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-label-md text-label-md uppercase">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link className="hover:text-primary transition-colors" href="#">About Us</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Case Studies</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-label-md text-label-md uppercase">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-container-padding mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <span>© 2024 SmartHostel Pro. All rights reserved.</span>
          <div className="flex gap-4">
            <Link className="hover:text-white transition-colors" href="#">LinkedIn</Link>
            <Link className="hover:text-white transition-colors" href="#">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
