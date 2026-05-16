import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CV Pro | Créateur de CV",
  description: "Créez votre CV professionnel en quelques minutes avec des designs modernes.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col pt-16">
            {children}
          </main>
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
