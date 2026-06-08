import { NextResponse } from "next/server";
import { TRAINING_HANDS } from "@/lib/bridge/trainingHands";

export async function GET() {
  return NextResponse.json(
    TRAINING_HANDS.map((hand) => ({
      id: hand.id,
      title: hand.title,
      lesson: hand.lesson,
      expectedBid: hand.expectedBid,
    }))
  );
}