export async function GET() {
  return Response.json({ 
    success: true, 
    message: 'Simple API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return Response.json({
      success: true,
      message: 'Simple API POST is working!',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
