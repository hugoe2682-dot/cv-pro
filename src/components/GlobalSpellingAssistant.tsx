"use client";

import React, { useState } from "react";
import { Wand2, Loader2, CheckCircle2, XCircle, AlertTriangle, ChevronRight, X, Sparkles, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CVData } from "@/types/cv";

interface GlobalSpellingAssistantProps {
  cvData: CVData;
  onApplyAllCorrections: (correctedData: CVData) => void;
}

interface SpellingError {
  type: "spelling";
  fieldKey: string;
  fieldLabel: string;
  originalText: string;
  correctedText: string;
  matches: any[];
}

interface FormatError {
  type: "format";
  fieldKey: string;
  fieldLabel: string;
  originalText: string;
  correctedText: string;
  reason: string;
}

type AnyError = SpellingError | FormatError;

// ── Format helpers ────────────────────────────────────────────────
const formatFirstName = (val: string) => {
  const clean = val.replace(/[^a-zA-ZàâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ\s-]/g, "").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
};

const formatLastName = (val: string) =>
  val.replace(/[^a-zA-ZàâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ\s-]/g, "").toUpperCase().trim();

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidDate = (date: string) => {
  const clean = date.trim();
  if (!clean) return true; // empty is ok
  return /^\d{2}\/\d{2}\/\d{4}$/.test(clean);
};

const cleanUrl = (url: string) => url.trim().replace(/\s+/g, "");

// ── Personal field checks ─────────────────────────────────────────
function checkPersonalFields(cvData: CVData): FormatError[] {
  const errors: FormatError[] = [];
  const p = cvData.personal;

  // Prénom
  if (p.firstName) {
    const fixed = formatFirstName(p.firstName);
    if (fixed !== p.firstName) {
      errors.push({
        type: "format",
        fieldKey: "personal.firstName",
        fieldLabel: "Prénom",
        originalText: p.firstName,
        correctedText: fixed,
        reason: "Le prénom doit commencer par une majuscule suivie de minuscules.",
      });
    }
  }

  // Nom
  if (p.lastName) {
    const fixed = formatLastName(p.lastName);
    if (fixed !== p.lastName) {
      errors.push({
        type: "format",
        fieldKey: "personal.lastName",
        fieldLabel: "Nom de famille",
        originalText: p.lastName,
        correctedText: fixed,
        reason: "Le nom de famille doit être en MAJUSCULES.",
      });
    }
  }

  // Date de naissance
  if (p.dateOfBirth && !isValidDate(p.dateOfBirth)) {
    errors.push({
      type: "format",
      fieldKey: "personal.dateOfBirth",
      fieldLabel: "Date de naissance",
      originalText: p.dateOfBirth,
      correctedText: p.dateOfBirth.trim(),
      reason: "Le format attendu est JJ/MM/AAAA (ex: 15/06/1995).",
    });
  }

  // Email
  if (p.email) {
    const trimmed = p.email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      errors.push({
        type: "format",
        fieldKey: "personal.email",
        fieldLabel: "Email",
        originalText: p.email,
        correctedText: trimmed,
        reason: "L'adresse email semble invalide.",
      });
    } else if (trimmed !== p.email) {
      errors.push({
        type: "format",
        fieldKey: "personal.email",
        fieldLabel: "Email",
        originalText: p.email,
        correctedText: trimmed,
        reason: "Suppression des espaces et mise en minuscules.",
      });
    }
  }

  // Réseaux sociaux — nettoyage espaces
  const socialFields: { key: keyof typeof p; label: string }[] = [
    { key: "linkedin", label: "LinkedIn" },
    { key: "website", label: "Site Web" },
    { key: "facebook", label: "Facebook" },
    { key: "instagram", label: "Instagram" },
    { key: "youtube", label: "YouTube" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "indeed", label: "Indeed" },
  ];

  for (const { key, label } of socialFields) {
    const val = p[key] as string | undefined;
    if (val && val.trim()) {
      const cleaned = cleanUrl(val);
      if (cleaned !== val) {
        errors.push({
          type: "format",
          fieldKey: `personal.${key}`,
          fieldLabel: label,
          originalText: val,
          correctedText: cleaned,
          reason: "Suppression des espaces superflus.",
        });
      }
    }
  }

  return errors;
}

// ── Apply corrections to cvData ───────────────────────────────────
function applyErrors(cvData: CVData, errors: AnyError[]): CVData {
  let data = { ...cvData, personal: { ...cvData.personal } };

  for (const err of errors) {
    const parts = err.fieldKey.split(".");

    if (parts[0] === "personal") {
      const field = parts[1] as keyof CVData["personal"];
      (data.personal as any)[field] = err.correctedText;

      // Keep the composite `name` field in sync
      if (field === "firstName" || field === "lastName") {
        data.personal.name = `${data.personal.firstName ?? ""} ${data.personal.lastName ?? ""}`.trim();
      }
    } else if (parts[0] === "experience" && parts[2] === "description") {
      const idx = parseInt(parts[1]);
      const newExp = [...data.experience];
      newExp[idx] = { ...newExp[idx], description: err.correctedText };
      data = { ...data, experience: newExp };
    } else if (parts[0] === "project" && parts[2] === "description") {
      const idx = parseInt(parts[1]);
      const newProjects = [...(data.projects || [])];
      newProjects[idx] = { ...newProjects[idx], description: err.correctedText };
      data = { ...data, projects: newProjects };
    }
  }

  return data;
}

// ── Component ─────────────────────────────────────────────────────
export default function GlobalSpellingAssistant({ cvData, onApplyAllCorrections }: GlobalSpellingAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [allErrors, setAllErrors] = useState<AnyError[]>([]);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Text fields for LanguageTool spelling check
  const collectTextFields = () => {
    const fields: { key: string; label: string; text: string }[] = [];

    if (cvData.personal.summary?.trim())
      fields.push({ key: "personal.summary", label: "Profil / Résumé", text: cvData.personal.summary });

    cvData.experience.forEach((exp, i) => {
      if (exp.description?.trim())
        fields.push({
          key: `experience.${i}.description`,
          label: `Expérience "${exp.title || `#${i + 1}`}" – Description`,
          text: exp.description,
        });
    });

    (cvData.projects || []).forEach((proj, i) => {
      if (proj.description?.trim())
        fields.push({
          key: `project.${i}.description`,
          label: `Projet "${proj.title || `#${i + 1}`}" – Description`,
          text: proj.description,
        });
    });

    return fields;
  };

  const handleCheckAll = async () => {
    setIsLoading(true);
    setAllErrors([]);
    setSuccessMessage("");
    setIsOpen(false);

    const collected: AnyError[] = [];

    // 1️⃣ Format checks (instant — no API)
    const formatErrors = checkPersonalFields(cvData);
    collected.push(...formatErrors);

    // 2️⃣ Spelling / grammar checks via LanguageTool
    const textFields = collectTextFields();
    setTotalCount(textFields.length);
    setCheckedCount(0);

    for (let i = 0; i < textFields.length; i++) {
      const field = textFields[i];
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
            let correctedText = field.text;
            const sorted = [...matches].sort((a, b) => b.offset - a.offset);
            for (const m of sorted) {
              if (m.replacements?.length > 0) {
                correctedText =
                  correctedText.substring(0, m.offset) +
                  m.replacements[0].value +
                  correctedText.substring(m.offset + m.length);
              }
            }
            collected.push({
              type: "spelling",
              fieldKey: field.key,
              fieldLabel: field.label,
              originalText: field.text,
              correctedText,
              matches,
            });
          }
        }
      } catch (e) {
        console.error("Spelling check error:", field.key, e);
      }
    }

    setIsLoading(false);

    if (collected.length === 0) {
      const total = formatErrors.length + textFields.length;
      setSuccessMessage(
        `✅ Parfait ! Aucune erreur détectée dans ${total} champ${total > 1 ? "s" : ""} analysé${total > 1 ? "s" : ""}.`
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setAllErrors(collected);
      setIsOpen(true);
    }
  };

  const handleApplyAll = () => {
    const corrected = applyErrors(cvData, allErrors);
    onApplyAllCorrections(corrected);
    const count = allErrors.length;
    setIsOpen(false);
    setAllErrors([]);
    setSuccessMessage(`✅ ${count} correction${count > 1 ? "s" : ""} appliquée${count > 1 ? "s" : ""} avec succès !`);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setAllErrors([]);
  };

  const formatErrors = allErrors.filter((e) => e.type === "format");
  const spellingErrors = allErrors.filter((e) => e.type === "spelling") as SpellingError[];
  const totalIssues = allErrors.length;

  return (
    <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
      {/* CTA Button */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          Vérifiez l'orthographe, la conjugaison et le format de tout votre CV en un seul clic
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

        {/* Progress bar */}
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
        {isOpen && totalIssues > 0 && (
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
                  {totalIssues} problème{totalIssues > 1 ? "s" : ""} détecté{totalIssues > 1 ? "s" : ""}
                  {formatErrors.length > 0 && spellingErrors.length > 0
                    ? ` (${formatErrors.length} format · ${spellingErrors.length} orthographe)`
                    : formatErrors.length > 0
                    ? " (format)"
                    : " (orthographe)"}
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

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-950">

              {/* ── Format errors ── */}
              {formatErrors.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1.5">
                      <UserCheck size={11} /> Corrections de format
                    </span>
                  </div>
                  {formatErrors.map((err, idx) => (
                    <div key={`format-${idx}`} className="p-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {err.fieldLabel}
                      </p>
                      <p className="text-[11px] text-slate-500 italic">{(err as FormatError).reason}</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                          <p className="text-[10px] font-black uppercase text-red-400 mb-1">Avant</p>
                          <p className="text-slate-700 dark:text-slate-300 font-mono break-all">{err.originalText}</p>
                        </div>
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                          <p className="text-[10px] font-black uppercase text-emerald-500 mb-1 flex items-center gap-1">
                            <ChevronRight size={10} /> Après
                          </p>
                          <p className="text-slate-700 dark:text-slate-300 font-mono break-all">{err.correctedText}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* ── Spelling errors ── */}
              {spellingErrors.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                      <AlertTriangle size={11} /> Corrections orthographe & conjugaison
                    </span>
                  </div>
                  {spellingErrors.map((err, idx) => (
                    <div key={`spell-${idx}`} className="p-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {err.fieldLabel}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={11} />
                        <span>{err.matches.length} erreur{err.matches.length > 1 ? "s" : ""} :</span>
                        <span className="font-semibold">{err.matches.map((m: any) => m.message).join(" · ")}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                          <p className="text-[10px] font-black uppercase text-red-400 mb-1">Avant</p>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">{err.originalText}</p>
                        </div>
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                          <p className="text-[10px] font-black uppercase text-emerald-500 mb-1 flex items-center gap-1">
                            <ChevronRight size={10} /> Après
                          </p>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">{err.correctedText}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
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
