import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    const userId = session.user.id;

    if (!code) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.confirmationCode !== code) {
      return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
    }

    if (user.confirmationCodeExpires && user.confirmationCodeExpires < new Date()) {
      return NextResponse.json({ error: "Code expiré" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailConfirmed: true,
        confirmationCode: null,
        confirmationCodeExpires: null,
      },
    });

    // Envoyer l'email de bienvenue
    if (user.email) {
      await sendWelcomeEmail(user.email, user.name || "Utilisateur");
    }

    return NextResponse.json({ message: "Compte activé avec succès !" });
  } catch (error) {
    console.error("Erreur vérification code:", error);
    return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
  }
}

