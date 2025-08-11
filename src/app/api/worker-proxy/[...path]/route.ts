import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createHmacSignature } from '@/lib/worker';

const WORKER_API_URL = process.env.WORKER_API_BASE || 'http://localhost:3001';
const WORKER_API_SECRET = process.env.WORKER_API_SECRET || '';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Verify user authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();

    // Add user info to the request
    const workerRequest = {
      ...body,
      userId: payload.userId
    };

    // Create HMAC signature
    const requestBody = JSON.stringify(workerRequest);
    const hmacSignature = createHmacSignature(requestBody, WORKER_API_SECRET);

    // Build worker API URL
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const workerUrl = `${WORKER_API_URL}/${path}`;

    // Forward request to Worker API
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-HMAC-Signature': hmacSignature,
        'User-Agent': 'Ask Dahlia Frontend'
      },
      body: requestBody
    });

    // Check if this is a streaming response (SSE)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/event-stream')) {
      // For streaming responses, pipe the response directly
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // For non-streaming responses, parse JSON
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Worker proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Verify user authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Build worker API URL with query params
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    const workerUrl = `${WORKER_API_URL}/${path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // Create empty body for HMAC (required for GET requests too)
    const requestBody = JSON.stringify({ userId: payload.userId });
    const hmacSignature = createHmacSignature(requestBody, WORKER_API_SECRET);

    // Forward request to Worker API
    const response = await fetch(workerUrl, {
      method: 'GET',
      headers: {
        'X-HMAC-Signature': hmacSignature,
        'User-Agent': 'Ask Dahlia Frontend'
      }
    });

    const data = await response.json();

    // Return response from Worker API
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Worker proxy GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
