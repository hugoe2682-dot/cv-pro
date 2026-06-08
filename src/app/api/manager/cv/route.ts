import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function requireManager() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "manager") {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }
  return { session };
}

// DELETE /api/manager/cv — delete a specific CV by id
export async function DELETE(request: Request) {
  const { error } = await requireManager();
  if (error) return error;

  try {
    const { cvId } = await request.json();
    if (!cvId) return NextResponse.json({ error: "cvId requis" }, { status: 400 });

    await prisma.cV.delete({ where: { id: cvId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Manager DELETE cv error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
