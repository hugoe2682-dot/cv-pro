"use client";

import { usePathname } from "next/navigation";

// Routes où la navbar est cachée → pas besoin du padding-top pt-16
const NO_NAVBAR_ROUTES = ["/editor/print"];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hiddenNav = NO_NAVBAR_ROUTES.includes(pathname);

  return (
    <main className={`flex-1 flex flex-col ${hiddenNav ? "" : "pt-16"}`}>
      {children}
    </main>
  );
}
