import { Card, Hand } from "./cards";

export type Seat = "N" | "E" | "S" | "W";

export type PlayDeal = {
  id: string;
  title: string;
  lesson: string;
  contract: string;
  declarer: Seat;
  trumpSuit: "S" | "H" | "D" | "C" | "NT";
  leader: Seat;
  openingLead: Card;
  hands: {
    north: Hand;
    east: Hand;
    south: Hand;
    west: Hand;
  };
  coachingTip: string;
};

export const PLAY_DEALS: PlayDeal[] = [
  {
    id: "draw-trumps-4s",
    title: "Declarer Play: Draw Trumps",
    lesson:
      "You are in 4♠. The main lesson is to draw trumps before cashing side-suit winners.",
    contract: "4S",
    declarer: "S",
    trumpSuit: "S",
    leader: "W",
    openingLead: { suit: "H", rank: "K" },
    coachingTip:
      "After winning the first trick, declarer should usually draw trumps before cashing outside winners. This prevents defenders from ruffing your good cards.",
    hands: {
      north: [
        { suit: "S", rank: "Q" },
        { suit: "S", rank: "7" },
        { suit: "S", rank: "4" },

        { suit: "H", rank: "8" },
        { suit: "H", rank: "5" },

        { suit: "D", rank: "A" },
        { suit: "D", rank: "Q" },
        { suit: "D", rank: "7" },
        { suit: "D", rank: "3" },

        { suit: "C", rank: "K" },
        { suit: "C", rank: "8" },
        { suit: "C", rank: "6" },
        { suit: "C", rank: "2" },
      ],
      east: [
        { suit: "S", rank: "9" },
        { suit: "S", rank: "6" },

        { suit: "H", rank: "Q" },
        { suit: "H", rank: "J" },
        { suit: "H", rank: "9" },
        { suit: "H", rank: "4" },

        { suit: "D", rank: "T" },
        { suit: "D", rank: "8" },
        { suit: "D", rank: "5" },

        { suit: "C", rank: "Q" },
        { suit: "C", rank: "J" },
        { suit: "C", rank: "7" },
        { suit: "C", rank: "3" },
      ],
      south: [
        { suit: "S", rank: "A" },
        { suit: "S", rank: "K" },
        { suit: "S", rank: "J" },
        { suit: "S", rank: "T" },
        { suit: "S", rank: "8" },
        { suit: "S", rank: "3" },

        { suit: "H", rank: "A" },
        { suit: "H", rank: "7" },
        { suit: "H", rank: "2" },

        { suit: "D", rank: "K" },
        { suit: "D", rank: "6" },

        { suit: "C", rank: "A" },
        { suit: "C", rank: "5" },
      ],
      west: [
        { suit: "S", rank: "5" },
        { suit: "S", rank: "2" },

        { suit: "H", rank: "K" },
        { suit: "H", rank: "T" },
        { suit: "H", rank: "6" },
        { suit: "H", rank: "3" },

        { suit: "D", rank: "J" },
        { suit: "D", rank: "9" },
        { suit: "D", rank: "4" },
        { suit: "D", rank: "2" },

        { suit: "C", rank: "T" },
        { suit: "C", rank: "9" },
        { suit: "C", rank: "4" },
      ],
    },
  },
];