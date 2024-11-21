//app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const isHOD = await prisma.hOD.findUnique({
          where: { email: user.email },
        });

        const isTeamLead = await prisma.teamLead.findUnique({
          where: { email: user.email },
        });

        if (isHOD) {
          user.role = "HOD";
          return true;
        }

        if (isTeamLead) {
          user.role = "TeamLead";
          return true;
        }

        return false; // Reject sign-in if email isn't found
      } catch (error) {
        console.error("Error during signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // Persist user role in the JWT token
      if (user) {
        token.role = user.role || null;
      }
      return token;
    },
    async session({ session, token }) {
      // Include role in session object
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ baseUrl, url, session }) {
      // Use the session's user role for redirection
      if (session?.user?.role === "HOD") {
        return `${baseUrl}/hod`;
      }
      if (session?.user?.role === "TeamLead") {
        return `${baseUrl}/teamlead`;
      }
      return baseUrl; // Default fallback
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debugging for detailed logs
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
