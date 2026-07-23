import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const TOKEN_TTL_MS = 15 * 60 * 1000;

export async function createSignInToken(email: string): Promise<string> {
  const identifier = email.trim().toLowerCase();
  // Invalidate any previously issued, unused tokens for this address.
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  return token;
}

export function buildVerifyLink(email: string, token: string, baseUrl: string): string {
  return `${baseUrl}/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}&token=${token}`;
}
