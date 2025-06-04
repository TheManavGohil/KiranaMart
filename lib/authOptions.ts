import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // You can implement your own logic here or always return null
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  secret: process.env.JWT_SECRET || "fallback-secret-for-development",
}; 