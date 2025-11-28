import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
// import GitHubProvider from 'next-auth/providers/github';
// import AppleProvider from 'next-auth/providers/apple';
import { AdapterUser } from 'next-auth/adapters';
import { SessionStrategy } from 'next-auth';
import { prisma } from './prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Email-based credentials provider for email-first auth
    CredentialsProvider({
      id: 'email',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        // Find or create user by email
        let user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          // Create new user if they don't exist
          // This allows email-first signup flow
          user = await prisma.user.create({
            data: {
              email: credentials.email as string,
              name: null,
              isActive: true,
              emailVerified: null,
            },
          });
        }

        // Return user object that will be stored in session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
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
        return `${baseUrl}/dashboard`;
      }
      return baseUrl;
    },
  },
}; 