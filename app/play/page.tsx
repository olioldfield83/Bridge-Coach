"use client";

import { useEffect, useState } from "react";
import { Card, Hand, Suit, formatHandBySuit } from "@/lib/bridge/cards";
import { Seat, PlayDeal } from "@/lib/bridge/playDeals";
import {
  PlayedCard,
  cardId,
  chooseAutoPlayCard,
  isLegalPlay,
  nextSeat,
  removeCardFromHand,
  trickWinner,
} from "@/lib/bridge/play";

type HandsState = {
  north: Hand;
  east: Hand;
  south: Hand;
  west: Hand;
};

const SEAT_LABELS: Record<Seat, string> = {
  N: "North / Dummy",
  E: "East",
  S: "South / Declarer",
  W: "West",
};

function displayBid(bid: string): string {
  return bid
    .replace("C", "♣")
    .replace("D", "♦")
    .replace("H", "♥")
    .replace("S", "♠");
}

function displayCard(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return `${card.rank}${suitSymbols[card.suit]}`;
}

function SuitLine({
  label,
  cards,
  onCardClick,
  clickable,
}: {
  label: string;
  cards: Card[];
  onCardClick?: (card: Card) => void;
  clickable?: boolean;
}) {
  const isRedSuit = label === "♥" || label === "♦";

  return (
    <div className="flex items-center gap-3 text-xl">
      <span
        className={`w-8 font-bold ${
          isRedSuit ? "text-red-600" : "text-black"
        }`}
      >
        {label}
      </span>

      <div className="flex flex-wrap gap-2">
        {cards.length === 0 && <span>—</span>}

        {cards.map((card) => (
          <button
            key={cardId(card)}
            onClick={() => onCardClick?.(card)}
            disabled={!clickable}
            className={`rounded-lg border px-3 py-1 ${
              clickable
                ? "bg-white hover:bg-blue-50"
                : "bg-slate-50 text-slate-500"
            } disabled:opacity-50`}
          >
            {card.rank}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlayHandDisplay({
  title,
  hand,
  canPlay,
  onCardClick,
}: {
  title: string;
  hand: Hand;
  canPlay: boolean;
  onCardClick: (card: Card) => void;
}) {
  const cardsBySuit = {
    S: hand.filter((card) => card.suit === "S"),
    H: hand.filter((card) => card.suit === "H"),
    D: hand.filter((card) => card.suit === "D"),
    C: hand.filter((card) => card.suit === "C"),
  };

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>

      <SuitLine
        label="♠"
        cards={cardsBySuit.S}
        clickable={canPlay}
        onCardClick={onCardClick}
      />
      <SuitLine
        label="♥"
        cards={cardsBySuit.H}
        clickable={canPlay}
        onCardClick={onCardClick}
      />
      <SuitLine
        label="♦"
        cards={cardsBySuit.D}
        clickable={canPlay}
        onCardClick={onCardClick}
      />
      <SuitLine
        label="♣"
        cards={cardsBySuit.C}
        clickable={canPlay}
        onCardClick={onCardClick}
      />
    </div>
  );
}

export default function PlayPage() {
  const [deal, setDeal] = useState<PlayDeal | null>(null);
  const [hands, setHands] = useState<HandsState | null>(null);
  const [currentTurn, setCurrentTurn] = useState<Seat>("W");
  const [currentTrick, setCurrentTrick] = useState<PlayedCard[]>([]);
  const [completedTricks, setCompletedTricks] = useState<PlayedCard[][]>([]);
  const [playHistory, setPlayHistory] = useState<PlayedCard[]>([]);
  const [declarerTricks, setDeclarerTricks] = useState(0);
  const [defenderTricks, setDefenderTricks] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [showCoachTip, setShowCoachTip] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analysingPlay, setAnalysingPlay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPlayDeal() {
    try {
      setError(null);

      const response = await fetch("/api/play-deal");

      if (!response.ok) {
        throw new Error("Could not load play deal.");
      }

      const data: PlayDeal = await response.json();

      setDeal(data);
      setHands(data.hands);
      setCurrentTurn("W");
      setCurrentTrick([]);
      setCompletedTricks([]);
      setPlayHistory([]);
      setDeclarerTricks(0);
      setDefenderTricks(0);
      setShowCoachTip(false);
      setAiAnalysis(null);
      setMessage("West leads the ♥K. Click Play opening lead to begin.");
    } catch (err) {
      console.error(err);
      setError("Sorry, I could not load the declarer play deal.");
    }
  }

  useEffect(() => {
    loadPlayDeal();
  }, []);

  function handForSeat(seat: Seat): Hand {
    if (!hands) return [];

    if (seat === "N") return hands.north;
    if (seat === "E") return hands.east;
    if (seat === "S") return hands.south;
    return hands.west;
  }

  function updateHand(seat: Seat, newHand: Hand) {
    if (!hands) return;

    setHands({
      ...hands,
      north: seat === "N" ? newHand : hands.north,
      east: seat === "E" ? newHand : hands.east,
      south: seat === "S" ? newHand : hands.south,
      west: seat === "W" ? newHand : hands.west,
    });
  }

  function completeTrickIfNeeded(newTrick: PlayedCard[]) {
    if (!deal) return;

    if (newTrick.length < 4) {
      setCurrentTurn(nextSeat(currentTurn));
      return;
    }

    const winner = trickWinner(newTrick, deal.trumpSuit);
    const declarerSideWon = winner === "S" || winner === "N";

    setCompletedTricks((previous) => [...previous, newTrick]);
    setCurrentTrick([]);
    setCurrentTurn(winner);

    if (declarerSideWon) {
      setDeclarerTricks((previous) => previous + 1);
      setMessage(
        `${SEAT_LABELS[winner]} wins the trick. Declarer side has won another trick.`
      );
    } else {
      setDefenderTricks((previous) => previous + 1);
      setMessage(
        `${SEAT_LABELS[winner]} wins the trick. Defenders have won another trick.`
      );
    }
  }

  function playCardFromSeat(seat: Seat, card: Card) {
    if (!hands || !deal) return;

    const hand = handForSeat(seat);

    if (seat !== currentTurn) {
      setMessage(`It is not ${SEAT_LABELS[seat]}'s turn.`);
      return;
    }

    if (!isLegalPlay(hand, card, currentTrick)) {
      setMessage("That card is not legal. You must follow suit if you can.");
      return;
    }

    const playedCard: PlayedCard = { seat, card };

    const newHand = removeCardFromHand(hand, card);
    updateHand(seat, newHand);

    const newTrick = [...currentTrick, playedCard];

    setCurrentTrick(newTrick);
    setPlayHistory((previous) => [...previous, playedCard]);
    setAiAnalysis(null);

    completeTrickIfNeeded(newTrick);
  }

  function playOpeningLead() {
    if (!deal || !hands) return;

    playCardFromSeat("W", deal.openingLead);
  }

  function autoPlayIfDefenderTurn() {
    if (!hands) return;

    if (currentTurn !== "E" && currentTurn !== "W") {
      setMessage("It is declarer's side to play.");
      return;
    }

    const hand = handForSeat(currentTurn);
    const card = chooseAutoPlayCard(hand, currentTrick);

    playCardFromSeat(currentTurn, card);
  }

  async function analysePlay() {
    if (!deal) return;

    try {
      setAnalysingPlay(true);
      setError(null);
      setAiAnalysis(null);

      const response = await fetch("/api/analyse-play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deal,
          playHistory,
          declarerTricks,
          defenderTricks,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not analyse play.");
      }

      const data = await response.json();

      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setError(
        "Sorry, I could not analyse the play. Check your OpenAI API key and try again."
      );
    } finally {
      setAnalysingPlay(false);
    }
  }

  function canPlayFromSouth() {
    return currentTurn === "S";
  }

  function canPlayFromNorth() {
    return currentTurn === "N";
  }

  if (!deal || !hands) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">Loading declarer play deal...</div>
      </main>
    );
  }

  const isDefenderTurn = currentTurn === "E" || currentTurn === "W";
  const cardsPlayed = playHistory.length;
  const handComplete = completedTricks.length === 13;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <a href="/" className="text-blue-700 underline">
            ← Back to bidding trainer
          </a>

          <h1 className="text-3xl font-bold">Declarer Play Trainer</h1>

          <p className="text-slate-600">
            Contract: <strong>{displayBid(deal.contract)}</strong> by South.
            Trump suit: <strong>♠</strong>
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
          <h2 className="text-lg font-semibold">{deal.title}</h2>
          <p>{deal.lesson}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Status</h2>
          <p>
            Current turn: <strong>{SEAT_LABELS[currentTurn]}</strong>
          </p>
          <p>
            Declarer tricks: <strong>{declarerTricks}</strong> | Defender
            tricks: <strong>{defenderTricks}</strong>
          </p>
          <p>
            Cards played: <strong>{cardsPlayed}</strong> / 52
          </p>
          <p className="mt-2 text-slate-700">{message}</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Current trick</h2>

          {currentTrick.length === 0 ? (
            <p className="text-slate-500">No cards in the current trick.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentTrick.map((played) => (
                <div
                  key={`${played.seat}-${cardId(played.card)}`}
                  className="rounded-lg border bg-slate-50 px-3 py-2"
                >
                  <strong>{played.seat}</strong>: {displayCard(played.card)}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {completedTricks.length === 0 && currentTrick.length === 0 && (
              <button
                onClick={playOpeningLead}
                className="rounded-lg bg-black px-5 py-2 text-white"
              >
                Play opening lead: {displayCard(deal.openingLead)}
              </button>
            )}

            {isDefenderTurn && !handComplete && (
              <button
                onClick={autoPlayIfDefenderTurn}
                className="rounded-lg bg-slate-800 px-5 py-2 text-white"
              >
                Auto-play defender card
              </button>
            )}

            <button
              onClick={() => setShowCoachTip(true)}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white"
            >
              Show coaching tip
            </button>

            <button
              onClick={analysePlay}
              disabled={playHistory.length === 0 || analysingPlay}
              className="rounded-lg bg-green-700 px-5 py-2 text-white disabled:opacity-50"
            >
              {analysingPlay ? "Analysing..." : "Analyse my play"}
            </button>

            <button
              onClick={loadPlayDeal}
              className="rounded-lg border bg-white px-5 py-2"
            >
              Restart deal
            </button>
          </div>
        </div>

        {showCoachTip && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
            <h2 className="text-lg font-semibold">Coach tip</h2>
            <p>{deal.coachingTip}</p>
          </div>
        )}

        {aiAnalysis && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-purple-950">
            <h2 className="text-lg font-semibold">AI post-hand analysis</h2>
            <p className="whitespace-pre-line">{aiAnalysis}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PlayHandDisplay
            title="North / Dummy"
            hand={hands.north}
            canPlay={canPlayFromNorth()}
            onCardClick={(card) => playCardFromSeat("N", card)}
          />

          <PlayHandDisplay
            title="South / Declarer"
            hand={hands.south}
            canPlay={canPlayFromSouth()}
            onCardClick={(card) => playCardFromSeat("S", card)}
          />
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Prototype note</h2>
          <p className="text-slate-700">
            East and West are currently auto-played using simple logic. The AI
            analysis is coaching feedback based on the play sequence, not yet a
            double-dummy solver result.
          </p>
        </div>
      </div>
    </main>
  );
}