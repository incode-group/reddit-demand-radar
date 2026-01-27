import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log("Fetching status for ID:", id);
    const response = await fetch(`http://localhost:4000/status/${id}`);
    console.log("Backend response status:", response.status);

    if (!response.ok) {
      console.error("Backend status request failed:", response.status);
      return NextResponse.json({ error: "Status not found" }, { status: 404 });
    }

    const statusData = await response.json();
    console.log("Status data from backend:", statusData);
    return NextResponse.json(statusData);
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 },
    );
  }
}
