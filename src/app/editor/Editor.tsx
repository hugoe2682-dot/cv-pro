"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CVData, defaultCVData } from "@/types/cv";
import EditorForm from "@/components/EditorForm";
import CVPreview from "@/components/CVPreview";
import { useReactToPrint } from "react-to-print";
import { Download, Save, Loader2, RotateCcw, Palette, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import Modal from "@/components/Modal";

export default function Editor() {
  const { user, session, status } = useAuth();
  const router = useRouter();
  const [cvData, setCvData] = useState<CVData>(defaultCVData);
  const [cvId, setCvId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(true); // Default to true to avoid flash, will update on load
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info" | "success";
    confirmText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning"
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleSetCvData = (data: React.SetStateAction<CVData>) => {
    setIsDirty(true);
    setCvData(data);
  };
  
  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleEditorScroll = () => {
    if (!editorRef.current || !previewRef.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    
    if (editor.scrollHeight > editor.clientHeight) {
      const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      // Only scroll if preview has scrollable area
      if (preview.scrollHeight > preview.clientHeight) {
        preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
      }
    }
  };

  const handleDownloadPDF = () => {
    localStorage.setItem("cvDataPrint", JSON.stringify(cvData));
    window.open("/editor/print", "_blank");
  };
  


  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchCV = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/cv");
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              setCvData(data[0].data);
              setCvId(data[0].id);
            } else {
              // No CV found, fetch user profile to prefill
              try {
                const userRes = await fetch("/api/user");
                if (userRes.ok) {
                  const userData = await userRes.json();
                  setIsConfirmed(userData.emailConfirmed);
                  
                  let formattedDOB = "";
                  if (userData.birthDate) {
                    const d = new Date(userData.birthDate);
                    const day = d.getDate().toString().padStart(2, '0');
                    const month = (d.getMonth() + 1).toString().padStart(2, '0');
                    formattedDOB = `${day}/${month}/${d.getFullYear()}`;
                  }

                  setCvData({
                    ...defaultCVData,
                    personal: {
                      ...defaultCVData.personal,
                      firstName: userData.firstName || "",
                      lastName: userData.lastName || "",
                      name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
                      email: userData.email || "",
                      phone: userData.phone || "",
                      address: userData.address || "",
                      nationality: userData.nationality || "",
                      dateOfBirth: formattedDOB
                    }
                  });
                }
              } catch (e) {
                console.error("Erreur lors de la récupération du profil:", e);
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement du CV:", error);
        }
      } else if (status === "unauthenticated") {
        const localData = localStorage.getItem("cvData");
        if (localData) {
          try {
            setCvData(JSON.parse(localData));
          } catch (e) {
            console.error("Erreur parsing localStorage", e);
          }
        }
      }
    };
    fetchCV();
  }, [status]);

  useEffect(() => {
    const autoSaveAfterLogin = async () => {
      if (status === "authenticated") {
        const localData = localStorage.getItem("cvData");
        if (localData) {
          try {
            const parsedLocalData = JSON.parse(localData);
            setIsSaving(true);
            const res = await fetch("/api/cv", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                data: parsedLocalData,
                name: parsedLocalData.personal.name || "Mon CV",
              }),
            });
            if (res.ok) {
              const savedCv = await res.json();
              setCvId(savedCv.id);
              setCvData(savedCv.data);
              setIsDirty(false);
              localStorage.removeItem("cvData");
              // notification silencieuse ou via toast plus tard
            }
          } catch (e) {
            console.error("Erreur lors de l'auto-sauvegarde après login:", e);
          } finally {
            setIsSaving(false);
          }
        }
      }
    };
    autoSaveAfterLogin();
  }, [status]);

  // Auto-save mechanism (every 60 seconds)
  useEffect(() => {
    if (status !== "authenticated") {
      // For unauthenticated users, just save to localStorage
      if (isDirty) {
        localStorage.setItem("cvData", JSON.stringify(cvData));
      }
      return;
    }

    if (!isDirty || isSaving) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: cvId,
            data: cvData,
            name: cvData.personal.name || "Mon CV",
          }),
        });
        if (res.status === 401) {
          console.warn("Session expirée. Auto-sauvegarde arrêtée.");
          setIsDirty(true); // Keep dirty so user can manually save after login
          return;
        }
        if (res.ok) {
          const savedCv = await res.json();
          if (savedCv.id) {
            setCvId(savedCv.id);
            setIsDirty(false);
          }
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, [cvData, isDirty, isSaving, status, cvId]);

  const handleReset = () => {
    setModalConfig({
      isOpen: true,
      title: "Réinitialiser le CV",
      message: "Voulez-vous vraiment réinitialiser le CV ? Vos sections (expériences, formations, etc.) seront vidées, mais vos informations personnelles et celles de votre profil seront importées et conservées.",
      type: "danger",
      confirmText: "Réinitialiser",
      onConfirm: async () => {
        closeModal();
        setIsSaving(true);
        try {
          let personalInfo = { ...cvData.personal };

          if (status === "authenticated") {
            try {
              const userRes = await fetch("/api/user");
              if (userRes.ok) {
                const userData = await userRes.json();
                let formattedDOB = "";
                if (userData.birthDate) {
                  const d = new Date(userData.birthDate);
                  const day = d.getDate().toString().padStart(2, '0');
                  const month = (d.getMonth() + 1).toString().padStart(2, '0');
                  formattedDOB = `${day}/${month}/${d.getFullYear()}`;
                }

                personalInfo = {
                  firstName: userData.firstName || cvData.personal.firstName || "",
                  lastName: userData.lastName || cvData.personal.lastName || "",
                  name: (`${userData.firstName || ""} ${userData.lastName || ""}`.trim()) || cvData.personal.name || "",
                  email: userData.email || cvData.personal.email || "",
                  phone: userData.phone || cvData.personal.phone || "",
                  address: userData.address || cvData.personal.address || "",
                  nationality: userData.nationality || cvData.personal.nationality || "",
                  dateOfBirth: formattedDOB || cvData.personal.dateOfBirth || "",
                  photo: userData.image || cvData.personal.photo || "",
                  includePhoto: !!(userData.image || cvData.personal.photo),
                  jobTitle: cvData.personal.jobTitle || "",
                  summary: cvData.personal.summary || "",
                  facebook: cvData.personal.facebook || "",
                  instagram: cvData.personal.instagram || "",
                  website: cvData.personal.website || "",
                  youtube: cvData.personal.youtube || "",
                  whatsapp: cvData.personal.whatsapp || "",
                  linkedin: cvData.personal.linkedin || "",
                  indeed: cvData.personal.indeed || "",
                };
              }
            } catch (err) {
              console.error("Erreur lors de la récupération des données de profil:", err);
            }
          }

          const resetData: CVData = {
            ...defaultCVData,
            themeColor: cvData.themeColor || defaultCVData.themeColor,
            personal: personalInfo,
          };

          setCvData(resetData);
          setIsDirty(true);
          
          if (typeof window !== "undefined") {
            localStorage.setItem("cvData", JSON.stringify(resetData));
          }
        } catch (e) {
          console.error("Erreur lors du reset:", e);
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleSave = () => {
    if (status !== "authenticated") {
      setModalConfig({
        isOpen: true,
        title: "Connexion requise",
        message: "Pour sauvegarder votre CV en ligne, vous devez vous connecter. Voulez-vous vous connecter maintenant ?",
        type: "info",
        confirmText: "Se connecter",
        onConfirm: () => {
          localStorage.setItem("cvData", JSON.stringify(cvData));
          signIn(undefined, { callbackUrl: window.location.href });
        }
      });
      return;
    }

    if (!isConfirmed) {
      setModalConfig({
        isOpen: true,
        title: "Compte non activé",
        message: "Veuillez activer votre compte depuis le tableau de bord pour pouvoir sauvegarder votre CV en ligne.",
        type: "warning",
        confirmText: "Aller au Dashboard",
        onConfirm: () => {
          router.push("/dashboard");
        }
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "Sauvegarder le CV",
      message: "Voulez-vous enregistrer vos modifications en ligne ?",
      type: "info",
      confirmText: "Sauvegarder",
      onConfirm: async () => {
        closeModal();
        setIsSaving(true);
        try {
          const res = await fetch("/api/cv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: cvId,
              data: cvData,
              name: cvData.personal.name || "Mon CV",
            }),
          });
          if (res.ok) {
            const savedCv = await res.json();
            if (savedCv.id) {
              setCvId(savedCv.id);
              setIsDirty(false);
              // Notification de succès
              setTimeout(() => {
                setModalConfig({
                  isOpen: true,
                  title: "Succès",
                  message: "Votre CV a été sauvegardé avec succès !",
                  type: "success",
                  confirmText: "OK",
                  onConfirm: closeModal
                });
              }, 100);
            }
          } else {
            throw new Error("Erreur serveur");
          }
        } catch (error) {
          setTimeout(() => {
            setModalConfig({
              isOpen: true,
              title: "Erreur",
              message: "Erreur lors de la sauvegarde sur le serveur.",
              type: "danger",
              confirmText: "Fermer",
              onConfirm: closeModal
            });
          }, 100);
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleToggleExamples = () => {
    const action = showExamples ? "désactiver" : "activer";
    setModalConfig({
      isOpen: true,
      title: `${showExamples ? "Désactiver" : "Activer"} les exemples`,
      message: `Voulez-vous vraiment ${action} les données d'exemple ? Cela changera l'aperçu du CV.`,
      type: "info",
      confirmText: "Confirmer",
      onConfirm: () => {
        setShowExamples(!showExamples);
        closeModal();
      }
    });
  };

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950 h-screen">
        <LoadingScreen message="Chargement de l'éditeur..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-slate-900">
      <div 
        ref={editorRef}
        id="editor-scroll-pane"
        onScroll={handleEditorScroll}
        className="w-full md:w-1/2 lg:w-5/12 h-full overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 custom-scrollbar relative"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Éditeur de CV</h1>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setIsLayoutModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-[var(--color-primary)] text-white text-[10px] font-black rounded-full hover:bg-[var(--color-primary-hover)] transition-all shadow-md"
            >
              <Palette size={12} />
              <span className="hidden sm:inline">Structure de CV</span>
            </button>
            <button 
              onClick={handleToggleExamples}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black transition-all ${
                showExamples 
                  ? "bg-amber-100 text-amber-700 border border-amber-200" 
                  : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
              }`}
              title={showExamples ? "Désactiver les exemples" : "Voir un exemple"}
            >
              <RotateCcw size={12} className={showExamples ? "animate-pulse" : ""} />
              {showExamples ? "Mode Exemple" : "Mode Vide"}
            </button>
            <button 
              onClick={handleReset}
              className="p-1 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-900 rounded-full transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="p-1 text-slate-600 hover:text-[var(--color-primary)] bg-slate-100 dark:bg-slate-900 rounded-full transition-colors disabled:opacity-50"
              title="Sauvegarder"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-1 px-2 py-1 bg-[var(--color-primary)] text-white text-[10px] font-black rounded-full hover:bg-[var(--color-primary-hover)] transition-all shadow-md"
            >
              <Download size={12} />
              <span className="hidden sm:inline">Télécharger PDF</span>
            </button>
          </div>
        </div>
        
        <EditorForm cvData={cvData} setCvData={handleSetCvData} />

        {/* Mobile-only preview shown at the bottom of the editor scroll pane, below the spelling correction assistant */}
        <div className="block md:hidden mt-8 border-t border-slate-200 dark:border-slate-800 pt-8 pb-16">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">Aperçu du CV</h2>
          <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
            <div className="w-[210mm] mx-auto shadow-xl rounded-sm overflow-hidden bg-white">
              <CVPreview cvData={cvData} showExamples={showExamples} cvId={cvId} />
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
      />

      {/* Layout Selection Modal */}
      <AnimatePresence>
        {isLayoutModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="text-indigo-600" />
                  Choisir la structure du CV
                </h3>
                <button
                  onClick={() => setIsLayoutModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-855 rounded-full text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Classic */}
                <div
                  onClick={() => {
                    handleSetCvData((prev: any) => ({ ...prev, layout: "classic" }));
                    setIsLayoutModalOpen(false);
                  }}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-52 hover:scale-[1.02] active:scale-95 ${
                    (cvData.layout || "classic") === "classic"
                      ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/30"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">Classique (2 colonnes)</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Design traditionnel avec informations principales à gauche et compétences/langues dans une colonne latérale à droite.</p>
                  </div>
                  <div className="flex gap-2 h-14 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 mt-4">
                    <div className="w-2/3 h-full flex flex-col gap-1">
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-750 rounded"></div>
                    </div>
                    <div className="w-1/3 h-full flex flex-col gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                      <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-900/50 rounded"></div>
                      <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-900/50 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Modern */}
                <div
                  onClick={() => {
                    handleSetCvData((prev: any) => ({ ...prev, layout: "modern" }));
                    setIsLayoutModalOpen(false);
                  }}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-52 hover:scale-[1.02] active:scale-95 ${
                    cvData.layout === "modern"
                      ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/30"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">Moderne (1 colonne)</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Mise en page épurée sur une seule colonne avec entête centrée et photo ronde. Parfait pour une lecture fluide.</p>
                  </div>
                  <div className="flex flex-col gap-1.5 h-14 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 mt-4 items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40"></div>
                    <div className="h-1.5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>

                {/* Professional */}
                <div
                  onClick={() => {
                    handleSetCvData((prev: any) => ({ ...prev, layout: "professional" }));
                    setIsLayoutModalOpen(false);
                  }}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-52 hover:scale-[1.02] active:scale-95 ${
                    cvData.layout === "professional"
                      ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/30"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">Professionnel (Sidebar gauche)</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Design corporatif moderne avec une colonne latérale de couleur à gauche pour les contacts et compétences.</p>
                  </div>
                  <div className="flex gap-2 h-14 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 mt-4">
                    <div className="w-1/3 h-full bg-indigo-50 dark:bg-indigo-950/30 rounded flex flex-col gap-1 p-1">
                      <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-900/50 rounded"></div>
                      <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-900/50 rounded"></div>
                    </div>
                    <div className="w-2/3 h-full flex flex-col gap-1 p-1 pl-0">
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-1.5 w-3/4 bg-slate-100 dark:bg-slate-750 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Minimalist */}
                <div
                  onClick={() => {
                    handleSetCvData((prev: any) => ({ ...prev, layout: "minimalist" }));
                    setIsLayoutModalOpen(false);
                  }}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-52 hover:scale-[1.02] active:scale-95 ${
                    cvData.layout === "minimalist"
                      ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/30"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">Minimaliste (Épuré)</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Un design ultra-propre, sans bordures lourdes ni arrière-plans, centré sur la lisibilité des textes et l'espace négatif.</p>
                  </div>
                  <div className="flex flex-col gap-1 h-14 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 mt-4">
                    <div className="h-1.5 w-1/3 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-700 rounded my-1"></div>
                    <div className="h-1.5 w-3/4 bg-slate-200 dark:bg-slate-750 rounded"></div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div 
        ref={previewRef}
        id="preview-scroll-pane"
        className="hidden md:flex w-full md:w-1/2 lg:w-7/12 h-full overflow-y-auto p-8 justify-center items-start bg-slate-100 dark:bg-slate-900 custom-scrollbar print:hidden"
      >
        <div className="w-full max-w-[210mm] shadow-2xl rounded-sm overflow-hidden bg-white mb-[20vh]">
          <div>
            <CVPreview cvData={cvData} showExamples={showExamples} cvId={cvId} />
          </div>
        </div>
      </div>

      {/* Print-only container to ensure reliable PDF generation on all devices (including mobile) */}
      <div className="hidden print:block">
        <div ref={contentRef} className="w-[210mm] min-h-[297mm] bg-white print:p-0">
          <CVPreview cvData={cvData} showExamples={showExamples} cvId={cvId} />
        </div>
      </div>
    </div>
  );
}
