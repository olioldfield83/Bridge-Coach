import OpenAI from "openai";
import { Hand } from "@/lib/bridge/cards";
import { BidEvaluation } from "@/lib/bridge/acol";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function handToText(hand: Hand): string {
  const suits = {
    S: hand.filter((c) => c.suit === "S").map((c) => c.rank).join(" "),
    H: hand.filter((c) => c.suit === "H").map((c) => c.rank).join(" "),
    D: hand.filter((c) => c.suit === "D").map((c) => c.rank).join(" "),
    C: hand.filter((c) => c.suit === "C").map((c) => c.rank).join(" "),
  };

  return `♠ ${suits.S || "-"}\n♥ ${suits.H || "-"}\n♦ ${suits.D || "-"}\n♣ ${suits.C || "-"}`;
}

export async function explainOpeningBid(
  hand: Hand,
  evaluation: BidEvaluation
): Promise<string> {
  const response = await openai.responses.create({
    model: "gpt-5.5",
    input: [
      {
        role: "system",
        content:
          "You are a UK Acol bridge coach. Explain opening bids clearly to a beginner or improving club player. Use simple Acol assumptions: 12-14 1NT, four-card majors, Rule of 20 for borderline openings. The rules engine provides the recommendation. Do not contradict it. Be concise, practical, and educational.",
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            task: "explain_opening_bid",
            hand: handToText(hand),
            userBid: evaluation.userBid,
            recommendedBid: evaluation.recommendedBid,
            judgement: evaluation.judgement,
            facts: evaluation.facts,
            reasonCodes: evaluation.reasonCodes,
          },
          null,
          2
        ),
      },
    ],
  });

  return response.output_text;
}