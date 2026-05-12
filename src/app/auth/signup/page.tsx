"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      router.push(`/auth/signin?message=Compte créé ! Connectez-vous.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFirstName = (val: string) => {
    let clean = val.replace(/[^a-zA-ZàâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ]/g, '');
    if (clean.length > 0) {
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }
    return clean;
  };

  const formatLastName = (val: string) => {
    return val.toUpperCase().replace(/[^A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ]/g, '');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-blue-600 rounded-[2.5rem] shadow-2xl p-8 sm:p-10 flex flex-col relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-2 mb-8">
          <div className="px-2 py-0.5 border-2 border-white rounded flex items-center justify-center shadow-sm">
            <span className="font-black text-lg tracking-tight text-white leading-none">CV</span>
          </div>
          <span className="italic lowercase font-light text-xl text-white tracking-wide ml-1 opacity-90">pro</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-6 text-center">Créer un compte</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-medium flex flex-col gap-2">
            <span>{error}</span>
            {error.includes("déjà associé") && (
              <Link href="/auth/signin" className="text-indigo-600 font-bold hover:underline">
                Se connecter maintenant →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-blue-600/50" />
              </div>
              <input
                type="text"
                required
                placeholder="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(formatFirstName(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-white/95 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none text-sm text-slate-900"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="Nom"
                value={lastName}
                onChange={(e) => setLastName(formatLastName(e.target.value))}
                className="w-full px-3 py-2.5 bg-white/95 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-blue-600/50" />
            </div>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/95 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none text-slate-900"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-blue-600/50" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3 bg-white/95 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none text-slate-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-600/50 hover:text-blue-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-blue-600/50" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Confirmer mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/95 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "S'inscrire"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-blue-600 px-4 text-white/60 font-medium">Ou continuer avec</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signIn("google", { callbackUrl: "/editor" })}
          className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </motion.button>

        <p className="text-white/80 text-sm text-center">
          Déjà un compte ?{" "}
          <Link href="/auth/signin" className="text-white font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
