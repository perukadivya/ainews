import { NextRequest, NextResponse } from "next/server";
import { getFinanceUpdates, getLatestFinanceUpdateDate } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date") || undefined;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

  try {
    let resolvedDate = dateParam;
    if (!resolvedDate || resolvedDate === "latest") {
      resolvedDate = (await getLatestFinanceUpdateDate()) || undefined;
    }

    let updates = await getFinanceUpdates(resolvedDate, limit, offset);

    // If a requested date returned 0 updates on the first page, fallback to latest recorded date
    if (updates.length === 0 && offset === 0) {
      const latestDate = await getLatestFinanceUpdateDate();
      if (latestDate && latestDate !== resolvedDate) {
        resolvedDate = latestDate;
        updates = await getFinanceUpdates(latestDate, limit, offset);
      }
    }

    return NextResponse.json({
      updates,
      count: updates.length,
      date: resolvedDate || null,
      isLatest: !dateParam || dateParam === "latest" || dateParam === resolvedDate,
    });
  } catch (error) {
    console.error("Finance Feed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch finance feed", details: String(error) },
      { status: 500 }
    );
  }
}
