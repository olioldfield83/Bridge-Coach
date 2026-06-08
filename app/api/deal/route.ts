import { NextResponse } from "next/server";
import { dealSouthHand } from "@/lib/bridge/deal";

export async function GET() {
  const deal = dealSouthHand();

  return NextResponse.json(deal);
}