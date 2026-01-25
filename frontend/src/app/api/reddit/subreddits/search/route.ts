import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/reddit/subreddits/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying Reddit search request:', error);
    return NextResponse.json(
      { suggestions: [] },
      { status: 500 }
    );
  }
}
