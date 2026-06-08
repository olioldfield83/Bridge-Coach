import { Hand } from "./cards";

export type TrainingHand = {
  id: string;
  title: string;
  lesson: string;
  hand: Hand;
  expectedBid: string;
};

export const TRAINING_HANDS: TrainingHand[] = [
  {
    id: "balanced-12-14-1nt",
    title: "Balanced 12–14: open 1NT",
    lesson: "With a balanced 12–14 HCP hand in simple Acol, open 1NT.",
    expectedBid: "1NT",
    hand: [
      { suit: "S", rank: "A" },
      { suit: "S", rank: "7" },
      { suit: "S", rank: "4" },

      { suit: "H", rank: "K" },
      { suit: "H", rank: "8" },
      { suit: "H", rank: "3" },

      { suit: "D", rank: "Q" },
      { suit: "D", rank: "9" },
      { suit: "D", rank: "6" },

      { suit: "C", rank: "K" },
      { suit: "C", rank: "T" },
      { suit: "C", rank: "5" },
      { suit: "C", rank: "2" },
    ],
  },
  {
    id: "pass-weak-hand",
    title: "Weak hand: pass",
    lesson:
      "With fewer than 12 HCP and no Rule of 20 opening values, pass in first seat.",
    expectedBid: "Pass",
    hand: [
      { suit: "S", rank: "Q" },
      { suit: "S", rank: "8" },
      { suit: "S", rank: "4" },

      { suit: "H", rank: "J" },
      { suit: "H", rank: "7" },
      { suit: "H", rank: "5" },

      { suit: "D", rank: "T" },
      { suit: "D", rank: "8" },
      { suit: "D", rank: "3" },

      { suit: "C", rank: "Q" },
      { suit: "C", rank: "9" },
      { suit: "C", rank: "6" },
      { suit: "C", rank: "2" },
    ],
  },
  {
    id: "rule-of-20-opening",
    title: "Rule of 20: open one of a suit",
    lesson:
      "Some 10–11 HCP hands are worth opening if HCP plus the lengths of the two longest suits reaches 20.",
    expectedBid: "1S",
    hand: [
      { suit: "S", rank: "A" },
      { suit: "S", rank: "J" },
      { suit: "S", rank: "9" },
      { suit: "S", rank: "7" },
      { suit: "S", rank: "4" },

      { suit: "H", rank: "K" },
      { suit: "H", rank: "T" },
      { suit: "H", rank: "8" },
      { suit: "H", rank: "5" },

      { suit: "D", rank: "Q" },
      { suit: "D", rank: "6" },

      { suit: "C", rank: "8" },
      { suit: "C", rank: "3" },
    ],
  },
  {
    id: "five-card-major",
    title: "Five-card major: open the major",
    lesson:
      "With opening values and a five-card major, show the major rather than hiding it in no trumps.",
    expectedBid: "1S",
    hand: [
      { suit: "S", rank: "A" },
      { suit: "S", rank: "J" },
      { suit: "S", rank: "8" },
      { suit: "S", rank: "4" },
      { suit: "S", rank: "2" },

      { suit: "H", rank: "K" },
      { suit: "H", rank: "7" },
      { suit: "H", rank: "3" },

      { suit: "D", rank: "Q" },
      { suit: "D", rank: "T" },
      { suit: "D", rank: "5" },

      { suit: "C", rank: "A" },
      { suit: "C", rank: "6" },
    ],
  },
  {
    id: "twenty-to-twenty-two-balanced",
    title: "Strong balanced hand: open 2NT",
    lesson: "With a balanced 20–22 HCP hand in simple Acol, open 2NT.",
    expectedBid: "2NT",
    hand: [
      { suit: "S", rank: "A" },
      { suit: "S", rank: "K" },
      { suit: "S", rank: "7" },

      { suit: "H", rank: "A" },
      { suit: "H", rank: "Q" },
      { suit: "H", rank: "6" },

      { suit: "D", rank: "K" },
      { suit: "D", rank: "Q" },
      { suit: "D", rank: "8" },

      { suit: "C", rank: "A" },
      { suit: "C", rank: "J" },
      { suit: "C", rank: "5" },
      { suit: "C", rank: "2" },
    ],
  },
  {
    id: "very-strong-two-clubs",
    title: "Very strong hand: open 2♣",
    lesson:
      "With a very strong hand, use the artificial strong 2♣ opening in simple Acol.",
    expectedBid: "2C",
    hand: [
      { suit: "S", rank: "A" },
      { suit: "S", rank: "K" },
      { suit: "S", rank: "Q" },
      { suit: "S", rank: "8" },

      { suit: "H", rank: "A" },
      { suit: "H", rank: "K" },
      { suit: "H", rank: "7" },

      { suit: "D", rank: "A" },
      { suit: "D", rank: "Q" },
      { suit: "D", rank: "6" },

      { suit: "C", rank: "K" },
      { suit: "C", rank: "Q" },
      { suit: "C", rank: "4" },
    ],
  },
];