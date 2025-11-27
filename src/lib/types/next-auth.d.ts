import { UserRole, AccountStatus } from "@/lib/prisma/enums";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: AccountStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    status: AccountStatus;
  }
}
