"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import ManagerDashboard from "./ManagerDashboard";

export default function ManagerPage() {
  const { session, status } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "manager") {
        router.push("/dashboard");
        return;
      }
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/manager/users");
      if (!res.ok) throw new Error("Accès refusé");
      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      setError(e.message || "Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) return <LoadingScreen message="Chargement du panneau manager..." />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center space-y-4">
        <p className="text-2xl font-bold text-red-400">Accès refusé</p>
        <p className="text-slate-400">{error}</p>
      </div>
    </div>
  );

  return <ManagerDashboard initialUsers={users} onRefresh={fetchUsers} />;
}
