"use client";

import { X, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
}

export default function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Annuler",
  type = "info",
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative"
          >
            <button 
              onClick={onCancel}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center space-y-6">
              {/* Icon Container */}
              <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg transition-all ${
                type === "danger" ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                type === "warning" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" :
                type === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" :
                "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
              }`}>
                {type === "danger" && <AlertCircle size={40} />}
                {type === "warning" && <AlertTriangle size={40} />}
                {type === "success" && <CheckCircle2 size={40} />}
                {type === "info" && <Info size={40} />}
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">
                {message}
              </p>

              <div className="space-y-3 pt-4">
                <button 
                  onClick={onConfirm}
                  className={`w-full py-5 text-white font-black rounded-3xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                    type === "danger" ? "bg-red-600 hover:bg-red-500 shadow-red-500/20" :
                    type === "warning" ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20" :
                    type === "success" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" :
                    "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                  }`}
                >
                  {confirmText}
                </button>

                <button 
                  onClick={onCancel}
                  className="w-full py-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-bold transition-colors"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
