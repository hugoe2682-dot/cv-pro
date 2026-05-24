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
    const cvs = await prisma.cV.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    // Re-inject the stored profilePhoto back into data.personal.photo
    // so the editor and preview work transparently
    const cvsWithPhoto = cvs.map((cv) => {
      const data = cv.data as any;
      if (cv.profilePhoto && data?.personal) {
        data.personal.photo = cv.profilePhoto;
      }
      return { ...cv, data };
    });

    return NextResponse.json(cvsWithPhoto);
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
    select: { emailConfirmed: true },
  });

  if (!user?.emailConfirmed) {
    return NextResponse.json(
      { error: "Veuillez activer votre compte pour sauvegarder votre CV." },
      { status: 403 }
    );
  }

  try {
    const { id, name, data } = await request.json();
    const userId = session.user.id;

    // Extract the photo from the JSON data to store it separately
    let profilePhoto: string | null = null;
    const dataToStore = { ...data };
    if (dataToStore?.personal?.photo) {
      profilePhoto = dataToStore.personal.photo;
      // Remove photo from JSON so the column stays small and fast
      dataToStore.personal = { ...dataToStore.personal, photo: "" };
    }

    // Update User profile with basic info from CV
    if (data.personal) {
      const currentUser = await prisma.user.findUnique({ where: { id: userId } });
      if (currentUser) {
        const userUpdateData: any = {
          address: data.personal.address,
          phone: data.personal.phone,
          // Store the photo URL on the user profile as well
          image: profilePhoto ?? data.personal.photo,
        };

        if (!currentUser.firstName && data.personal.firstName) userUpdateData.firstName = data.personal.firstName;
        if (!currentUser.lastName && data.personal.lastName) userUpdateData.lastName = data.personal.lastName;
        if (!currentUser.name && data.personal.name) userUpdateData.name = data.personal.name;
        if (!currentUser.birthDate && data.personal.dateOfBirth)
          userUpdateData.birthDate = new Date(data.personal.dateOfBirth);
        if (!currentUser.nationality && data.personal.nationality)
          userUpdateData.nationality = data.personal.nationality;

        await prisma.user
          .update({ where: { id: userId }, data: userUpdateData })
          .catch((err: any) => console.error("Failed to update user profile:", err));
      }
    }

    if (id) {
      // Update existing CV — only update profilePhoto if a new one was provided
      const updatePayload: any = {
        name: name || "Mon CV",
        data: dataToStore,
      };
      if (profilePhoto !== null) {
        updatePayload.profilePhoto = profilePhoto;
      }

      const updatedCv = await prisma.cV.update({
        where: { id, userId },
        data: updatePayload,
      });

      // Re-inject photo for the response so client stays in sync
      const responseData = updatedCv.data as any;
      if (updatedCv.profilePhoto && responseData?.personal) {
        responseData.personal.photo = updatedCv.profilePhoto;
      }
      return NextResponse.json({ ...updatedCv, data: responseData });
    } else {
      // Create new CV
      const newCv = await prisma.cV.create({
        data: {
          userId,
          name: name || "Mon CV",
          data: dataToStore,
          profilePhoto: profilePhoto ?? undefined,
        },
      });

      // Re-inject photo for the response
      const responseData = newCv.data as any;
      if (newCv.profilePhoto && responseData?.personal) {
        responseData.personal.photo = newCv.profilePhoto;
      }
      return NextResponse.json({ ...newCv, data: responseData });
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du CV:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
