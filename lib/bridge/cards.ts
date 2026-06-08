export type Suit = "S" | "H" | "D" | "C";
export type Rank =
  | "A"
  | "K"
  | "Q"
  | "J"
  | "T"
  | "9"
  | "8"
  | "7"
  | "6"
  | "5"
  | "4"
  | "3"
  | "2";

export type Card = {
  suit: Suit;
  rank: Rank;
};

export type Hand = Card[];

export const SUITS: Suit[] = ["S", "H", "D", "C"];

export const RANKS: Rank[] = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
];

export function formatCard(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return `${card.rank}${suitSymbols[card.suit]}`;
}

export function formatHandBySuit(hand: Hand): Record<Suit, string[]> {
  return {
    S: hand.filter((c) => c.suit === "S").map((c) => c.rank),
    H: hand.filter((c) => c.suit === "H").map((c) => c.rank),
    D: hand.filter((c) => c.suit === "D").map((c) => c.rank),
    C: hand.filter((c) => c.suit === "C").map((c) => c.rank),
  };
}