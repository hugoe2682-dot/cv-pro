import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Middleware helper: check if current session user is manager
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

// GET /api/manager/users — list all users with their CVs count
export async function GET() {
  const { error } = await requireManager();
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        phone: true,
        address: true,
        nationality: true,
        birthDate: true,
        emailConfirmed: true,
        createdAt: true,
        role: true,
        blocked: true,
        cvs: {
          select: {
            id: true,
            name: true,
            updatedAt: true,
            profilePhoto: true,
            data: true,
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error("Manager GET users error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/manager/users — update user (block/unblock, change role, update info)
export async function PATCH(request: Request) {
  const { error } = await requireManager();
  if (error) return error;

  try {
    const { userId, action, data } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    let updateData: any = {};

    if (action === "block") {
      updateData.blocked = true;
    } else if (action === "unblock") {
      updateData.blocked = false;
    } else if (action === "update" && data) {
      // Selective field update
      const allowed = ["firstName", "lastName", "email", "phone", "address", "nationality"];
      for (const key of allowed) {
        if (data[key] !== undefined) updateData[key] = data[key];
      }
    } else {
      return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        blocked: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Manager PATCH user error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/manager/users — delete a user account and all their CVs
export async function DELETE(request: Request) {
  const { error } = await requireManager();
  if (error) return error;

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Manager DELETE user error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
