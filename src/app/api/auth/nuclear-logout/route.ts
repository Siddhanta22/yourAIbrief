import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== NUCLEAR LOGOUT INITIATED ===');
    
    // Delete ALL sessions from database
    const deletedSessions = await prisma.session.deleteMany({});
    console.log('Deleted sessions:', deletedSessions.count);
    
    // Delete ALL accounts from database
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log('Deleted accounts:', deletedAccounts.count);
    
    // Delete ALL users (nuclear option)
    const deletedUsers = await prisma.user.deleteMany({});
    console.log('Deleted users:', deletedUsers.count);
    
    return NextResponse.json({
      success: true,
      message: 'Nuclear logout completed - all data cleared',
      deleted: {
        sessions: deletedSessions.count,
        accounts: deletedAccounts.count,
        users: deletedUsers.count
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Nuclear logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Nuclear logout failed',
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
