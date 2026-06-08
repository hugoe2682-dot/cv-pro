"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, FileText, Shield, ShieldOff, Trash2, Eye,
  RefreshCw, Search, X, ChevronDown, ChevronUp,
  Mail, Phone, MapPin, Calendar, Globe, CreditCard,
  AlertTriangle, CheckCircle, User, Download
} from "lucide-react";

interface CV {
  id: string;
  name: string;
  updatedAt: string;
  profilePhoto: string | null;
  data: any;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  phone: string | null;
  address: string | null;
  nationality: string | null;
  birthDate: string | null;
  emailConfirmed: boolean;
  createdAt: string;
  role: string;
  blocked: boolean;
  cvs: CV[];
}

interface Props {
  initialUsers: UserData[];
  onRefresh: () => void;
}

export default function ManagerDashboard({ initialUsers, onRefresh }: Props) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedCV, setExpandedCV] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; msg: string; action: () => void;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
    showToast("Données actualisées");
  };

  const confirm = (title: string, msg: string, action: () => void) => {
    setConfirmDialog({ title, msg, action });
  };

  const handleBlock = async (userId: string, block: boolean) => {
    confirm(
      block ? "Bloquer ce compte ?" : "Débloquer ce compte ?",
      block
        ? "L'utilisateur ne pourra plus accéder à son compte."
        : "L'utilisateur pourra de nouveau se connecter.",
      async () => {
        setConfirmDialog(null);
        const res = await fetch("/api/manager/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action: block ? "block" : "unblock" }),
        });
        if (res.ok) {
          setUsers(u => u.map(x => x.id === userId ? { ...x, blocked: block } : x));
          showToast(block ? "Compte bloqué" : "Compte débloqué");
        } else {
          showToast("Erreur", false);
        }
      }
    );
  };

  const handleDeleteUser = async (userId: string) => {
    confirm(
      "Supprimer ce compte ?",
      "Toutes les données et CV de cet utilisateur seront supprimés définitivement.",
      async () => {
        setConfirmDialog(null);
        const res = await fetch("/api/manager/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) {
          setUsers(u => u.filter(x => x.id !== userId));
          showToast("Compte supprimé");
        } else {
          showToast("Erreur", false);
        }
      }
    );
  };

  const handleDeleteCV = async (cvId: string, userId: string) => {
    confirm(
      "Supprimer ce CV ?",
      "Ce CV sera définitivement supprimé.",
      async () => {
        setConfirmDialog(null);
        const res = await fetch("/api/manager/cv", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cvId }),
        });
        if (res.ok) {
          setUsers(u => u.map(x =>
            x.id === userId ? { ...x, cvs: x.cvs.filter(c => c.id !== cvId) } : x
          ));
          showToast("CV supprimé");
        } else {
          showToast("Erreur", false);
        }
      }
    );
  };

  const filtered = users.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    blocked: users.filter(u => u.blocked).length,
    confirmed: users.filter(u => u.emailConfirmed).length,
    cvs: users.reduce((a, u) => a + u.cvs.length, 0),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Panneau Manager</h1>
                <p className="text-slate-400 text-sm">Gestion des comptes et CV</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              Actualiser
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Utilisateurs", value: stats.total, icon: Users, color: "text-blue-400" },
              { label: "Comptes bloqués", value: stats.blocked, icon: ShieldOff, color: "text-red-400" },
              { label: "Comptes confirmés", value: stats.confirmed, icon: CheckCircle, color: "text-emerald-400" },
              { label: "CV créés", value: stats.cvs, icon: FileText, color: "text-violet-400" },
            ].map(s => (
              <div key={s.label} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <s.icon size={20} className={`${s.color} mb-2`} />
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-slate-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-violet-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filtered.map(u => (
            <UserCard
              key={u.id}
              user={u}
              isExpanded={expandedUser === u.id}
              expandedCV={expandedCV}
              onToggle={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
              onToggleCV={id => setExpandedCV(expandedCV === id ? null : id)}
              onBlock={b => handleBlock(u.id, b)}
              onDeleteUser={() => handleDeleteUser(u.id)}
              onDeleteCV={cvId => handleDeleteCV(cvId, u.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <Users size={40} className="mx-auto mb-4 opacity-30" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 right-8 px-6 py-3 rounded-2xl font-bold text-white shadow-2xl z-[200] ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <AlertTriangle size={32} className="text-amber-400 mb-4" />
              <h3 className="text-xl font-black text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-400 mb-6 text-sm">{confirmDialog.msg}</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDialog.action}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserCard({ user, isExpanded, expandedCV, onToggle, onToggleCV, onBlock, onDeleteUser, onDeleteCV }: {
  user: UserData;
  isExpanded: boolean;
  expandedCV: string | null;
  onToggle: () => void;
  onToggleCV: (id: string) => void;
  onBlock: (block: boolean) => void;
  onDeleteUser: () => void;
  onDeleteCV: (cvId: string) => void;
}) {
  const photo = user.image || user.cvs?.[0]?.profilePhoto;
  const cvData = user.cvs?.[0]?.data;
  const jobTitle = cvData?.personal?.jobTitle || "";

  return (
    <motion.div
      layout
      className={`bg-slate-900 border rounded-3xl overflow-hidden transition-all ${
        user.blocked ? "border-red-800/50" : "border-slate-800"
      }`}
    >
      {/* User Header Row */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={onToggle}
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={22} className="text-slate-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white truncate">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.name || "Sans nom"}
            </span>
            {user.blocked && (
              <span className="text-xs bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full font-bold">BLOQUÉ</span>
            )}
            {!user.emailConfirmed && (
              <span className="text-xs bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded-full font-bold">Non confirmé</span>
            )}
            {user.role === "manager" && (
              <span className="text-xs bg-violet-900/60 text-violet-300 px-2 py-0.5 rounded-full font-bold">MANAGER</span>
            )}
          </div>
          <p className="text-slate-400 text-sm truncate">{user.email}</p>
          {jobTitle && <p className="text-slate-500 text-xs truncate">{jobTitle}</p>}
        </div>

        {/* CV Count + Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
            {user.cvs.length} CV
          </span>
          {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-800 pt-5 space-y-6">
              {/* User Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: Mail, label: "Email", value: user.email },
                  { icon: Phone, label: "Téléphone", value: user.phone },
                  { icon: MapPin, label: "Adresse", value: user.address },
                  { icon: Globe, label: "Nationalité", value: user.nationality },
                  { icon: Calendar, label: "Naissance", value: user.birthDate ? new Date(user.birthDate).toLocaleDateString("fr-FR") : null },
                  { icon: Calendar, label: "Inscrit le", value: new Date(user.createdAt).toLocaleDateString("fr-FR") },
                ].map(item => item.value ? (
                  <div key={item.label} className="flex items-center gap-3 bg-slate-800/50 rounded-2xl px-4 py-3">
                    <item.icon size={14} className="text-slate-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-slate-300 truncate font-medium">{item.value}</p>
                    </div>
                  </div>
                ) : null)}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {user.blocked ? (
                  <button
                    onClick={() => onBlock(false)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700/30 hover:bg-emerald-700/50 text-emerald-300 rounded-xl text-sm font-bold transition-all border border-emerald-700/30"
                  >
                    <CheckCircle size={14} /> Débloquer
                  </button>
                ) : (
                  <button
                    onClick={() => onBlock(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-700/30 hover:bg-amber-700/50 text-amber-300 rounded-xl text-sm font-bold transition-all border border-amber-700/30"
                  >
                    <ShieldOff size={14} /> Bloquer
                  </button>
                )}
                <button
                  onClick={onDeleteUser}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-xl text-sm font-bold transition-all border border-red-800/30"
                >
                  <Trash2 size={14} /> Supprimer le compte
                </button>
              </div>

              {/* CVs Section */}
              {user.cvs.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText size={14} /> CV ({user.cvs.length})
                  </h3>
                  <div className="space-y-3">
                    {user.cvs.map((cv: CV) => (
                      <CVCard
                        key={cv.id}
                        cv={cv}
                        isExpanded={expandedCV === cv.id}
                        onToggle={() => onToggleCV(cv.id)}
                        onDelete={() => onDeleteCV(cv.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CVCard({ cv, isExpanded, onToggle, onDelete }: any) {
  const p = cv.data?.personal || {};
  const skills = cv.data?.skills || [];
  const experience = cv.data?.experience || [];
  const education = cv.data?.education || [];
  const photo = cv.profilePhoto || p.photo;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={onToggle}
      >
        {photo ? (
          <img src={photo} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-600 flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
            <CreditCard size={16} className="text-slate-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{cv.name}</p>
          <p className="text-xs text-slate-400">
            {p.jobTitle || "Poste non défini"} · Modifié le {new Date(cv.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={`/cv/${cv.id}`}
            target="_blank"
            onClick={e => e.stopPropagation()}
            className="p-2 bg-slate-700 hover:bg-violet-700 rounded-lg transition-colors"
            title="Voir le CV"
          >
            <Eye size={14} />
          </a>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-2 bg-slate-700 hover:bg-red-700 rounded-lg transition-colors"
            title="Supprimer le CV"
          >
            <Trash2 size={14} />
          </button>
          {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-700 pt-4 space-y-4">
              {/* Personal info */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Nom complet", val: p.name || `${p.firstName||""} ${p.lastName||""}`.trim() },
                  { label: "Email", val: p.email },
                  { label: "Téléphone", val: p.phone },
                  { label: "Adresse", val: p.address },
                  { label: "Nationalité", val: p.nationality },
                  { label: "Date de naissance", val: p.dateOfBirth },
                ].filter(x => x.val).map(x => (
                  <div key={x.label} className="bg-slate-900 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-slate-500 uppercase">{x.label}</p>
                    <p className="text-slate-300 text-xs font-medium truncate">{x.val}</p>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: "Expériences", count: experience.length },
                  { label: "Formations", count: education.length },
                  { label: "Compétences", count: skills.length },
                ].map(s => (
                  <div key={s.label} className="bg-violet-900/20 border border-violet-800/30 rounded-xl px-4 py-2 text-center">
                    <p className="text-xl font-black text-violet-300">{s.count}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {p.summary && (
                <div className="bg-slate-900 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Résumé</p>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">{p.summary}</p>
                </div>
              )}

              {/* Business card QR info */}
              <div className="flex gap-2 flex-wrap">
                {p.linkedin && (
                  <span className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full border border-blue-800/30">LinkedIn</span>
                )}
                {p.whatsapp && (
                  <span className="text-xs bg-emerald-900/30 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800/30">WhatsApp</span>
                )}
                {p.website && (
                  <span className="text-xs bg-violet-900/30 text-violet-300 px-3 py-1 rounded-full border border-violet-800/30">Site Web</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
