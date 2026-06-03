"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleBack = () => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      if (referrer && referrer.includes(window.location.host)) {
        window.location.href = referrer;
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        {/* Violet Square Container with warning icon */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-20 h-20 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/35 hover:scale-105 transition-all">
            <AlertTriangle size={38} strokeWidth={2} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">
          ATTENTION
        </h1>
        
        <p className="text-slate-500 text-base sm:text-lg font-medium max-w-sm mx-auto mb-10 leading-relaxed">
          La page demandée est sous mise à jour.
        </p>

        {/* Actions - White Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-black rounded-2xl shadow-md border border-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
          
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-2xl border border-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
