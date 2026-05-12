import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const user = session?.user;

  return {
    user,
    session,
    loading,
    status,
    isAuthenticated: !!session,
  };
}
