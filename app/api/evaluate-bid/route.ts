import { NextRequest, NextResponse } from "next/server";
import { evaluateAcolOpening } from "@/lib/bridge/acol";
import { explainOpeningBid } from "@/lib/ai/coach";
import { Hand } from "@/lib/bridge/cards";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const hand = body.hand as Hand;
    const userBid = body.userBid as string;

    if (!hand || !userBid) {
      return NextResponse.json(
        { error: "Missing hand or userBid" },
        { status: 400 }
      );
    }

    const evaluation = evaluateAcolOpening(hand, userBid);
    const coachExplanation = await explainOpeningBid(hand, evaluation);

    return NextResponse.json({
      evaluation,
      coachExplanation,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to evaluate bid" },
      { status: 500 }
    );
  }
}