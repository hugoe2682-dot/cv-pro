import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import { sendWelcomeEmail } from "@/lib/mail";

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
        }
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
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.emailConfirmed = token.emailConfirmed;
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
