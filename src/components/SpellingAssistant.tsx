"use client";

import React, { useState } from "react";
import { Sparkles, AlertCircle, CheckCircle2, Loader2, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpellingAssistantProps {
  text: string;
  onApplyCorrection: (newText: string) => void;
  fieldName: string;
}

export default function SpellingAssistant({ text, onApplyCorrection, fieldName }: SpellingAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleCheck = async () => {
    if (!text || text.trim() === "") return;
    setIsLoading(true);
    setSuccessMessage("");
    setHasChecked(true);
    setIsOpen(true);
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
        if ((data.matches || []).length === 0) {
          setSuccessMessage("Félicitations ! Aucune faute d'orthographe ou de conjugaison détectée dans cette section.");
          setTimeout(() => setSuccessMessage(""), 5000);
          setIsOpen(false);
        }
      }
    } catch (e) {
      console.error("Spelling check error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCorrection = (match: any, replacement: string) => {
    const before = text.substring(0, match.offset);
    const after = text.substring(match.offset + match.length);
    const newText = before + replacement + after;
    onApplyCorrection(newText);

    // Filter out the applied match and shift offsets of remaining matches
    const diff = replacement.length - match.length;
    const updatedMatches = matches
      .filter((m) => m.offset !== match.offset)
      .map((m) => {
        if (m.offset > match.offset) {
          return { ...m, offset: m.offset + diff };
        }
        return m;
      });

    setMatches(updatedMatches);
    if (updatedMatches.length === 0) {
      setSuccessMessage("Toutes les corrections ont été appliquées avec succès !");
      setTimeout(() => setSuccessMessage(""), 4000);
      setIsOpen(false);
    }
  };

  const ignoreMatch = (offset: number) => {
    const updatedMatches = matches.filter((m) => m.offset !== offset);
    setMatches(updatedMatches);
    if (updatedMatches.length === 0) {
      setIsOpen(false);
    }
  };

  if (!text || text.trim() === "") return null;

  return (
    <div className="mt-2 w-full">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCheck}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900/50 text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Sparkles size={13} className="text-indigo-500" />
          )}
          Vérifier l'orthographe & conjugaison
        </button>

        {isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            Masquer les corrections
          </button>
        )}
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corrections List */}
      <AnimatePresence>
        {isOpen && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-500" />
                  {matches.length} correction{matches.length > 1 ? "s" : ""} disponible{matches.length > 1 ? "s" : ""}
                </span>
                <span className="text-[10px] text-slate-400 italic">Cliquez sur une suggestion pour l'appliquer</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {matches.map((match, idx) => {
                  const errorWord = text.substring(match.offset, match.offset + match.length);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl space-y-2.5 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Dans le texte :{" "}
                            <span className="font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              ...{" "}
                              <span className="text-red-500 dark:text-red-400 font-bold underline decoration-wavy decoration-red-400">
                                {errorWord}
                              </span>{" "}
                              ...
                            </span>
                          </p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {match.message}
                          </p>
                          {match.rule?.description && (
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              Règle : {match.rule.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => ignoreMatch(match.offset)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                          title="Ignorer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Suggestions list */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 tracking-wider mr-1">
                          Suggestions :
                        </span>
                        {match.replacements && match.replacements.length > 0 ? (
                          match.replacements.slice(0, 4).map((rep: any, rIdx: number) => (
                            <button
                              key={rIdx}
                              type="button"
                              onClick={() => applyCorrection(match, rep.value)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-600 text-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:text-white text-xs font-bold rounded-lg border border-indigo-100/60 dark:border-indigo-900/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
                            >
                              <span>{rep.value}</span>
                              <ChevronRight size={10} className="opacity-50" />
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Aucune suggestion automatique</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
