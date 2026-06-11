import { Card, Hand, Rank, RANKS, Suit, SUITS } from "./cards";
import { LeadDeal } from "./leadDeals";

const RANK_VALUE: Record<Rank, number> = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  "9": 9,
  "8": 8,
  "7": 7,
  "6": 6,
  "5": 5,
  "4": 4,
  "3": 3,
  "2": 2,
};

type LeadTemplate = {
  contract: string;
  declarer: "S";
  defender: "W";
  auction: string[];
  contractType: "NT" | "SUIT";
  trumpSuit?: Suit;
};

const LEAD_TEMPLATES: LeadTemplate[] = [
  {
    contract: "3NT",
    declarer: "S",
    defender: "W",
    auction: ["1NT", "3NT"],
    contractType: "NT",
  },
  {
    contract: "4S",
    declarer: "S",
    defender: "W",
    auction: ["1S", "3S", "4S"],
    contractType: "SUIT",
    trumpSuit: "S",
  },
  {
    contract: "4H",
    declarer: "S",
    defender: "W",
    auction: ["1H", "3H", "4H"],
    contractType: "SUIT",
    trumpSuit: "H",
  },
];

function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function dealRandomHand(): Hand {
  return shuffle(createDeck()).slice(0, 13);
}

function cardsOfSuit(hand: Hand, suit: Suit): Card[] {
  return hand
    .filter((card) => card.suit === suit)
    .sort((a, b) => RANK_VALUE[b.rank] - RANK_VALUE[a.rank]);
}

function longestSuits(hand: Hand): Suit[] {
  return [...SUITS].sort(
    (a, b) => cardsOfSuit(hand, b).length - cardsOfSuit(hand, a).length
  );
}

function cardToText(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return `${card.rank}${suitSymbols[card.suit]}`;
}

function findHonourSequence(
  hand: Hand,
  excludeSuit?: Suit
): { card: Card; suit: Suit; type: string } | null {
  for (const suit of SUITS) {
    if (excludeSuit && suit === excludeSuit) continue;

    const cards = cardsOfSuit(hand, suit);
    const ranks = cards.map((card) => card.rank);

    if (ranks.includes("A") && ranks.includes("K") && ranks.includes("Q")) {
      return {
        card: { suit, rank: "A" },
        suit,
        type: "top of the A-K-Q sequence",
      };
    }

    if (ranks.includes("K") && ranks.includes("Q") && ranks.includes("J")) {
      return {
        card: { suit, rank: "K" },
        suit,
        type: "top of the K-Q-J sequence",
      };
    }

    if (ranks.includes("Q") && ranks.includes("J") && ranks.includes("T")) {
      return {
        card: { suit, rank: "Q" },
        suit,
        type: "top of the Q-J-T sequence",
      };
    }

    if (ranks.includes("J") && ranks.includes("T") && ranks.includes("9")) {
      return {
        card: { suit, rank: "J" },
        suit,
        type: "top of the J-T-9 sequence",
      };
    }
  }

  return null;
}

function fourthHighestFromLongestSuit(hand: Hand): Card | null {
  for (const suit of longestSuits(hand)) {
    const cards = cardsOfSuit(hand, suit);

    if (cards.length >= 4) {
      return cards[3];
    }
  }

  return null;
}

function topFromLongestSuit(hand: Hand, excludeSuit?: Suit): Card {
  const suits = longestSuits(hand).filter((suit) => suit !== excludeSuit);

  for (const suit of suits) {
    const cards = cardsOfSuit(hand, suit);
    if (cards.length > 0) return cards[0];
  }

  return hand[0];
}

function findSingleton(hand: Hand, excludeSuit?: Suit): Card | null {
  for (const suit of SUITS) {
    if (excludeSuit && suit === excludeSuit) continue;

    const cards = cardsOfSuit(hand, suit);

    if (cards.length === 1) {
      return cards[0];
    }
  }

  return null;
}

function findDoubletonTop(hand: Hand, excludeSuit?: Suit): Card | null {
  for (const suit of SUITS) {
    if (excludeSuit && suit === excludeSuit) continue;

    const cards = cardsOfSuit(hand, suit);

    if (cards.length === 2) {
      return cards[0];
    }
  }

  return null;
}

function chooseLeadForNT(hand: Hand): {
  lead: Card;
  title: string;
  lesson: string;
  explanation: string;
} {
  const sequence = findHonourSequence(hand);

  if (sequence) {
    return {
      lead: sequence.card,
      title: "Lead from an honour sequence",
      lesson:
        "Against no trumps, a strong honour sequence is usually an attractive and safe opening lead.",
      explanation: `The recommended lead is ${cardToText(
        sequence.card
      )}, the ${sequence.type}. Against no trumps, leading the top of a solid or near-solid sequence is usually clear and helps establish tricks for the defence.`,
    };
  }

  const fourthHighest = fourthHighestFromLongestSuit(hand);

  if (fourthHighest) {
    return {
      lead: fourthHighest,
      title: "Lead fourth highest against no trumps",
      lesson:
        "Against no trumps, when you have no honour sequence, leading fourth highest from your longest suit is often a good attacking lead.",
      explanation: `The recommended lead is ${cardToText(
        fourthHighest
      )}. You do not have a strong honour sequence, so the normal no-trump idea is to attack your longest suit by leading fourth highest.`,
    };
  }

  const fallback = topFromLongestSuit(hand);

  return {
    lead: fallback,
    title: "Find the safest no-trump lead",
    lesson:
      "When you have no clear sequence or long suit, choose a sensible passive lead.",
    explanation: `The recommended lead is ${cardToText(
      fallback
    )}. There is no clear sequence or strong long suit, so choose a relatively safe lead from your best available suit.`,
  };
}

function chooseLeadForSuitContract(
  hand: Hand,
  trumpSuit: Suit
): {
  lead: Card;
  title: string;
  lesson: string;
  explanation: string;
} {
  const singleton = findSingleton(hand, trumpSuit);

  if (singleton) {
    return {
      lead: singleton,
      title: "Lead a singleton against a suit contract",
      lesson:
        "Against a suit contract, a singleton lead can be attractive because partner may later give you a ruff.",
      explanation: `The recommended lead is ${cardToText(
        singleton
      )}. This is a singleton. Against a suit contract, singleton leads can create ruffing chances if partner later gains the lead.`,
    };
  }

  const sequence = findHonourSequence(hand, trumpSuit);

  if (sequence) {
    return {
      lead: sequence.card,
      title: "Lead from a sequence against a suit contract",
      lesson:
        "Against a suit contract, leading the top of an honour sequence is often safer than leading away from unsupported honours.",
      explanation: `The recommended lead is ${cardToText(
        sequence.card
      )}, the ${sequence.type}. This is a safe attacking lead and avoids guessing with unsupported honours.`,
    };
  }

  const doubletonTop = findDoubletonTop(hand, trumpSuit);

  if (doubletonTop) {
    return {
      lead: doubletonTop,
      title: "Lead top of a doubleton",
      lesson:
        "Against a suit contract, leading the top of a doubleton can sometimes help create a later ruff.",
      explanation: `The recommended lead is ${cardToText(
        doubletonTop
      )}. This is top of a doubleton. If partner can gain the lead, they may be able to return the suit and give you a ruff.`,
    };
  }

  const fallback = topFromLongestSuit(hand, trumpSuit);

  return {
    lead: fallback,
    title: "Choose a safe suit-contract lead",
    lesson:
      "When there is no singleton, doubleton, or honour sequence, choose a relatively safe lead.",
    explanation: `The recommended lead is ${cardToText(
      fallback
    )}. There is no obvious singleton, doubleton, or sequence, so this is a practical safe lead from your best non-trump suit.`,
  };
}

export function generateLeadDeal(): LeadDeal {
  const template =
    LEAD_TEMPLATES[Math.floor(Math.random() * LEAD_TEMPLATES.length)];

  const hand = dealRandomHand();

  const leadChoice =
    template.contractType === "NT"
      ? chooseLeadForNT(hand)
      : chooseLeadForSuitContract(hand, template.trumpSuit ?? "S");

  return {
    id: `generated-lead-${Math.random().toString(36).slice(2)}`,
    title: leadChoice.title,
    lesson: leadChoice.lesson,
    contract: template.contract,
    declarer: template.declarer,
    defender: template.defender,
    auction: template.auction,
    hand,
    recommendedLead: leadChoice.lead,
    acceptableLeads: [leadChoice.lead],
    explanation: leadChoice.explanation,
  };
}