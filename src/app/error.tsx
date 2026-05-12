"use client";

import { useEffect } from "react";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      {/* Back Button in Top Left */}
      <button
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium group z-10"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-3xl mb-4 rotate-3 shadow-lg shadow-red-500/10">
          <AlertCircle size={48} />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
          Oups ! <br />
          <span className="text-indigo-600">Erreur système</span>
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Désolé pour ce désagrément. Nos serveurs ont rencontré un petit problème technique lors de l'exécution.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
          <button
            onClick={() => reset()}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            <RefreshCw size={20} />
            Actualiser
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full sm:flex-1 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.98]"
          >
            Accueil
          </button>
        </div>

        {error.digest && (
          <div className="pt-8">
            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              ID: {error.digest}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
