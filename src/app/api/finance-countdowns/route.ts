import { NextResponse } from "next/server";
import { getActiveFinanceCountdowns } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const countdowns = await getActiveFinanceCountdowns();
    return NextResponse.json({ countdowns });
  } catch (error) {
    console.error("Finance Countdowns API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch finance countdowns", details: String(error) },
      { status: 500 }
    );
  }
}
