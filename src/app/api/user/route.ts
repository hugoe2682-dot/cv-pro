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

    // Automatically sync newly filled profile details directly to any existing CVs
    try {
      const userCvs = await prisma.cV.findMany({
        where: { userId },
      });

      if (userCvs.length > 0) {
        const formatDateToDDMMYYYY = (dateVal: Date | string | null | undefined) => {
          if (!dateVal) return "";
          const d = new Date(dateVal);
          if (isNaN(d.getTime())) return "";
          const day = d.getDate().toString().padStart(2, '0');
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          return `${day}/${month}/${d.getFullYear()}`;
        };

        for (const cv of userCvs) {
          const cvData = (cv.data as any) || {};
          if (!cvData.personal) {
            cvData.personal = {};
          }

          let hasChanges = false;

          if (!cvData.personal.firstName && updatedUser.firstName) {
            cvData.personal.firstName = updatedUser.firstName;
            hasChanges = true;
          }
          if (!cvData.personal.lastName && updatedUser.lastName) {
            cvData.personal.lastName = updatedUser.lastName;
            hasChanges = true;
          }
          if (hasChanges || !cvData.personal.name) {
            cvData.personal.name = `${cvData.personal.firstName || ""} ${cvData.personal.lastName || ""}`.trim();
            hasChanges = true;
          }
          if (!cvData.personal.email && updatedUser.email) {
            cvData.personal.email = updatedUser.email;
            hasChanges = true;
          }
          if (!cvData.personal.phone && updatedUser.phone) {
            cvData.personal.phone = updatedUser.phone;
            hasChanges = true;
          }
          if (!cvData.personal.address && updatedUser.address) {
            cvData.personal.address = updatedUser.address;
            hasChanges = true;
          }
          if (!cvData.personal.nationality && updatedUser.nationality) {
            cvData.personal.nationality = updatedUser.nationality;
            hasChanges = true;
          }
          if (!cvData.personal.dateOfBirth && updatedUser.birthDate) {
            cvData.personal.dateOfBirth = formatDateToDDMMYYYY(updatedUser.birthDate);
            hasChanges = true;
          }

          const updatePayload: any = {};
          if (hasChanges) {
            updatePayload.data = cvData;
          }
          // If CV doesn't have a profile photo yet, sync from the user profile
          if (!cv.profilePhoto && updatedUser.image) {
            updatePayload.profilePhoto = updatedUser.image;
          }

          if (Object.keys(updatePayload).length > 0) {
            await prisma.cV.update({
              where: { id: cv.id },
              data: updatePayload,
            });
          }
        }
      }
    } catch (cvSyncError) {
      console.error("Erreur lors de la synchronisation du CV avec le profil :", cvSyncError);
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

