import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendConfirmationCode } from "@/lib/mail";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: userId },
      data: {
        confirmationCode: code,
        confirmationCodeExpires: expires,
      },
    });

    await sendConfirmationCode(user.email!, code);

    return NextResponse.json({ message: "Code envoyé !" });
  } catch (error) {
    console.error("Erreur envoi code:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi du code" }, { status: 500 });
  }
}

