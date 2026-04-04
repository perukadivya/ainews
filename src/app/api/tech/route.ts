import { NextRequest, NextResponse } from "next/server";
import { getTechUpdates } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") || undefined;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

  try {
    const updates = await getTechUpdates(date, limit, offset);
    return NextResponse.json({ updates, count: updates.length });
  } catch (error) {
    console.error("Tech Feed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tech feed", details: String(error) },
      { status: 500 }
    );
  }
}
