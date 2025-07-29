import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import GoogleProvider from 'next-auth/providers/google';
// import GitHubProvider from 'next-auth/providers/github';
// import AppleProvider from 'next-auth/providers/apple';
import { AdapterUser } from 'next-auth/adapters';
import { SessionStrategy } from 'next-auth';

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
    // AppleProvider({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // }),
  ],
  session: {
    strategy: 'database' as SessionStrategy,
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, user, token }: { session: any; user?: AdapterUser; token?: any }) {
      if (session.user) {
        session.user.id = user?.id || token?.sub;
        // Fetch hasOnboarded from DB if available
        if (user) {
          session.user.hasOnboarded = (user as any).hasOnboarded;
        } else if (token) {
          // fallback: fetch from DB if needed
          const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
          session.user.hasOnboarded = (dbUser as any)?.hasOnboarded ?? false;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl, user }: { url: string; baseUrl: string; user?: AdapterUser }) {
      // If a callbackUrl is provided and is a relative path, use it
      if (url && url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If a callbackUrl is a full URL and matches baseUrl, use it
      if (url && url.startsWith(baseUrl)) {
        return url;
      }
      // Only runs after sign in
      if (user && typeof user === 'object' && 'id' in user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if ((dbUser as any)?.hasOnboarded === false) {
          return `${baseUrl}/onboarding`;
        }
        return `${baseUrl}/member`;
      }
      return baseUrl;
    },
  },
}; 