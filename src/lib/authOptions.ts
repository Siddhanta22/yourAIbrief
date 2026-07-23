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
    // Email-first auth: a session is only issued once the caller proves
    // ownership of the address via a single-use token sent by email
    // (see /api/subscribe and /api/auth/request-signin, redeemed at /auth/verify).
    CredentialsProvider({
      id: 'email',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) {
          return null;
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const token = credentials.token as string;

        const verificationToken = await prisma.verificationToken.findUnique({
          where: { token },
        });

        if (
          !verificationToken ||
          verificationToken.identifier !== email ||
          verificationToken.expires < new Date()
        ) {
          return null;
        }

        // Single-use: consume immediately so the link can't be replayed.
        await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: null,
              isActive: true,
              emailVerified: new Date(),
            },
          });
        } else if (!user.emailVerified) {
          user = await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
          });
        }

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
  // NextAuth v4's CredentialsProvider cannot create database sessions - it only
  // supports JWT sessions. Since this app mixes Google OAuth with a Credentials
  // provider, session storage must be JWT for the email sign-in flow to work at all.
  session: {
    strategy: 'jwt' as SessionStrategy,
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
          (session.user as any).role = (user as any).role;
        } else if (token) {
          // fallback: fetch from DB if needed
          const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
          session.user.hasOnboarded = (dbUser as any)?.hasOnboarded ?? false;
          (session.user as any).role = dbUser?.role;
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