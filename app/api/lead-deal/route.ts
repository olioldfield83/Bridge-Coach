import { NextResponse } from "next/server";
import { generateLeadDeal } from "@/lib/bridge/leadGenerator";

export async function GET() {
  const deal = generateLeadDeal();

  return NextResponse.json(deal);
}