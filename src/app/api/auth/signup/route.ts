import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, password } = await request.json();

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà associé à un compte. Veuillez vous connecter." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        emailConfirmed: false,
      } as any,
    });

    return NextResponse.json({ message: "Compte créé avec succès", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Erreur signup:", error);
    return NextResponse.json({ error: "Erreur lors de la création du compte" }, { status: 500 });
  }
}
