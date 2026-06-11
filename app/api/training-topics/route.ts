import { NextResponse } from "next/server";
import { TRAINING_TOPICS } from "@/lib/bridge/trainingGenerator";

export async function GET() {
  return NextResponse.json(
    TRAINING_TOPICS.map((topic) => ({
      id: topic.id,
      title: topic.title,
      lesson: topic.lesson,
      expectedBid: topic.expectedBidLabel,
    }))
  );
}