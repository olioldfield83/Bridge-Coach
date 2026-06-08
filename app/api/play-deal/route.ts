import { NextResponse } from "next/server";
import { PLAY_DEALS } from "@/lib/bridge/playDeals";

export async function GET() {
  const randomIndex = Math.floor(Math.random() * PLAY_DEALS.length);
  const deal = PLAY_DEALS[randomIndex];

  return NextResponse.json(deal);
}