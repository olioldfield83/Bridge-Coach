import { Card, Hand, RANKS, SUITS } from "./cards";

export type Deal = {
  id: string;
  south: Hand;
  dealer: "S";
  vulnerability: "None";
};

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

export function dealSouthHand(): Deal {
  const deck = shuffle(createDeck());
  const south = deck.slice(0, 13);

  return {
    id: crypto.randomUUID(),
    south,
    dealer: "S",
    vulnerability: "None",
  };
}