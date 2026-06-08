"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

const NO_NAVBAR_ROUTES = ["/editor/print"];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hiddenNav = NO_NAVBAR_ROUTES.includes(pathname);
  const { session, status } = useAuth();

  const isBlocked = status === "authenticated" && (session?.user as any)?.blocked === true;

  useEffect(() => {
    if (isBlocked) {
      setTimeout(() => signOut({ callbackUrl: "/auth/signin?message=Votre compte a été suspendu." }), 2000);
    }
  }, [isBlocked]);

  if (isBlocked) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 bg-red-900/40 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-red-400">Compte suspendu</h1>
          <p className="text-slate-400">Votre compte a été bloqué par l'administrateur. Vous allez être déconnecté...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`flex-1 flex flex-col ${hiddenNav ? "" : "pt-16"}`}>
      {children}
    </main>
  );
}

