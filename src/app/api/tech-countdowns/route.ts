import { NextResponse } from "next/server";
import { getActiveTechCountdowns } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const countdowns = await getActiveTechCountdowns();
    return NextResponse.json({ countdowns });
  } catch (error) {
    console.error("Tech Countdowns API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tech countdowns", details: String(error) },
      { status: 500 }
    );
  }
}
