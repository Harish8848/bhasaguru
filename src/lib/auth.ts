import { UserRole, AccountStatus } from '@/generated/prisma/client';
import { NextAuthOptions, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from '@/lib/prisma';

interface CustomUser extends User {
  id: string;
  role: UserRole;
  status: AccountStatus;
}

interface CustomJWT extends Partial<JWT> {
  id: string;
  role: UserRole;
  status: AccountStatus;
  picture?: string | null;
}

interface CustomSession extends Session {
  user: {
    id: string;
    role: UserRole;
    status: AccountStatus;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: CustomJWT; user?: CustomUser }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }: { session: CustomSession; token: CustomJWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
