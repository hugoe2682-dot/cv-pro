"use client";

import { ArrowLeft, Home, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl mb-4 -rotate-3 shadow-lg shadow-indigo-500/10">
          <Search size={48} />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
          Page <span className="text-indigo-600">introuvable</span>
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Désolé, la page que vous recherchez semble avoir disparu ou l'adresse est incorrecte.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
          <button
            onClick={() => router.push("/")}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            <Home size={20} />
            Accueil
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full sm:flex-1 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.98]"
          >
            Retour
          </button>
        </div>
      </motion.div>
    </div>
  );
}
