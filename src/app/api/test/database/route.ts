import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not configured',
        message: 'Database connection string is missing'
      }, { status: 500 });
    }

    // Try to import and test Prisma
    try {
      const { prisma } = await import('@/lib/prisma');
      
      // Test database connection
      await prisma.$connect();
      
      // Try a simple query
      const userCount = await prisma.user.count();
      
      await prisma.$disconnect();
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        userCount,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
      });
      
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
