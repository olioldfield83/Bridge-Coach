import { NextRequest, NextResponse } from "next/server";
import { explainOpeningLead } from "@/lib/ai/coach";
import { Card } from "@/lib/bridge/cards";
import { LeadDeal } from "@/lib/bridge/leadDeals";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const deal = body.deal as LeadDeal;
    const selectedLead = body.selectedLead as Card;
    const selectedLeadWasCorrect = body.selectedLeadWasCorrect as boolean;

    if (!deal || !selectedLead) {
      return NextResponse.json(
        { error: "Missing deal or selected lead" },
        { status: 400 }
      );
    }

    const explanation = await explainOpeningLead(
      deal,
      selectedLead,
      selectedLeadWasCorrect
    );

    return NextResponse.json({
      explanation,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to analyse opening lead" },
      { status: 500 }
    );
  }
}