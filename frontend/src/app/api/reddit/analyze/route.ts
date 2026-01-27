import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subreddits, keywords } = body;

    if (!subreddits || !keywords) {
      return NextResponse.json(
        { error: "Subreddits and keywords are required" },
        { status: 400 },
      );
    }

    console.log("Requesting backend by url", BACKEND_URL);

    const response = await fetch(`${BACKEND_URL}/analysis/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subreddits,
        keywords,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Analysis failed" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying analysis request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
