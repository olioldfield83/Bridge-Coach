import { Card, Hand, Suit } from "./cards";
import { Seat } from "./playDeals";

export type PlayedCard = {
  seat: Seat;
  card: Card;
};

const RANK_VALUE: Record<string, number> = {
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

export function cardId(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function sameCard(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

export function removeCardFromHand(hand: Hand, card: Card): Hand {
  return hand.filter((c) => !sameCard(c, card));
}

export function hasSuit(hand: Hand, suit: Suit): boolean {
  return hand.some((card) => card.suit === suit);
}

export function isLegalPlay(hand: Hand, card: Card, currentTrick: PlayedCard[]): boolean {
  if (currentTrick.length === 0) return true;

  const ledSuit = currentTrick[0].card.suit;

  if (card.suit === ledSuit) return true;

  return !hasSuit(hand, ledSuit);
}

export function nextSeat(seat: Seat): Seat {
  if (seat === "N") return "E";
  if (seat === "E") return "S";
  if (seat === "S") return "W";
  return "N";
}

export function trickWinner(
  trick: PlayedCard[],
  trumpSuit: Suit | "NT"
): Seat {
  const ledSuit = trick[0].card.suit;

  let winningCard = trick[0];

  for (const played of trick.slice(1)) {
    const current = played.card;
    const winning = winningCard.card;

    const currentIsTrump = trumpSuit !== "NT" && current.suit === trumpSuit;
    const winningIsTrump = trumpSuit !== "NT" && winning.suit === trumpSuit;

    if (currentIsTrump && !winningIsTrump) {
      winningCard = played;
      continue;
    }

    if (currentIsTrump && winningIsTrump) {
      if (RANK_VALUE[current.rank] > RANK_VALUE[winning.rank]) {
        winningCard = played;
      }
      continue;
    }

    if (!currentIsTrump && !winningIsTrump && current.suit === ledSuit) {
      if (RANK_VALUE[current.rank] > RANK_VALUE[winning.rank]) {
        winningCard = played;
      }
    }
  }

  return winningCard.seat;
}

export function chooseAutoPlayCard(hand: Hand, currentTrick: PlayedCard[]): Card {
  if (currentTrick.length === 0) {
    return hand[hand.length - 1];
  }

  const ledSuit = currentTrick[0].card.suit;
  const cardsInLedSuit = hand.filter((card) => card.suit === ledSuit);

  if (cardsInLedSuit.length > 0) {
    return cardsInLedSuit[cardsInLedSuit.length - 1];
  }

  return hand[hand.length - 1];
}