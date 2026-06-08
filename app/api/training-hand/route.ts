import { NextRequest, NextResponse } from "next/server";
import { TRAINING_HANDS } from "@/lib/bridge/trainingHands";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topicId = searchParams.get("topic");

  let trainingHand;

  if (topicId) {
    trainingHand = TRAINING_HANDS.find((hand) => hand.id === topicId);
  }

  if (!trainingHand) {
    const randomIndex = Math.floor(Math.random() * TRAINING_HANDS.length);
    trainingHand = TRAINING_HANDS[randomIndex];
  }

  return NextResponse.json({
    id: trainingHand.id,
    title: trainingHand.title,
    lesson: trainingHand.lesson,
    south: trainingHand.hand,
    dealer: "S",
    vulnerability: "None",
    expectedBid: trainingHand.expectedBid,
    training: true,
  });
}