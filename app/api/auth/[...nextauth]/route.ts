import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Simple configuration for NextAuth.js to prevent client-side errors
 * This is a minimal implementation that won't interfere with your existing JWT auth
 * but will stop the error messages
 */
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This will never actually be used since we're using custom JWT auth
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  secret: process.env.JWT_SECRET || "fallback-secret-for-development",
});

export { handler as GET, handler as POST }; 