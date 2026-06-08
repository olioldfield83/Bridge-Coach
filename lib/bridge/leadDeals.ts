import { Card, Hand } from "./cards";

export type LeadDeal = {
  id: string;
  title: string;
  lesson: string;
  contract: string;
  declarer: "N" | "E" | "S" | "W";
  defender: "N" | "E" | "S" | "W";
  auction: string[];
  hand: Hand;
  recommendedLead: Card;
  acceptableLeads: Card[];
  explanation: string;
};

export const LEAD_DEALS: LeadDeal[] = [
  {
    id: "lead-top-of-sequence",
    title: "Lead from a sequence",
    lesson:
      "Against a no-trump contract, a strong honour sequence is often an attractive opening lead.",
    contract: "3NT",
    declarer: "S",
    defender: "W",
    auction: ["1NT", "3NT"],
    hand: [
      { suit: "S", rank: "K" },
      { suit: "S", rank: "Q" },
      { suit: "S", rank: "J" },
      { suit: "S", rank: "7" },
      { suit: "S", rank: "3" },

      { suit: "H", rank: "8" },
      { suit: "H", rank: "5" },

      { suit: "D", rank: "T" },
      { suit: "D", rank: "6" },
      { suit: "D", rank: "2" },

      { suit: "C", rank: "9" },
      { suit: "C", rank: "7" },
      { suit: "C", rank: "4" },
    ],
    recommendedLead: { suit: "S", rank: "K" },
    acceptableLeads: [{ suit: "S", rank: "K" }],
    explanation:
      "The ♠K is best because you have a solid honour sequence: K-Q-J. Against 3NT, leading the top of a sequence is usually safe and helps establish tricks for the defence.",
  },
  {
    id: "lead-fourth-highest-nt",
    title: "Fourth highest against no trumps",
    lesson:
      "Against no trumps, when you have a decent long suit but no touching honour sequence, fourth highest is often a good lead.",
    contract: "3NT",
    declarer: "S",
    defender: "W",
    auction: ["1NT", "3NT"],
    hand: [
      { suit: "S", rank: "Q" },
      { suit: "S", rank: "9" },
      { suit: "S", rank: "7" },
      { suit: "S", rank: "4" },
      { suit: "S", rank: "2" },

      { suit: "H", rank: "K" },
      { suit: "H", rank: "8" },
      { suit: "H", rank: "3" },

      { suit: "D", rank: "J" },
      { suit: "D", rank: "6" },

      { suit: "C", rank: "T" },
      { suit: "C", rank: "5" },
      { suit: "C", rank: "4" },
    ],
    recommendedLead: { suit: "S", rank: "4" },
    acceptableLeads: [{ suit: "S", rank: "4" }],
    explanation:
      "The ♠4 is the recommended lead. You have a five-card spade suit headed by the queen. With no honour sequence, lead fourth highest from your longest and strongest suit against no trumps.",
  },
  {
    id: "lead-singleton-against-suit",
    title: "Lead a singleton against a suit contract",
    lesson:
      "Against a suit contract, a singleton can be attractive because partner may be able to give you a ruff later.",
    contract: "4H",
    declarer: "S",
    defender: "W",
    auction: ["1H", "3H", "4H"],
    hand: [
      { suit: "S", rank: "8" },

      { suit: "H", rank: "9" },
      { suit: "H", rank: "6" },
      { suit: "H", rank: "2" },

      { suit: "D", rank: "K" },
      { suit: "D", rank: "J" },
      { suit: "D", rank: "7" },
      { suit: "D", rank: "4" },

      { suit: "C", rank: "Q" },
      { suit: "C", rank: "T" },
      { suit: "C", rank: "8" },
      { suit: "C", rank: "5" },
      { suit: "C", rank: "3" },
    ],
    recommendedLead: { suit: "S", rank: "8" },
    acceptableLeads: [{ suit: "S", rank: "8" }],
    explanation:
      "The ♠8 is the recommended lead because it is a singleton. Against a suit contract, singleton leads can create ruffing chances, especially if partner gets the lead later.",
  },
  {
    id: "avoid-underleading-ace-suit",
    title: "Avoid underleading an ace against a suit contract",
    lesson:
      "Against a suit contract, underleading an ace at trick one is often dangerous.",
    contract: "4S",
    declarer: "S",
    defender: "W",
    auction: ["1S", "3S", "4S"],
    hand: [
      { suit: "S", rank: "7" },
      { suit: "S", rank: "4" },

      { suit: "H", rank: "A" },
      { suit: "H", rank: "8" },
      { suit: "H", rank: "5" },
      { suit: "H", rank: "2" },

      { suit: "D", rank: "Q" },
      { suit: "D", rank: "J" },
      { suit: "D", rank: "T" },
      { suit: "D", rank: "6" },

      { suit: "C", rank: "9" },
      { suit: "C", rank: "7" },
      { suit: "C", rank: "3" },
    ],
    recommendedLead: { suit: "D", rank: "Q" },
    acceptableLeads: [
      { suit: "D", rank: "Q" },
      { suit: "H", rank: "A" },
    ],
    explanation:
      "The ♦Q is recommended because Q-J-T is a useful sequence. Avoid leading a low heart away from the ace against a suit contract. If you choose hearts, leading the ♥A is much safer than underleading it.",
  },
  {
    id: "lead-top-of-doubleton",
    title: "Lead top of a doubleton",
    lesson:
      "Against a suit contract, leading the top card from a doubleton can sometimes help you create a ruff.",
    contract: "4S",
    declarer: "S",
    defender: "W",
    auction: ["1S", "2S", "4S"],
    hand: [
      { suit: "S", rank: "8" },
      { suit: "S", rank: "5" },
      { suit: "S", rank: "2" },

      { suit: "H", rank: "Q" },
      { suit: "H", rank: "7" },

      { suit: "D", rank: "K" },
      { suit: "D", rank: "9" },
      { suit: "D", rank: "6" },
      { suit: "D", rank: "3" },

      { suit: "C", rank: "J" },
      { suit: "C", rank: "T" },
      { suit: "C", rank: "8" },
      { suit: "C", rank: "4" },
    ],
    recommendedLead: { suit: "H", rank: "Q" },
    acceptableLeads: [{ suit: "H", rank: "Q" }],
    explanation:
      "The ♥Q is the recommended lead from Q-7 doubleton. Against a suit contract, leading the top of a doubleton may help partner work out the position and may create a future ruff.",
  },
];