import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        nationality: true,
        address: true,
        phone: true,
        image: true,
        emailConfirmed: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { address, phone, firstName, lastName, birthDate, nationality, image } = await request.json();
    const userId = session.user.id;

    // Fetch current user to check if fields are already filled
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const updateData: any = {
      address,
      phone,
      image,
    };

    // Only update these fields if they were null or "N/A" (permanent after first fill)
    const isFirstNameNA = !currentUser.firstName || currentUser.firstName === "N/A";
    const isLastNameNA = !currentUser.lastName || currentUser.lastName === "N/A";

    if (isFirstNameNA && firstName && firstName !== "N/A") updateData.firstName = firstName;
    if (isLastNameNA && lastName && lastName !== "N/A") updateData.lastName = lastName;
    
    // For other fields, we can keep the current logic or allow updates
    if (!currentUser.birthDate && birthDate) updateData.birthDate = new Date(birthDate);
    if (!currentUser.nationality && nationality) updateData.nationality = nationality;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

