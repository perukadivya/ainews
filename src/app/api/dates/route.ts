import { NextResponse } from "next/server";
import { getAvailableDates } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dates = getAvailableDates();
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Dates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dates", details: String(error) },
      { status: 500 }
    );
  }
}
