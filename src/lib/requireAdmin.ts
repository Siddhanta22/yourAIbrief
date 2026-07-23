import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Verifies the caller is signed in with role ADMIN. Returns null when authorized,
 * otherwise a ready-to-return NextResponse (401/403).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, message: 'Forbidden' },
      { status: 403, headers: CORS_HEADERS }
    );
  }

  return null;
}
