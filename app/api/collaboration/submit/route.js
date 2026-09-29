import { NextResponse } from "next/server";

const BACKEND_API = process.env.COLLABORATION_SERVICE_URL || "http://localhost:4035/api/collaboration";

export async function POST(request) {
  try {
    const body = await request.json();

    // Forward to independent collaboration-service backend
    const res = await fetch(`${BACKEND_API}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[Collaboration Submit API Route] Error forwarding to backend:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to collaboration service. Please try again later.",
      },
      { status: 500 }
    );
  }
}
