import { NextRequest, NextResponse } from "next/server";
import { generateTrainingHand } from "@/lib/bridge/trainingGenerator";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topicId = searchParams.get("topic") ?? undefined;

  const trainingHand = generateTrainingHand(topicId);

  return NextResponse.json(trainingHand);
}