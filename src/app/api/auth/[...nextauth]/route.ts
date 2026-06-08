import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import { sendWelcomeEmail } from "@/lib/mail";
import { isManagerEmail } from "@/lib/manager";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: "N/A",
          lastName: "N/A",
          emailConfirmed: true,
          // Role is determined purely by email — not stored value
          role: isManagerEmail(profile.email) ? "manager" : "user",
          blocked: false,
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 100 * 60, // 100 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailConfirmed = user.emailConfirmed;
      }
      // Refresh blocked status from DB; role is enforced by email only
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { blocked: true, emailConfirmed: true, email: true },
          });
          if (dbUser) {
            token.blocked = dbUser.blocked;
            token.emailConfirmed = dbUser.emailConfirmed;
            // ✅ Role ALWAYS determined by email — cannot be changed in DB
            token.role = isManagerEmail(dbUser.email) ? "manager" : "user";
          }
        } catch (_) {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.emailConfirmed = token.emailConfirmed;
        // ✅ Double-check: role enforced by email in session too
        session.user.role = isManagerEmail(session.user.email) ? "manager" : "user";
        session.user.blocked = (token.blocked as boolean) ?? false;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        await sendWelcomeEmail(user.email, user.name || "Utilisateur");
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
