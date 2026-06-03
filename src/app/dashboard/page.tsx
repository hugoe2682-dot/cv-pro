"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Flag, 
  MapPin, 
  Phone, 
  FileText, 
  Settings, 
  ChevronRight,
  Loader2,
  Save,
  Camera,
  QrCode,
  Eye,
  ShieldCheck,
  Key,
  RefreshCw,
  X,
  CheckCircle2,
  Download,
  ExternalLink,
  Palette,
  Printer,
  Copy,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import Modal from "@/components/Modal";
import { useReactToPrint } from "react-to-print";
import CVPreview from "@/components/CVPreview";
import QRCode from "react-qr-code";
import { generateVCard } from "@/lib/vcard";

export default function DashboardPage() {
  const { user, session, status } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [isCvPreviewOpen, setIsCvPreviewOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isColorBarOpen, setIsColorBarOpen] = useState(false);
  const [isBusinessCardOpen, setIsBusinessCardOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleColorChange = async (color: string) => {
    if (!cvData) return;
    const updatedCv = {
      ...cvData,
      themeColor: color,
    };
    setCvData(updatedCv);
    
    // Save to local storage for print
    localStorage.setItem("cvDataPrint", JSON.stringify(updatedCv));
    localStorage.setItem("cvData", JSON.stringify(updatedCv));

    // Save to server
    if (status === "authenticated" && userData?.emailConfirmed && cvId) {
      try {
        await fetch("/api/cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: cvId,
            data: updatedCv,
            name: updatedCv.personal.name || "Mon CV",
          }),
        });
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la couleur:", error);
      }
    }
  };

  const handleDownloadPDF = () => {
    if (cvData) {
      localStorage.setItem("cvDataPrint", JSON.stringify(cvData));
      window.open("/editor/print", "_blank");
    }
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "profile">("overview");
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [activationError, setActivationError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "danger" | "success";
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    onConfirm: () => {},
  });

  const [editData, setEditData] = useState({
    address: "",
    phone: "",
    image: "",
    birthDate: "",
    nationality: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchInitialData();
    }
  }, [status, session, router]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch user data
      const userRes = await fetch("/api/user");
      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data);
        setEditData({
          address: data.address || "",
          phone: data.phone || "",
          image: data.image || "",
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : "",
          nationality: data.nationality || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
        });
      }

      // Fetch CV to get the ID and data
      const cvRes = await fetch("/api/cv");
      if (cvRes.ok) {
        const cvs = await cvRes.json();
        if (cvs && cvs.length > 0) {
          setCvId(cvs[0].id);
          setCvData(cvs[0].data);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setModalConfig({
      isOpen: true,
      title: "Confirmer les modifications",
      message: "Voulez-vous vraiment enregistrer ces modifications dans votre profil ?",
      type: "info",
      confirmText: "Enregistrer",
      onConfirm: async () => {
        closeModal();
        setIsUpdating(true);
        try {
          const res = await fetch("/api/user", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editData),
          });
          if (res.ok) {
            const updated = await res.json();
            setUserData(updated);
            setEditData({
              ...editData,
              birthDate: updated.birthDate ? new Date(updated.birthDate).toISOString().split('T')[0] : "",
              nationality: updated.nationality || "",
              firstName: updated.firstName || "",
              lastName: updated.lastName || "",
            });
            
            // Show Success Modal
            setTimeout(() => {
              setModalConfig({
                isOpen: true,
                title: "Profil mis à jour",
                message: "Vos informations ont été enregistrées avec succès.",
                type: "success",
                confirmText: "Super !",
                onConfirm: closeModal
              });
            }, 100);
          } else {
            throw new Error("Erreur lors de la sauvegarde");
          }
        } catch (error) {
          setTimeout(() => {
            setModalConfig({
              isOpen: true,
              title: "Erreur",
              message: "Une erreur est survenue lors de la mise à jour.",
              type: "danger",
              confirmText: "Fermer",
              onConfirm: closeModal
            });
          }, 100);
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setModalConfig({
          isOpen: true,
          title: "Fichier trop lourd",
          message: "L'image ne doit pas dépasser 1Mo.",
          type: "warning",
          confirmText: "Compris",
          onConfirm: closeModal
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendCode = async () => {
    setIsSendingCode(true);
    setActivationError("");
    try {
      const res = await fetch("/api/auth/send-code", { method: "POST" });
      if (res.ok) {
        setIsActivationModalOpen(true);
      } else {
        const data = await res.json();
        setActivationError(data.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      setActivationError("Erreur serveur");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsVerifyingCode(true);
    setActivationError("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activationCode }),
      });
      if (res.ok) {
        setIsActivationModalOpen(false);
        setUserData({ ...userData, emailConfirmed: true });
        
        setModalConfig({
          isOpen: true,
          title: "Compte Activé !",
          message: "Félicitations, votre compte est maintenant pleinement opérationnel.",
          type: "info",
          confirmText: "Continuer",
          onConfirm: () => {
            closeModal();
            window.location.reload();
          }
        });
      } else {
        const data = await res.json();
        setActivationError(data.error || "Code incorrect");
      }
    } catch (error) {
      setActivationError("Erreur serveur");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <LoadingScreen message="Chargement du dashboard..." />;
  }

  const isConfirmed = userData?.emailConfirmed;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Tableau de bord
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Bienvenue sur votre espace personnel</p>
          {!isConfirmed && (
            <div className="mt-4 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl inline-flex items-center gap-2 text-sm font-bold animate-pulse">
              <ShieldCheck size={16} />
              Veuillez activer votre compte pour accéder à toutes les fonctionnalités (Sauvegarde CV & QR Code)
            </div>
          )}
        </div>

        {/* Main Selection Icons */}
        <div className={`grid grid-cols-1 ${isConfirmed ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8 mb-16`}>
          {/* CV Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (cvId && cvData) {
                setIsCvPreviewOpen(true);
              } else {
                router.push("/editor");
              }
            }}
            className="group cursor-pointer relative overflow-hidden bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl shadow-blue-500/5 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center transition-all"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <QrCode size={100} />
            </div>
            <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:rotate-6 transition-transform">
              <FileText size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mon CV</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Voir et partager mon CV (QR Code)</p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab("profile");
              setTimeout(() => {
                document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="group cursor-pointer relative overflow-hidden bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl shadow-indigo-500/5 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center transition-all"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserIcon size={100} />
            </div>
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 group-hover:-rotate-6 transition-transform">
              <Settings size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mon Profil</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gérer mes infos et ma photo</p>
          </motion.div>

          {/* Activation Card - Hidden if confirmed */}
          {!isConfirmed && (
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendCode}
              className="group cursor-pointer relative overflow-hidden bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center transition-all shadow-emerald-500/5 hover:border-emerald-500/50"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck size={100} />
              </div>
              <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg transition-all bg-emerald-600 text-white shadow-emerald-500/30 group-hover:rotate-12`}>
                {isSendingCode ? <Loader2 size={40} className="animate-spin" /> : <ShieldCheck size={40} />}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Activation</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Activer mon compte par email</p>
            </motion.div>
          )}
        </div>

        {/* Profile Section */}
        <AnimatePresence>
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-2xl mb-16"
              id="profile-section"
            >
              <div className="flex flex-col md:flex-row items-start gap-12">
                {/* Left side: Photo */}
                <div className="flex flex-col items-center gap-6 w-full md:w-auto">
                  <div className="relative group">
                    <div className="w-48 h-48 rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center">
                      {editData.image ? (
                        <img 
                          src={editData.image} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon size={80} className="text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-4 right-4 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Camera size={20} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Photo de profil</p>
                    <p className="text-xs text-slate-400 italic">Format JPG, PNG (Max 1Mo)</p>
                  </div>
                </div>

                {/* Right side: Information */}
                <div className="flex-1 w-full space-y-10">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Informations Personnelles</h2>
                    <button 
                      onClick={() => setActiveTab("overview")}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Nom - Editable if N/A */}
                    <div className="space-y-3">
                      <label className={`text-xs font-black uppercase tracking-tighter flex items-center gap-2 ${(!userData.lastName || userData.lastName === "N/A") ? "text-indigo-500" : "text-slate-400"}`}>
                        <UserIcon size={14} /> Nom {(!userData.lastName || userData.lastName === "N/A") && "(Définitif après enregistrement)"}
                      </label>
                      {(!userData.lastName || userData.lastName === "N/A") ? (
                        <input 
                          type="text" 
                          value={editData.lastName}
                          onChange={(e) => setEditData({...editData, lastName: e.target.value.toUpperCase()})}
                          className="w-full px-6 py-4 bg-white dark:bg-slate-950 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold uppercase"
                          placeholder="VOTRE NOM"
                        />
                      ) : (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                          {userData.lastName}
                        </div>
                      )}
                    </div>

                    {/* Prénom - Editable if N/A */}
                    <div className="space-y-3">
                      <label className={`text-xs font-black uppercase tracking-tighter flex items-center gap-2 ${(!userData.firstName || userData.firstName === "N/A") ? "text-indigo-500" : "text-slate-400"}`}>
                        <UserIcon size={14} /> Prénom {(!userData.firstName || userData.firstName === "N/A") && "(Définitif après enregistrement)"}
                      </label>
                      {(!userData.firstName || userData.firstName === "N/A") ? (
                        <input 
                          type="text" 
                          value={editData.firstName}
                          onChange={(e) => {
                            const val = e.target.value;
                            const capitalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                            setEditData({...editData, firstName: capitalized});
                          }}
                          className="w-full px-6 py-4 bg-white dark:bg-slate-950 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                          placeholder="Votre prénom"
                        />
                      ) : (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                          {userData.firstName}
                        </div>
                      )}
                    </div>

                    {/* Date de Naissance - Editable if null */}
                    <div className="space-y-3">
                      <label className={`text-xs font-black uppercase tracking-tighter flex items-center gap-2 ${!userData.birthDate ? "text-indigo-500" : "text-slate-400"}`}>
                        <Calendar size={14} /> Date de Naissance {!userData.birthDate && "(À remplir)"}
                      </label>
                      {!userData.birthDate ? (
                        <input 
                          type="date" 
                          value={editData.birthDate}
                          onChange={(e) => setEditData({...editData, birthDate: e.target.value})}
                          className="w-full px-6 py-4 bg-white dark:bg-slate-950 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                        />
                      ) : (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                          {new Date(userData.birthDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>

                    {/* Nationalité - Editable if null */}
                    <div className="space-y-3">
                      <label className={`text-xs font-black uppercase tracking-tighter flex items-center gap-2 ${!userData.nationality ? "text-indigo-500" : "text-slate-400"}`}>
                        <Flag size={14} /> Nationalité {!userData.nationality && "(À remplir)"}
                      </label>
                      {!userData.nationality ? (
                        <input 
                          type="text" 
                          value={editData.nationality}
                          onChange={(e) => setEditData({...editData, nationality: e.target.value})}
                          className="w-full px-6 py-4 bg-white dark:bg-slate-950 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                          placeholder="Votre nationalité"
                        />
                      ) : (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                          {userData.nationality}
                        </div>
                      )}
                    </div>

                    {/* Editable (Always) */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-indigo-500 uppercase tracking-tighter flex items-center gap-2">
                        <MapPin size={14} /> Adresse (Modifiable)
                      </label>
                      <input 
                        type="text" 
                        value={editData.address}
                        onChange={(e) => setEditData({...editData, address: e.target.value})}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-950 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                        placeholder="Votre adresse"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-indigo-500 uppercase tracking-tighter flex items-center gap-2">
                        <Phone size={14} /> Téléphone (Modifiable)
                      </label>
                      <input 
                        type="text" 
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-950 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                        placeholder="Votre numéro"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="px-10 py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={22} className="animate-spin" /> : <Save size={22} />}
                      Enregistrer les modifications
                    </button>
                    <button 
                      onClick={() => setActiveTab("overview")}
                      className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activation Modal */}
        <AnimatePresence>
          {isActivationModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative"
              >
                <button 
                  onClick={() => setIsActivationModalOpen(false)}
                  className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                    <Key size={40} />
                  </div>
                  
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">Vérification</h2>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Un code de confirmation a été envoyé à <strong>{userData.email}</strong>. Veuillez le saisir ci-dessous.
                  </p>

                  <div className="space-y-4">
                    <input 
                      type="text"
                      maxLength={6}
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder="000000"
                      className="w-full text-center text-4xl font-black tracking-[1rem] py-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white"
                    />
                    
                    {activationError && (
                      <p className="text-red-500 text-sm font-bold">{activationError}</p>
                    )}

                    <button 
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode || activationCode.length < 6}
                      className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isVerifyingCode ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                      Activer mon compte
                    </button>

                    <button 
                      onClick={handleSendCode}
                      disabled={isSendingCode}
                      className="w-full py-4 text-slate-500 hover:text-slate-700 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {isSendingCode ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      Renvoyer le code
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Modal 
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          confirmText={modalConfig.confirmText}
          onConfirm={modalConfig.onConfirm}
          onCancel={closeModal}
        />

        {/* Action Button for Editor */}
        <motion.div 
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            onClick={() => router.push("/editor")}
            className="px-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-200 transition-all text-sm font-bold flex items-center gap-2"
          >
            <Eye size={18} />
            Accéder à l'éditeur complet
          </button>
        </motion.div>

        {/* PDF CV Preview Modal */}
        <AnimatePresence>
          {isCvPreviewOpen && cvData && (
            <div className="fixed inset-0 z-[120] flex flex-col bg-slate-950/80 backdrop-blur-lg overflow-y-auto">
              {/* Header Bar */}
              <div className="sticky top-0 z-30 w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <FileText size={22} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white leading-tight">Mon CV en PDF</h3>
                    <p className="text-xs text-slate-400">Générez, téléchargez ou partagez votre CV au format A4</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                   {/* Color Selector Button & Bar */}
                   <div className="relative">
                     <button
                       onClick={() => setIsColorBarOpen(!isColorBarOpen)}
                       className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                     >
                       <Palette size={16} style={{ color: cvData?.themeColor || '#6366f1' }} />
                       Changer la couleur
                     </button>

                     {isColorBarOpen && (
                       <div
                         className="absolute top-full mt-2 right-0 z-[999] bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 min-w-[280px]"
                       >
                         <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/50">
                           <span>Couleur du CV</span>
                           <button 
                             onClick={() => setIsColorBarOpen(false)}
                             className="text-slate-500 hover:text-slate-300 transition-colors"
                           >
                             <X size={14} />
                           </button>
                         </div>
                         
                         {/* Preset Colors */}
                         <div className="flex flex-wrap gap-2.5 justify-center py-1">
                           {[
                             { name: "Violet (Défaut)", value: "#6366f1" },
                             { name: "Bleu Royal", value: "#2563eb" },
                             { name: "Bleu Ciel", value: "#0284c7" },
                             { name: "Vert Émeraude", value: "#10b981" },
                             { name: "Ambre Doré", value: "#d97706" },
                             { name: "Rose Intense", value: "#e11d48" },
                             { name: "Sombre", value: "#0f172a" },
                           ].map((color) => {
                             const isSelected = (cvData?.themeColor || "#6366f1") === color.value;
                             return (
                               <button
                                 key={color.value}
                                 onClick={() => handleColorChange(color.value)}
                                 className={`w-7 h-7 rounded-full transition-transform active:scale-90 relative hover:scale-110 cursor-pointer`}
                                 style={{ backgroundColor: color.value }}
                                 title={color.name}
                               >
                                 {isSelected && (
                                   <span className="absolute inset-0 m-auto w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                                 )}
                               </button>
                             );
                           })}
                           
                           {/* Custom Color Input */}
                           <label 
                             className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-90 flex items-center justify-center border border-dashed border-slate-600 hover:border-slate-400 bg-slate-850 relative group"
                             title="Couleur personnalisée"
                           >
                             <input 
                               type="color" 
                               value={cvData?.themeColor || "#6366f1"}
                               onChange={(e) => handleColorChange(e.target.value)}
                               className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                             />
                             <span className="text-xs">🎨</span>
                             {![
                               "#6366f1", "#2563eb", "#0284c7", "#10b981", "#d97706", "#e11d48", "#0f172a"
                             ].includes(cvData?.themeColor || "#6366f1") && (
                               <span 
                                 className="absolute -inset-0.5 rounded-full border-2 border-white pointer-events-none"
                                 style={{ borderColor: cvData?.themeColor }}
                               />
                             )}
                           </label>
                         </div>
                       </div>
                     )}
                   </div>

                  {/* Print / Download Button */}
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
                  >
                    <Download size={16} />
                    Télécharger PDF / Imprimer
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => router.push("/editor")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <Eye size={16} />
                    Modifier le CV
                  </button>

                  {/* Generate Business Card Button */}
                  <button
                    onClick={() => setIsBusinessCardOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-500/5"
                  >
                    <QrCode size={16} />
                    Générer Carte de Visite
                  </button>

                  {/* Public Page Button */}
                  <button
                    onClick={() => window.open(`/cv/${cvId}`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <ExternalLink size={16} />
                    Lien public
                  </button>

                  {/* Divider */}
                  <div className="h-6 w-px bg-slate-800 hidden md:block mx-1" />

                  {/* Close Button */}
                  <button
                    onClick={() => setIsCvPreviewOpen(false)}
                    className="p-2.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* PDF Preview Document Container */}
              <div className="flex-1 flex justify-center items-start p-4 md:p-8 overflow-y-auto w-full">
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="w-full max-w-[210mm] shadow-2xl rounded-sm overflow-hidden bg-white print:shadow-none print:w-[210mm] print:h-[297mm] my-4"
                >
                  <div ref={contentRef} className="w-full bg-white print:p-0">
                    <CVPreview cvData={cvData} cvId={cvId} />
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Business Card Modal */}
        <AnimatePresence>
          {isBusinessCardOpen && cvData && cvId && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-slate-800 text-white rounded-[3rem] p-8 md:p-12 max-w-4xl w-full shadow-2xl relative flex flex-col gap-8 no-print"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setIsBusinessCardOpen(false)}
                  className="absolute top-8 right-8 p-3 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>

                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 justify-center md:justify-start">
                    <QrCode className="text-[var(--color-primary)]" style={{ color: cvData.themeColor || '#6366f1' }} size={32} />
                    Votre Carte de Visite Digitale
                  </h2>
                  <p className="text-slate-400 mt-2">Votre profil professionnel au format de poche avec QR Code intégré.</p>
                </div>

                {/* Theme Selector for the card inside modal */}
                <div className="flex flex-col md:flex-row items-stretch gap-8 mt-2">
                  {/* Visual Cards Container */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    
                    {/* BUSINESS CARD — WHITE / BLACK BORDER */}
                    <div 
                      className="w-full max-w-[500px] h-[285px] rounded-2xl bg-white border-2 border-black p-7 flex items-stretch justify-between gap-6 shadow-2xl select-none relative overflow-hidden"
                    >
                      {/* Subtle accent line at top using theme color */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                        style={{ backgroundColor: cvData.themeColor || '#6366f1' }}
                      />

                      {/* Left Side */}
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">

                        {/* Logo + Brand */}
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-sm flex-shrink-0"
                            style={{ backgroundColor: cvData.themeColor || '#6366f1' }}
                          >
                            <FileText size={14} />
                          </div>
                          <div className="flex flex-col leading-none">
                            <div>
                              <span className="font-black text-sm text-black tracking-tight">CV</span>
                              <span className="font-black text-sm tracking-tight" style={{ color: cvData.themeColor || '#6366f1' }}>PRO</span>
                            </div>
                            <span className="text-[8px] text-gray-400 font-medium tracking-tight mt-0.5">cv-pro-creation.vercel.app</span>
                          </div>
                        </div>

                        {/* Name & Job Title */}
                        <div className="mt-3">
                          <h3 className="text-xl font-black tracking-tight text-black uppercase leading-tight truncate">
                            {cvData.personal.name || "VOTRE NOM"}
                          </h3>
                          <p 
                            className="text-xs font-bold uppercase tracking-widest mt-1 truncate"
                            style={{ color: cvData.themeColor || '#6366f1' }}
                          >
                            {cvData.personal.jobTitle || "Votre Poste"}
                          </p>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-auto pt-3 border-t border-gray-200 space-y-1.5 text-[11px] text-gray-600">
                          {cvData.personal.phone && (
                            <div className="flex items-center gap-2 truncate">
                              <Phone size={10} style={{ color: cvData.themeColor || '#6366f1', flexShrink: 0 }} />
                              <span className="truncate">{cvData.personal.phone}</span>
                            </div>
                          )}
                          {cvData.personal.email && (
                            <div className="flex items-center gap-2 truncate">
                              <Mail size={10} style={{ color: cvData.themeColor || '#6366f1', flexShrink: 0 }} />
                              <span className="truncate">{cvData.personal.email}</span>
                            </div>
                          )}
                          {cvData.personal.website && (
                            <div className="flex items-center gap-2 truncate">
                              <Globe size={10} style={{ color: cvData.themeColor || '#6366f1', flexShrink: 0 }} />
                              <span className="truncate">{cvData.personal.website}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: QR Code */}
                      <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
                        <div 
                          className="p-2 rounded-xl border-2"
                          style={{ borderColor: cvData.themeColor || '#6366f1' }}
                        >
                          <QRCode 
                            value={generateVCard(cvData)}
                            size={110}
                            fgColor="#000000"
                            bgColor="#ffffff"
                            style={{ height: "auto", maxWidth: "100%", width: "110px", display: "block" }}
                            viewBox="0 0 110 110"
                          />
                        </div>
                        <span 
                          className="text-[9px] font-black uppercase tracking-widest"
                          style={{ color: cvData.themeColor || '#6366f1' }}
                        >
                          SCAN ME
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Actions Column */}
                  <div className="w-full md:w-[260px] flex flex-col gap-4 justify-center">
                    <button
                      onClick={() => window.print()}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/10 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-none"
                    >
                      <Printer size={18} />
                      Imprimer la carte
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/cv/${cvId}`);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className={`w-full py-4 font-black rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-none ${
                        isCopied 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 size={18} />
                          Lien Copié !
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          Copier lien public
                        </>
                      )}
                    </button>

                    <p className="text-slate-500 text-xs text-center leading-relaxed">
                      L'impression génère une mise en page optimisée prête à découper (85mm x 55mm).
                    </p>
                  </div>
                </div>

              </motion.div>

              {/* Print-only layout for the business card */}
              <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-10">
                <style dangerouslySetInnerHTML={{ __html: `
                  @page {
                    size: A4 portrait;
                    margin: 20mm;
                  }
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    .print-card-container, .print-card-container * {
                      visibility: visible !important;
                    }
                    .print-card-container {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      display: flex !important;
                      flex-direction: column !important;
                      gap: 15mm !important;
                      align-items: center !important;
                      justify-content: center !important;
                      height: 100% !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}} />
                
                <div className="print-card-container flex flex-col items-center justify-center bg-white h-screen">
                  {/* PRINT CARD — WHITE / BLACK BORDER */}
                  <div 
                    style={{ border: '2px solid #000000', width: '85mm', height: '55mm', padding: '0', display: 'flex', alignItems: 'stretch', borderRadius: '3mm', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box', overflow: 'hidden', position: 'relative' }}
                  >
                    {/* Theme accent top bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5mm', backgroundColor: cvData.themeColor || '#6366f1' }} />

                    {/* Left Content */}
                    <div style={{ flex: 1, padding: '5mm 4mm 4mm 5mm', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                      {/* Logo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', marginTop: '1mm' }}>
                        <div style={{ width: '6mm', height: '6mm', borderRadius: '1.5mm', backgroundColor: cvData.themeColor || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: '#fff', fontSize: '8px', fontWeight: 900, lineHeight: 1 }}>CV</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                          <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                            <span style={{ color: '#000' }}>CV</span><span style={{ color: cvData.themeColor || '#6366f1' }}>PRO</span>
                          </div>
                          <div style={{ fontSize: '5.5px', color: '#9ca3af', fontWeight: 500, marginTop: '0.5mm', letterSpacing: '0em' }}>cv-pro-creation.vercel.app</div>
                        </div>
                      </div>

                      {/* Name & Title */}
                      <div style={{ marginTop: '2mm' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#000000', textTransform: 'uppercase', lineHeight: 1.15, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cvData.personal.name || 'VOTRE NOM'}
                        </div>
                        <div style={{ fontSize: '8px', fontWeight: 700, color: cvData.themeColor || '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1mm', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cvData.personal.jobTitle || 'Votre Poste'}
                        </div>
                      </div>

                      {/* Contact */}
                      <div style={{ borderTop: '0.5pt solid #d1d5db', paddingTop: '2mm', display: 'flex', flexDirection: 'column', gap: '1mm', fontSize: '7.5px', color: '#374151' }}>
                        {cvData.personal.phone && <div>📞 {cvData.personal.phone}</div>}
                        {cvData.personal.email && <div style={{ wordBreak: 'break-all' }}>✉️ {cvData.personal.email}</div>}
                        {cvData.personal.website && <div style={{ wordBreak: 'break-all' }}>🌐 {cvData.personal.website}</div>}
                      </div>
                    </div>

                    {/* Right: QR Code */}
                    <div style={{ width: '38mm', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5mm', borderLeft: '1pt solid #e5e7eb', padding: '4mm 3mm' }}>
                      <div style={{ border: `2pt solid ${cvData.themeColor || '#6366f1'}`, padding: '1mm', borderRadius: '2mm', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QRCode 
                          value={generateVCard(cvData)}
                          size={95}
                          fgColor="#000000"
                          bgColor="#ffffff"
                          style={{ height: 'auto', maxWidth: '100%', width: '27mm', display: 'block' }}
                          viewBox="0 0 95 95"
                        />
                      </div>
                      <div style={{ fontSize: '6px', fontWeight: 900, letterSpacing: '0.1em', color: cvData.themeColor || '#6366f1', textAlign: 'center' }}>SCAN ME</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
