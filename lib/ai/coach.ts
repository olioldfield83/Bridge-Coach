import OpenAI from "openai";
import { Hand } from "@/lib/bridge/cards";
import { BidEvaluation } from "@/lib/bridge/acol";
import { PlayedCard } from "@/lib/bridge/play";
import { PlayDeal } from "@/lib/bridge/playDeals";

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

function playedCardToText(played: PlayedCard): string {
  const suitSymbols = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return `${played.seat}: ${played.card.rank}${suitSymbols[played.card.suit]}`;
}

export async function explainOpeningBid(
  hand: Hand,
  evaluation: BidEvaluation
): Promise<string> {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
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

export async function explainDeclarerPlay(
  deal: PlayDeal,
  playHistory: PlayedCard[],
  declarerTricks: number,
  defenderTricks: number
): Promise<string> {
  const playHistoryText = playHistory
    .map((played, index) => `${index + 1}. ${playedCardToText(played)}`)
    .join("\n");

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You are a UK bridge coach teaching declarer play to an improving club player. Give clear, practical feedback. Focus on planning, drawing trumps, entries, suit establishment, avoiding ruffs, and counting winners/losers. Do not pretend to be a double-dummy solver. Explain what the player appeared to do well and what they should improve.",
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            task: "analyse_declarer_play",
            contract: deal.contract,
            declarer: deal.declarer,
            trumpSuit: deal.trumpSuit,
            lesson: deal.lesson,
            coachingTip: deal.coachingTip,
            declarerTricks,
            defenderTricks,
            playHistory: playHistoryText,
          },
          null,
          2
        ),
      },
    ],
  });

  return response.output_text;
}