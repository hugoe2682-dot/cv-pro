"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
        .then((res) => {
          if (res.ok) setStatus("success");
          else setStatus("error");
        })
        .catch(() => setStatus("error"));
    }
  }, [userId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p>Confirmation de votre compte...</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle className="text-green-500 mb-4" size={48} />
            <h1 className="text-2xl font-bold mb-2">Compte confirmé !</h1>
            <p className="text-slate-600 mb-6">Vous pouvez maintenant vous connecter sur votre ordinateur.</p>
            <button 
              onClick={() => router.push("/auth/signin")}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all"
            >
              Se connecter
            </button>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="text-red-500 mb-4" size={48} />
            <h1 className="text-2xl font-bold mb-2">Erreur</h1>
            <p className="text-slate-600">Le lien de confirmation est invalide ou a expiré.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
