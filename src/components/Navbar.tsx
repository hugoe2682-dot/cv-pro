"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { FileText, LogIn, LogOut, Menu, X, Award, GraduationCap, User, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, session } = useAuth();
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cvData, setCvData] = useState<any>(null);

  useEffect(() => {
    if (session && isMenuOpen) {
      // Fetch CV data to show certificates and diplomas in the menu
      fetch("/api/cv")
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setCvData(data[0].data);
          }
        })
        .catch(err => console.error("Error fetching CV for menu:", err));
    }
  }, [session, isMenuOpen]);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = (e: Event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const target = e.target as HTMLElement | Document;
          
          // Check if it's the main document or the editor pane
          const isEditorPane = (target as HTMLElement).id === "editor-scroll-pane";
          const isDocument = target === document || target === document.documentElement || target === document.body;
          
          if (isEditorPane || isDocument) {
            const currentScrollY = isEditorPane ? (target as HTMLElement).scrollTop : window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
              setShowNav(false);
            } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
              setShowNav(true);
            }
            setLastScrollY(currentScrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [lastScrollY]);

  // ✅ Les retours conditionnels après tous les hooks


  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        showNav ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      } bg-indigo-600/90 dark:bg-slate-950/90 backdrop-blur-md shadow-lg text-white border-b border-white/10 dark:border-slate-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              {session && (
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  <Menu size={24} />
                </button>
              )}
              <Link href="/" className="flex items-center group transition-all">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 border-2 border-white/80 rounded flex items-center justify-center group-hover:border-white transition-all">
                    <span className="font-black text-lg tracking-tight text-white leading-none">CV</span>
                  </div>
                  <span className="italic lowercase font-light text-xl text-white tracking-wide ml-1 opacity-90">pro</span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <div className="hidden md:flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm font-medium hover:text-white/80 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/editor" className="text-sm font-medium hover:text-white/80 transition-colors">
                      Éditeur
                    </Link>
                  </div>
                    <div className="flex items-center gap-3 ml-4 border-l border-white/20 pl-4">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt="" 
                          className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-sm" 
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                          <User size={18} className="text-white/60" />
                        </div>
                      )}
                      <div className="flex flex-col items-start hidden sm:flex">
                        <span className="text-xs font-bold leading-tight">
                          {session.user?.name || "Candidat"}
                        </span>
                        <span className="text-[10px] text-white/60 leading-tight">
                          Connecté
                        </span>
                      </div>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-full hover:bg-slate-100 transition-all shadow-sm ml-2"
                    >
                      <LogOut size={16} />
                      <span className="hidden sm:inline">Se déconnecter</span>
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => signIn()}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-600 bg-white rounded-full hover:bg-slate-100 shadow-lg transition-all"
                >
                  <LogIn size={16} />
                  Se connecter
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            
            {/* Sidebar */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-[70] overflow-y-auto custom-scrollbar"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                      <FileText size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-xl dark:text-white">Mon Compte</span>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors dark:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                    >
                      <LayoutDashboard size={20} className="text-indigo-600" />
                      <span className="font-medium">Tableau de bord</span>
                    </Link>
                    <Link 
                      href="/editor" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                    >
                      <FileText size={20} className="text-indigo-600" />
                      <span className="font-medium">Éditeur de CV</span>
                    </Link>
                  </div>

                  {/* Diplômes Section */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                      <GraduationCap size={14} /> Diplômes
                    </h3>
                    <div className="space-y-1">
                      {cvData?.education?.length > 0 ? (
                        cvData.education.map((edu: any, i: number) => (
                          <div key={i} className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{edu.degree}</p>
                            <p className="text-xs text-slate-500 truncate">{edu.school}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 px-3 italic">Aucun diplôme ajouté</p>
                      )}
                    </div>
                  </div>

                  {/* Certificats Section */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                      <Award size={14} /> Certificats
                    </h3>
                    <div className="space-y-1">
                      {cvData?.certificates?.length > 0 ? (
                        cvData.certificates.map((cert: any, i: number) => (
                          <div key={i} className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            {cert.image && (
                              <img src={cert.image} alt="" className="w-8 h-8 rounded object-cover border border-slate-200" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{cert.title}</p>
                              <p className="text-[10px] text-slate-500">{cert.showOnCV ? "Sur le CV" : "Via QR Code"}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 px-3 italic">Aucun certificat ajouté</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut size={20} />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
