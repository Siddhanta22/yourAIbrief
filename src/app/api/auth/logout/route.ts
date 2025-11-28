import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
  try {
    console.log('=== API LOGOUT INITIATED ===');
    
    // Get the current session to identify which user is logging out
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      // Delete only the current user's sessions
      const deletedSessions = await prisma.session.deleteMany({
        where: { userId: session.user.id }
      });
      console.log('Deleted sessions for user:', deletedSessions.count);
      
      // Note: We don't delete accounts on logout - they're needed for re-authentication
      // Accounts are only deleted when a user explicitly removes their OAuth connection
      
      return NextResponse.json({
        success: true,
        message: 'Logout completed successfully',
        deleted: {
          sessions: deletedSessions.count
        }
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } else {
      // No session found - user is already logged out or using email-first auth
      // For email-first auth, logout is handled client-side via localStorage.clear()
      return NextResponse.json({
        success: true,
        message: 'Logout completed (no active session found)'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
  } catch (error) {
    console.error('API logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
