import NextAuth from "next-auth";
import { authConfig } from "@/auth";

// Create the NextAuth handlers directly in this file
const handler = NextAuth(authConfig);

// Export the API route handlers
export { handler as GET, handler as POST }; 