"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, FileText, Sparkles, Zap, LayoutDashboard, UserPlus } from "lucide-react";
import Footer from "@/components/Footer";

export default function Home() {
  const { session } = useAuth();
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/20 blur-[120px] pointer-events-none" />

      {/* Hero Content wrapper */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-16 md:py-24 z-10">
        <div className="max-w-5xl w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-8"
          >
            <Sparkles size={16} />
            <span className="text-sm font-medium">Créez votre CV en quelques minutes</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Démarquez-vous avec un <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
              CV Professionnel
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10"
          >
            Créez votre curriculum vitae professionnel en un clic et gratuit. Des designs modernes, percutants et approuvés par les recruteurs pour booster votre carrière.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              href="/editor"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white rounded-full font-medium text-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-lg hover:shadow-indigo-500/25 group"
            >
              Créer mon CV
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href={session ? "/dashboard" : "/auth/signup"}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full font-medium text-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              {session ? (
                <>
                  <LayoutDashboard size={20} />
                  Tableau de bord
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Créer un compte
                </>
              )}
            </Link>
          </motion.div>

          {/* Features preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
          >
            {[
              { icon: Zap, title: "Rapide", desc: "Remplissez vos informations et générez votre CV instantanément." },
              { icon: FileText, title: "Moderne", desc: "Des designs professionnels approuvés par les recruteurs." },
              { icon: Sparkles, title: "Intuitif", desc: "Une interface fluide avec aperçu en temps réel." },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl glass dark:glass-dark flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-500">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
