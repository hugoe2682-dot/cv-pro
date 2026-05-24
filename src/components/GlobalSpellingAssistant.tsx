"use client";

import React, { useState } from "react";
import { Wand2, Loader2, CheckCircle2, XCircle, AlertTriangle, ChevronRight, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CVData } from "@/types/cv";

interface GlobalSpellingAssistantProps {
  cvData: CVData;
  onApplyAllCorrections: (correctedData: CVData) => void;
}

interface FieldError {
  fieldKey: string;
  fieldLabel: string;
  originalText: string;
  correctedText: string;
  matches: any[];
}

export default function GlobalSpellingAssistant({ cvData, onApplyAllCorrections }: GlobalSpellingAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Collect all text fields from CV
  const collectTextFields = () => {
    const fields: { key: string; label: string; text: string }[] = [];

    if (cvData.personal.summary?.trim()) {
      fields.push({ key: "personal.summary", label: "Profil / Résumé", text: cvData.personal.summary });
    }

    cvData.experience.forEach((exp, i) => {
      if (exp.description?.trim()) {
        fields.push({
          key: `experience.${i}.description`,
          label: `Expérience "${exp.title || `#${i + 1}`}" – Description`,
          text: exp.description,
        });
      }
    });

    (cvData.projects || []).forEach((proj, i) => {
      if (proj.description?.trim()) {
        fields.push({
          key: `project.${i}.description`,
          label: `Projet "${proj.title || `#${i + 1}`}" – Description`,
          text: proj.description,
        });
      }
    });

    return fields;
  };

  const handleCheckAll = async () => {
    const fields = collectTextFields();
    if (fields.length === 0) {
      setSuccessMessage("Aucun champ texte à vérifier. Remplissez votre CV d'abord !");
      setTimeout(() => setSuccessMessage(""), 4000);
      return;
    }

    setIsLoading(true);
    setFieldErrors([]);
    setCheckedCount(0);
    setTotalCount(fields.length);
    setSuccessMessage("");
    setIsOpen(false);

    const errors: FieldError[] = [];

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      setCheckedCount(i + 1);
      try {
        const res = await fetch("/api/correct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: field.text }),
        });
        if (res.ok) {
          const data = await res.json();
          const matches = data.matches || [];
          if (matches.length > 0) {
            // Auto-build corrected text using first suggestion for each match (sorted by offset desc)
            let correctedText = field.text;
            const sortedMatches = [...matches].sort((a, b) => b.offset - a.offset);
            for (const match of sortedMatches) {
              if (match.replacements && match.replacements.length > 0) {
                const before = correctedText.substring(0, match.offset);
                const after = correctedText.substring(match.offset + match.length);
                correctedText = before + match.replacements[0].value + after;
              }
            }
            errors.push({
              fieldKey: field.key,
              fieldLabel: field.label,
              originalText: field.text,
              correctedText,
              matches,
            });
          }
        }
      } catch (e) {
        console.error("Error checking field:", field.key, e);
      }
    }

    setIsLoading(false);

    if (errors.length === 0) {
      setSuccessMessage(
        `✅ Parfait ! Aucune faute détectée dans ${fields.length} champ${fields.length > 1 ? "s" : ""} analysé${fields.length > 1 ? "s" : ""}.`
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setFieldErrors(errors);
      setIsOpen(true);
    }
  };

  const handleApplyAll = () => {
    // Apply all corrections to cvData
    let newCvData = { ...cvData };

    for (const err of fieldErrors) {
      const parts = err.fieldKey.split(".");
      if (parts[0] === "personal" && parts[1] === "summary") {
        newCvData = {
          ...newCvData,
          personal: { ...newCvData.personal, summary: err.correctedText },
        };
      } else if (parts[0] === "experience" && parts[2] === "description") {
        const idx = parseInt(parts[1]);
        const newExp = [...newCvData.experience];
        newExp[idx] = { ...newExp[idx], description: err.correctedText };
        newCvData = { ...newCvData, experience: newExp };
      } else if (parts[0] === "project" && parts[2] === "description") {
        const idx = parseInt(parts[1]);
        const newProjects = [...(newCvData.projects || [])];
        newProjects[idx] = { ...newProjects[idx], description: err.correctedText };
        newCvData = { ...newCvData, projects: newProjects };
      }
    }

    onApplyAllCorrections(newCvData);
    setIsOpen(false);
    setFieldErrors([]);
    setSuccessMessage(`✅ ${fieldErrors.length} correction${fieldErrors.length > 1 ? "s" : ""} appliquée${fieldErrors.length > 1 ? "s" : ""} avec succès !`);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFieldErrors([]);
  };

  const totalErrors = fieldErrors.reduce((acc, f) => acc + f.matches.length, 0);

  return (
    <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
      {/* CTA Button */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          Vérifiez l'orthographe et la conjugaison de tout votre CV en un seul clic
        </p>
        <button
          id="global-spelling-check-btn"
          type="button"
          onClick={handleCheckAll}
          disabled={isLoading}
          className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
          }}
        >
          {/* Shine effect */}
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" />

          {isLoading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              <span>
                Analyse en cours… {checkedCount}/{totalCount}
              </span>
            </>
          ) : (
            <>
              <Wand2 size={17} />
              <span>Corriger mes erreurs</span>
              <Sparkles size={13} className="opacity-70" />
            </>
          )}
        </button>

        {/* Loading progress bar */}
        {isLoading && totalCount > 0 && (
          <div className="w-full max-w-xs h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #6366f1, #a855f7)" }}
              initial={{ width: 0 }}
              animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corrections Panel */}
      <AnimatePresence>
        {isOpen && fieldErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {totalErrors} erreur{totalErrors > 1 ? "s" : ""} détectée{totalErrors > 1 ? "s" : ""} dans{" "}
                  {fieldErrors.length} champ{fieldErrors.length > 1 ? "s" : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Corrections list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-950">
              {fieldErrors.map((err, idx) => (
                <div key={idx} className="p-4 space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {err.fieldLabel}
                  </p>

                  {/* Error count */}
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={11} />
                    <span>
                      {err.matches.length} erreur{err.matches.length > 1 ? "s" : ""} :
                    </span>
                    <span className="font-semibold">
                      {err.matches.map((m) => m.message).join(" · ")}
                    </span>
                  </div>

                  {/* Before → After */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                      <p className="text-[10px] font-black uppercase text-red-400 mb-1 tracking-wider">Avant</p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {err.originalText}
                      </p>
                    </div>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                      <p className="text-[10px] font-black uppercase text-emerald-500 mb-1 tracking-wider flex items-center gap-1">
                        <ChevronRight size={10} /> Après
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {err.correctedText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
              <button
                id="global-correction-cancel-btn"
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <XCircle size={15} />
                Annuler
              </button>
              <button
                id="global-correction-apply-btn"
                type="button"
                onClick={handleApplyAll}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-md"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: "0 3px 12px rgba(99, 102, 241, 0.35)",
                }}
              >
                <CheckCircle2 size={15} />
                Appliquer la correction
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
