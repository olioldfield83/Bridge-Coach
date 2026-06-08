import { Hand, Suit } from "./cards";

export type BidJudgement = "correct" | "acceptable" | "incorrect";

export type BidEvaluation = {
  userBid: string;
  recommendedBid: string;
  judgement: BidJudgement;
  facts: {
    hcp: number;
    shape: string;
    balanced: boolean;
    ruleOf20: number;
    suitLengths: Record<Suit, number>;
  };
  reasonCodes: string[];
};

export function highCardPoints(hand: Hand): number {
  const values: Record<string, number> = {
    A: 4,
    K: 3,
    Q: 2,
    J: 1,
    T: 0,
    "9": 0,
    "8": 0,
    "7": 0,
    "6": 0,
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
  };

  return hand.reduce((sum, card) => sum + values[card.rank], 0);
}

export function suitLengths(hand: Hand): Record<Suit, number> {
  return {
    S: hand.filter((c) => c.suit === "S").length,
    H: hand.filter((c) => c.suit === "H").length,
    D: hand.filter((c) => c.suit === "D").length,
    C: hand.filter((c) => c.suit === "C").length,
  };
}

export function shapeString(hand: Hand): string {
  return Object.values(suitLengths(hand))
    .sort((a, b) => b - a)
    .join("-");
}

export function isBalanced(hand: Hand): boolean {
  const shape = shapeString(hand);

  return shape === "4-3-3-3" || shape === "4-4-3-2" || shape === "5-3-3-2";
}

export function ruleOf20(hand: Hand): number {
  const hcp = highCardPoints(hand);
  const lengths = Object.values(suitLengths(hand)).sort((a, b) => b - a);

  return hcp + lengths[0] + lengths[1];
}

function longestSuitOpening(hand: Hand): string {
  const lengths = suitLengths(hand);
  const maxLen = Math.max(lengths.S, lengths.H, lengths.D, lengths.C);

  const candidates = (["S", "H", "D", "C"] as Suit[]).filter(
    (suit) => lengths[suit] === maxLen
  );

  // Simplified Acol tie-breaks for MVP.
  if (lengths.H === 4 && lengths.S === 4 && maxLen === 4) {
    return "1H";
  }

  if (candidates.includes("S") && maxLen >= 4) return "1S";
  if (candidates.includes("H") && maxLen >= 4) return "1H";

  if (lengths.D === 4 && lengths.C === 4 && maxLen === 4) {
    return "1D";
  }

  if (candidates.includes("D") && maxLen >= 4) return "1D";

  return "1C";
}

export function recommendAcolOpening(hand: Hand): string {
  const hcp = highCardPoints(hand);
  const balanced = isBalanced(hand);
  const r20 = ruleOf20(hand);

  if (balanced && hcp >= 12 && hcp <= 14) return "1NT";
  if (balanced && hcp >= 20 && hcp <= 22) return "2NT";
  if (hcp >= 23) return "2C";

  if (hcp >= 12) return longestSuitOpening(hand);

  if (hcp >= 9 && hcp <= 11 && r20 >= 20) {
    return longestSuitOpening(hand);
  }

  return "Pass";
}

export function evaluateAcolOpening(
  hand: Hand,
  userBid: string
): BidEvaluation {
  const hcp = highCardPoints(hand);
  const balanced = isBalanced(hand);
  const r20 = ruleOf20(hand);
  const lengths = suitLengths(hand);
  const recommendedBid = recommendAcolOpening(hand);

  const reasonCodes: string[] = [];

  if (recommendedBid === "1NT") {
    reasonCodes.push("BALANCED_12_14_SHOULD_OPEN_1NT");
  }

  if (recommendedBid === "Pass") {
    reasonCodes.push("INSUFFICIENT_OPENING_VALUES");
  }

  if (hcp >= 9 && hcp <= 11 && r20 >= 20) {
    reasonCodes.push("RULE_OF_20_OPENING");
  }

  if (recommendedBid.endsWith("S") || recommendedBid.endsWith("H")) {
    reasonCodes.push("SHOW_MAJOR_SUIT");
  }

  if (
    userBid === "1NT" &&
    recommendedBid !== "1NT" &&
    (lengths.S >= 5 || lengths.H >= 5)
  ) {
    reasonCodes.push("DO_NOT_HIDE_FIVE_CARD_MAJOR_IN_1NT");
  }

  const judgement: BidJudgement =
    userBid === recommendedBid ? "correct" : "incorrect";

  return {
    userBid,
    recommendedBid,
    judgement,
    facts: {
      hcp,
      shape: shapeString(hand),
      balanced,
      ruleOf20: r20,
      suitLengths: lengths,
    },
    reasonCodes,
  };
}