"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function LoadingScreen({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px] bg-transparent">
      <div className="flex flex-col items-center">
        {/* Logo and Text */}
        <div className="flex items-center gap-3 mb-6">
          <div className="px-3 py-1 border-4 border-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-3xl font-black text-indigo-600 tracking-tight leading-none">CV</span>
          </div>
          <span className="text-4xl font-light text-slate-900 dark:text-white italic lowercase tracking-tight ml-1">
            pro
          </span>
        </div>

        {/* Small Spinner Ring Under Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full border-3 border-slate-100 dark:border-slate-800 border-t-blue-500 border-r-violet-500"
        />

        {/* Loading Message */}
        <p className="mt-4 text-xs font-medium text-slate-400 uppercase tracking-widest animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
