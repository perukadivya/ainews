import { NextResponse } from "next/server";
import { getTechDailySummaries } from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    
    // Default to today if no date provided
    const date = dateParam || formatDateKey(new Date());

    const summaries = await getTechDailySummaries(date);
    
    return NextResponse.json({ summaries });
  } catch (error) {
    console.error("Daily Tech API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily tech summaries", details: String(error) },
      { status: 500 }
    );
  }
}
