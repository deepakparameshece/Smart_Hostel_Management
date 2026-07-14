"use client";

import { useEffect, useState } from "react";

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function CustomNotificationProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalAlert = window.alert;

      window.alert = (message: string) => {
        let type: 'info' | 'success' | 'error' = 'info';
        const msgLower = message.toLowerCase();
        
        if (
          msgLower.includes('success') || 
          msgLower.includes('completed') || 
          msgLower.includes('allocated') || 
          msgLower.includes('published') || 
          msgLower.includes('copied') ||
          msgLower.includes('added')
        ) {
          type = 'success';
        } else if (
          msgLower.includes('failed') || 
          msgLower.includes('error') || 
          msgLower.includes('must') || 
          msgLower.includes('cannot') ||
          msgLower.includes('invalid')
        ) {
          type = 'error';
        }

        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = "ℹ️";
        let borderColor = "border-slate-200";
        let bgColor = "bg-white/95";
        let textColor = "text-slate-200";
        let barColor = "bg-violet-500";

        if (toast.type === 'success') {
          icon = "✅";
          borderColor = "border-emerald-500/30";
          bgColor = "bg-[#064e3b]/95";
          textColor = "text-emerald-200";
          barColor = "bg-emerald-500";
        } else if (toast.type === 'error') {
          icon = "❌";
          borderColor = "border-rose-500/30";
          bgColor = "bg-[#881337]/95";
          textColor = "text-rose-200";
          barColor = "bg-rose-500";
        }

        return (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${borderColor} ${bgColor} ${textColor} shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 relative overflow-hidden group`}
          >
            <span className="text-lg">{icon}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed pr-6">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors text-[10px]"
            >
              ✕
            </button>
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${barColor} animate-shrink-width`}></div>
          </div>
        );
      })}
    </div>
  );
}
