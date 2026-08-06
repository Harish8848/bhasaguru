import { UserRole, AccountStatus } from '@/generated/prisma/client';
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from '@/lib/prisma';

interface CustomJWT extends JWT {
  id: string;
  role: UserRole;
  status: AccountStatus;
  profilePicture?: string | null;
}

// Resolve the auth secret with AUTH_SECRET as a fallback for @auth/core v0.34+ compatibility.
// Fail fast if no secret is configured to prevent NextAuth from auto-generating a random
// secret that changes on every server restart (which causes JWEDecryptionFailed errors).
const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error(
    "Missing authentication secret. Set NEXTAUTH_SECRET (or AUTH_SECRET) in your environment variables."
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  // Use a custom cookie name to invalidate any stale session cookies that were
  // encrypted with a previous/different secret. This forces users to re-authenticate
  // with the current secret, resolving JWEDecryptionFailed errors.
  cookies: {
    sessionToken: {
      name: `bhasaguru.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }: { token: CustomJWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.profilePicture = user.profilePicture;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: CustomJWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.profilePicture = token.profilePicture;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
};