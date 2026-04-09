import { NextResponse } from "next/server";
import { getTechAvailableDates } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dates = await getTechAvailableDates();
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Tech Dates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tech dates", details: String(error) },
      { status: 500 }
    );
  }
}
