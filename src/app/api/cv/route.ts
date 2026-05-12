import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const cvs = await prisma.cV.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(cvs);
  } catch (error) {
    console.error("Erreur lors de la récupération des CV:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Check if account is confirmed
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailConfirmed: true }
  });

  if (!user?.emailConfirmed) {
    return NextResponse.json({ error: "Veuillez activer votre compte pour sauvegarder votre CV." }, { status: 403 });
  }

  try {
    const { id, name, data } = await request.json();
    const userId = session.user.id;

    // Update User profile with basic info from CV
    if (data.personal) {
      const currentUser = await prisma.user.findUnique({ where: { id: userId } });
      if (currentUser) {
        const userUpdateData: any = {
          address: data.personal.address,
          phone: data.personal.phone,
        };

        if (!currentUser.firstName && data.personal.firstName) userUpdateData.firstName = data.personal.firstName;
        if (!currentUser.lastName && data.personal.lastName) userUpdateData.lastName = data.personal.lastName;
        if (!currentUser.name && data.personal.name) userUpdateData.name = data.personal.name;
        if (!currentUser.birthDate && data.personal.dateOfBirth) userUpdateData.birthDate = new Date(data.personal.dateOfBirth);
        if (!currentUser.nationality && data.personal.nationality) userUpdateData.nationality = data.personal.nationality;

        await prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        }).catch((err: any) => console.error("Failed to update user profile:", err));
      }
    }

    if (id) {
      // Update existing CV
      const updatedCv = await prisma.cV.update({
        where: { id, userId },
        data: {
          name: name || "Mon CV",
          data: data,
        },
      });
      return NextResponse.json(updatedCv);
    } else {
      // Create new CV
      const newCv = await prisma.cV.create({
        data: {
          userId,
          name: name || "Mon CV",
          data: data,
        },
      });
      return NextResponse.json(newCv);
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du CV:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
