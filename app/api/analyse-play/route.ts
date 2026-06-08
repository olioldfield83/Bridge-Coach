import { NextRequest, NextResponse } from "next/server";
import { explainDeclarerPlay } from "@/lib/ai/coach";
import { PlayedCard } from "@/lib/bridge/play";
import { PlayDeal } from "@/lib/bridge/playDeals";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const deal = body.deal as PlayDeal;
    const playHistory = body.playHistory as PlayedCard[];
    const declarerTricks = body.declarerTricks as number;
    const defenderTricks = body.defenderTricks as number;

    if (!deal || !playHistory) {
      return NextResponse.json(
        { error: "Missing deal or play history" },
        { status: 400 }
      );
    }

    const analysis = await explainDeclarerPlay(
      deal,
      playHistory,
      declarerTricks,
      defenderTricks
    );

    return NextResponse.json({
      analysis,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to analyse play" },
      { status: 500 }
    );
  }
}