import { NextResponse } from "next/server";
import { LEAD_DEALS } from "@/lib/bridge/leadDeals";

export async function GET() {
  const randomIndex = Math.floor(Math.random() * LEAD_DEALS.length);
  const deal = LEAD_DEALS[randomIndex];

  return NextResponse.json(deal);
}