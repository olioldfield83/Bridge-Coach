import { Hand } from "./cards";
import { dealSouthHand } from "./deal";
import {
  highCardPoints,
  isBalanced,
  recommendAcolOpening,
  ruleOf20,
  suitLengths,
} from "./acol";

export type TrainingTopic = {
  id: string;
  title: string;
  lesson: string;
  expectedBidLabel: string;
};

export type GeneratedTrainingHand = {
  id: string;
  title: string;
  lesson: string;
  south: Hand;
  dealer: "S";
  vulnerability: "None";
  expectedBid: string;
  training: true;
};

export const TRAINING_TOPICS: TrainingTopic[] = [
  {
    id: "balanced-12-14-1nt",
    title: "Balanced 12–14: open 1NT",
    lesson: "With a balanced 12–14 HCP hand in simple Acol, open 1NT.",
    expectedBidLabel: "1NT",
  },
  {
    id: "pass-weak-hand",
    title: "Weak hand: pass",
    lesson:
      "With fewer than 12 HCP and no Rule of 20 opening values, pass in first seat.",
    expectedBidLabel: "Pass",
  },
  {
    id: "rule-of-20-opening",
    title: "Rule of 20: open one of a suit",
    lesson:
      "Some 10–11 HCP hands are worth opening if HCP plus the lengths of the two longest suits reaches 20.",
    expectedBidLabel: "May vary",
  },
  {
    id: "five-card-major",
    title: "Five-card major: open the major",
    lesson:
      "With opening values and a five-card major, show the major rather than hiding it in no trumps.",
    expectedBidLabel: "May vary",
  },
  {
    id: "twenty-to-twenty-two-balanced",
    title: "Strong balanced hand: open 2NT",
    lesson: "With a balanced 20–22 HCP hand in simple Acol, open 2NT.",
    expectedBidLabel: "2NT",
  },
  {
    id: "very-strong-two-clubs",
    title: "Very strong hand: open 2♣",
    lesson:
      "With a very strong hand, use the artificial strong 2♣ opening in simple Acol.",
    expectedBidLabel: "2C",
  },
];

function randomTopic(): TrainingTopic {
  const index = Math.floor(Math.random() * TRAINING_TOPICS.length);
  return TRAINING_TOPICS[index];
}

function handMatchesTopic(hand: Hand, topicId: string): boolean {
  const hcp = highCardPoints(hand);
  const balanced = isBalanced(hand);
  const r20 = ruleOf20(hand);
  const lengths = suitLengths(hand);
  const recommendedBid = recommendAcolOpening(hand);

  if (topicId === "balanced-12-14-1nt") {
    return balanced && hcp >= 12 && hcp <= 14 && recommendedBid === "1NT";
  }

  if (topicId === "pass-weak-hand") {
    return hcp < 12 && r20 < 20 && recommendedBid === "Pass";
  }

  if (topicId === "rule-of-20-opening") {
    return (
      hcp >= 9 &&
      hcp <= 11 &&
      r20 >= 20 &&
      recommendedBid !== "Pass" &&
      recommendedBid !== "1NT"
    );
  }

  if (topicId === "five-card-major") {
    const hasFiveCardMajor = lengths.S >= 5 || lengths.H >= 5;

    return (
      hasFiveCardMajor &&
      hcp >= 12 &&
      (recommendedBid === "1S" || recommendedBid === "1H")
    );
  }

  if (topicId === "twenty-to-twenty-two-balanced") {
    return balanced && hcp >= 20 && hcp <= 22 && recommendedBid === "2NT";
  }

  if (topicId === "very-strong-two-clubs") {
    return hcp >= 23 && recommendedBid === "2C";
  }

  return true;
}

function generateMatchingHand(topicId: string): Hand {
  const maxAttempts = 20000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const deal = dealSouthHand();

    if (handMatchesTopic(deal.south, topicId)) {
      return deal.south;
    }
  }

  // Fallback: if no perfect match is found, return a random hand.
  return dealSouthHand().south;
}

export function generateTrainingHand(topicId?: string): GeneratedTrainingHand {
  const topic =
    TRAINING_TOPICS.find((item) => item.id === topicId) ?? randomTopic();

  const south = generateMatchingHand(topic.id);
  const expectedBid = recommendAcolOpening(south);

  return {
    id: `${topic.id}-${Math.random().toString(36).slice(2)}`,
    title: topic.title,
    lesson: topic.lesson,
    south,
    dealer: "S",
    vulnerability: "None",
    expectedBid,
    training: true,
  };
}