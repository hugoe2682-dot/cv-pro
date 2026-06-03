"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        {/* Warning Icon Container with micro-animation */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-24 h-24 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/30 text-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-pulse">
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 uppercase">
          ATTENTION
        </h1>
        
        <p className="text-slate-400 text-base sm:text-lg font-medium max-w-sm mx-auto mb-10 leading-relaxed">
          La page demandée est sous mise à jour.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
          
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
