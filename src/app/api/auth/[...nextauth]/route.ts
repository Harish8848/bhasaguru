<<<<<<< HEAD
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
        // Fetch additional user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.status = dbUser.status;
          (session.user as any).profilePicture = dbUser.profilePicture;
        }
      }
      return session;
    },
    redirect: ({ url, baseUrl }) => {
      return baseUrl;
    },
  },
  events: {
    signOut: async (message) => {
      console.log("User signed out:", message);
    },
    createUser: async (user) => {
      console.log("New user created:", user.email);
      try {
        await prisma.adminNotification.create({
          data: {
            type: 'NEW_USER_REGISTRATION',
            title: 'New User Registration',
            message: `A new user${user.name ? ` (${user.name})` : ''} has registered with email: ${user.email}`,
            metadata: {
              userId: user.id,
              email: user.email,
              name: user.name,
            },
          },
        })
      } catch (error) {
        console.error('Failed to create notification for new user:', error)
      }
    },
  },
};
=======
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
>>>>>>> 0e80ed9 (Add new configuration for Llama 3.3 model and update auth imports across API routes)

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };