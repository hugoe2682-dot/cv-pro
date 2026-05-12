import { prisma } from "@/lib/prisma";
import CVPreview from "@/components/CVPreview";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const cv = await prisma.cV.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!cv || !cv.user.emailConfirmed) {
    return { title: "CV non trouvé" };
  }

  return {
    title: `CV de ${(cv.data as any).personal?.name || "Candidat"}`,
    description: (cv.data as any).personal?.summary || "Consultez mon profil professionnel",
  };
}

export default async function PublicCVPage({ params }: { params: { id: string } }) {
  const cv = await prisma.cV.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  // Block access if CV doesn't exist OR user is not confirmed
  if (!cv || !cv.user.emailConfirmed) {
    notFound();
  }

  const cvData = cv.data as any;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 flex justify-center items-start">
      <div className="w-full max-w-[210mm] shadow-2xl rounded-lg overflow-hidden bg-white">
        <CVPreview cvData={cvData} cvId={cv.id} isPublicView={true} />
      </div>
    </div>
  );
}
