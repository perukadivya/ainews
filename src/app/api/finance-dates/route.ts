import { NextResponse } from "next/server";
import { getFinanceAvailableDates } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dates = await getFinanceAvailableDates();
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Finance Dates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch finance dates", details: String(error) },
      { status: 500 }
    );
  }
}
