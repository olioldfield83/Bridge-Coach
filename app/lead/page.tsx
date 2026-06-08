"use client";

import { useEffect, useState } from "react";
import { Card, Hand, Suit } from "@/lib/bridge/cards";
import { LeadDeal } from "@/lib/bridge/leadDeals";
import { cardId, sameCard } from "@/lib/bridge/play";

function displayBid(bid: string): string {
  return bid
    .replace("C", "♣")
    .replace("D", "♦")
    .replace("H", "♥")
    .replace("S", "♠");
}

function suitSymbol(suit: Suit): string {
  const suitSymbols: Record<Suit, string> = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  };

  return suitSymbols[suit];
}

function isRedSuit(suit: Suit): boolean {
  return suit === "H" || suit === "D";
}

function displayCard(card: Card): string {
  return `${card.rank}${suitSymbol(card.suit)}`;
}

function CardLabel({ card }: { card: Card }) {
  return (
    <>
      <span>{card.rank}</span>
      <span className={isRedSuit(card.suit) ? "text-red-600" : "text-black"}>
        {suitSymbol(card.suit)}
      </span>
    </>
  );
}

function CardButton({
  card,
  selected,
  disabled,
  onClick,
}: {
  card: Card;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const red = isRedSuit(card.suit);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-4 py-2 text-xl ${
        selected ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50"
      } disabled:opacity-50`}
    >
      <span>{card.rank}</span>
      <span className={selected ? "text-white" : red ? "text-red-600" : "text-black"}>
        {suitSymbol(card.suit)}
      </span>
    </button>
  );
}

function SuitLine({
  suit,
  cards,
  selectedLead,
  resultShown,
  onChooseCard,
}: {
  suit: Suit;
  cards: Card[];
  selectedLead: Card | null;
  resultShown: boolean;
  onChooseCard: (card: Card) => void;
}) {
  return (
    <div className="flex items-center gap-3 text-xl">
      <span
        className={`w-8 font-bold ${
          isRedSuit(suit) ? "text-red-600" : "text-black"
        }`}
      >
        {suitSymbol(suit)}
      </span>

      <div className="flex flex-wrap gap-2">
        {cards.length === 0 && <span>—</span>}

        {cards.map((card) => (
          <CardButton
            key={cardId(card)}
            card={card}
            selected={selectedLead ? sameCard(selectedLead, card) : false}
            disabled={resultShown}
            onClick={() => onChooseCard(card)}
          />
        ))}
      </div>
    </div>
  );
}

function LeadHandDisplay({
  hand,
  selectedLead,
  resultShown,
  onChooseCard,
}: {
  hand: Hand;
  selectedLead: Card | null;
  resultShown: boolean;
  onChooseCard: (card: Card) => void;
}) {
  const cardsBySuit = {
    S: hand.filter((card) => card.suit === "S"),
    H: hand.filter((card) => card.suit === "H"),
    D: hand.filter((card) => card.suit === "D"),
    C: hand.filter((card) => card.suit === "C"),
  };

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">Your hand: West</h2>

      <SuitLine
        suit="S"
        cards={cardsBySuit.S}
        selectedLead={selectedLead}
        resultShown={resultShown}
        onChooseCard={onChooseCard}
      />
      <SuitLine
        suit="H"
        cards={cardsBySuit.H}
        selectedLead={selectedLead}
        resultShown={resultShown}
        onChooseCard={onChooseCard}
      />
      <SuitLine
        suit="D"
        cards={cardsBySuit.D}
        selectedLead={selectedLead}
        resultShown={resultShown}
        onChooseCard={onChooseCard}
      />
      <SuitLine
        suit="C"
        cards={cardsBySuit.C}
        selectedLead={selectedLead}
        resultShown={resultShown}
        onChooseCard={onChooseCard}
      />
    </div>
  );
}

export default function LeadPage() {
  const [deal, setDeal] = useState<LeadDeal | null>(null);
  const [selectedLead, setSelectedLead] = useState<Card | null>(null);
  const [resultShown, setResultShown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAiExplanation, setLoadingAiExplanation] = useState(false);

  async function loadLeadDeal() {
    try {
      setError(null);
      setSelectedLead(null);
      setResultShown(false);
      setAiExplanation(null);
      setLoadingAiExplanation(false);

      const response = await fetch("/api/lead-deal");

      if (!response.ok) {
        throw new Error("Could not load lead deal.");
      }

      const data: LeadDeal = await response.json();
      setDeal(data);
    } catch (err) {
      console.error(err);
      setError("Sorry, I could not load a lead problem.");
    }
  }

  useEffect(() => {
    loadLeadDeal();
  }, []);

  function isCorrectLead(card: Card): boolean {
    if (!deal) return false;

    return deal.acceptableLeads.some((lead) => sameCard(lead, card));
  }

  async function requestAiExplanation(card: Card, correctLead: boolean) {
    if (!deal) return;

    try {
      setLoadingAiExplanation(true);
      setAiExplanation(null);

      const response = await fetch("/api/analyse-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deal,
          selectedLead: card,
          selectedLeadWasCorrect: correctLead,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not generate AI lead explanation.");
      }

      const data = await response.json();
      setAiExplanation(data.explanation);
    } catch (err) {
      console.error(err);
      setError(
        "Sorry, I could not generate the AI explanation. Check your OpenAI API key and try again."
      );
    } finally {
      setLoadingAiExplanation(false);
    }
  }

  async function checkLead() {
    if (!selectedLead || !deal) return;

    const correctLead = isCorrectLead(selectedLead);

    setAttempted((previous) => previous + 1);

    if (correctLead) {
      setCorrect((previous) => previous + 1);
    }

    setResultShown(true);

    await requestAiExplanation(selectedLead, correctLead);
  }

  const accuracy =
    attempted === 0 ? 0 : Math.round((correct / attempted) * 100);

  if (!deal) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl">Loading lead trainer...</div>
      </main>
    );
  }

  const selectedIsCorrect = selectedLead ? isCorrectLead(selectedLead) : false;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <a href="/" className="text-blue-700 underline">
            ← Back to bidding trainer
          </a>

          <h1 className="text-3xl font-bold">Opening Lead Trainer</h1>

          <p className="text-slate-600">
            You are defending as <strong>West</strong>. Choose your opening
            lead.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Progress</h2>
          <p className="text-slate-700">
            Attempted: <strong>{attempted}</strong> | Correct:{" "}
            <strong>{correct}</strong> | Accuracy: <strong>{accuracy}%</strong>
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
          <h2 className="text-lg font-semibold">Auction and contract</h2>

          <p>
            Auction:{" "}
            <strong>{deal.auction.map((bid) => displayBid(bid)).join(" - ")}</strong>
          </p>

          <p>
            Final contract:{" "}
            <strong>{displayBid(deal.contract)}</strong> by{" "}
            <strong>{deal.declarer}</strong>
          </p>
        </div>

        <LeadHandDisplay
          hand={deal.hand}
          selectedLead={selectedLead}
          resultShown={resultShown}
          onChooseCard={(card) => setSelectedLead(card)}
        />

        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Choose your opening lead</h2>

          <p className="text-slate-700">
            Selected lead:{" "}
            <strong>
              {selectedLead ? <CardLabel card={selectedLead} /> : "None yet"}
            </strong>
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={checkLead}
              disabled={!selectedLead || resultShown}
              className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50"
            >
              Check my lead
            </button>

            <button
              onClick={loadLeadDeal}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white"
            >
              Next lead problem
            </button>
          </div>
        </div>

        {resultShown && selectedLead && (
          <div
            className={`rounded-xl border p-5 shadow-sm space-y-3 ${
              selectedIsCorrect
                ? "border-green-300 bg-green-50 text-green-900"
                : "border-red-300 bg-red-50 text-red-900"
            }`}
          >
            <h2 className="text-xl font-semibold">
              {selectedIsCorrect ? "Good lead" : "Not the best lead"}
            </h2>

            <p>
              Your lead:{" "}
              <strong>
                <CardLabel card={selectedLead} />
              </strong>
            </p>

            <p>
              Recommended lead:{" "}
              <strong>
                <CardLabel card={deal.recommendedLead} />
              </strong>
            </p>

            <p className="whitespace-pre-line">{deal.explanation}</p>
          </div>
        )}

        {loadingAiExplanation && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 text-purple-950">
            Generating AI explanation...
          </div>
        )}

        {aiExplanation && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 text-purple-950 space-y-2">
            <h2 className="text-xl font-semibold">AI coach explanation</h2>
            <p className="whitespace-pre-line">{aiExplanation}</p>
          </div>
        )}

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Prototype note</h2>
          <p className="text-slate-700">
            This version uses curated opening lead problems and AI coaching
            explanations. Later we can add topic selection, more deals, and
            double-dummy analysis.
          </p>
        </div>
      </div>
    </main>
  );
}