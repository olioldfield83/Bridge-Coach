import { NextResponse } from "next/server";
import { PLAY_DEALS } from "@/lib/bridge/playDeals";

export async function GET() {
  const deal = PLAY_DEALS[0];

  return NextResponse.json(deal);
}