"use client";

import Link from "next/link";
import { Mail, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-100/50 dark:bg-slate-950/40 backdrop-blur-md border-t border-slate-200 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand and Description */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-block group transition-all">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 border-2 border-indigo-600 dark:border-white/80 rounded flex items-center justify-center group-hover:border-indigo-500 dark:group-hover:border-white transition-all">
                  <span className="font-black text-lg tracking-tight text-indigo-600 dark:text-white leading-none">CV</span>
                </div>
                <span className="italic lowercase font-light text-xl text-slate-800 dark:text-white tracking-wide ml-1 opacity-90">pro</span>
              </div>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
              Créez votre curriculum vitae professionnel en un clic et gratuit. Des designs modernes, percutants et approuvés par les recruteurs pour booster votre carrière.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              <Sparkles size={14} className="animate-pulse" />
              <span>Optimisé pour créer en un clic</span>
            </div>
          </div>

          {/* Navigation links - Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/editor" 
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200 block py-1"
                >
                  Créateur de CV
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200 block py-1"
                >
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/signin" 
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200 block py-1"
                >
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation links - Legal & Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Légal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200 block py-1"
                >
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200 block py-1"
                >
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@cvpro.com" 
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors duration-200 block py-1"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-900/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
            <span>© {currentYear} CV Pro. Tous droits réservés. Faits avec</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
            <span>pour votre réussite professionnelle. ceo cv pro</span>
          </div>

          {/* Social connections */}
          <div className="flex items-center gap-4">
            {[
              { icon: GithubIcon, href: "https://github.com", label: "GitHub" },
              { icon: LinkedinIcon, href: "https://linkedin.com", label: "LinkedIn" },
              { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
              { icon: Mail, href: "mailto:support@cvpro.com", label: "Email" }
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15 }}
                className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-900/50 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-colors duration-200"
                aria-label={social.label}
              >
                <social.icon size={16} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
