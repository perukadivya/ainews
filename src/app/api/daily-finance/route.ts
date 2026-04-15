import { NextResponse } from "next/server";
import { getFinanceDailySummaries } from "@/lib/db";
import { formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam || formatDateKey(new Date());
    const summaries = await getFinanceDailySummaries(date);
    return NextResponse.json({ summaries });
  } catch (error) {
    console.error("Daily Finance API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily finance summaries", details: String(error) },
      { status: 500 }
    );
  }
}
