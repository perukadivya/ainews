import { NextResponse } from "next/server";
import { getActiveCountdowns } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const countdowns = await getActiveCountdowns();
    return NextResponse.json({ countdowns });
  } catch (error) {
    console.error("Countdowns API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch countdowns", details: String(error) },
      { status: 500 }
    );
  }
}
