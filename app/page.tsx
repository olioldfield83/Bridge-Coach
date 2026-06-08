"use client";

import { useEffect, useState } from "react";
import { Hand, formatHandBySuit } from "@/lib/bridge/cards";

type Deal = {
  id: string;
  south: Hand;
  dealer: "S";
  vulnerability: "None";
  title?: string;
  lesson?: string;
  expectedBid?: string;
  training?: boolean;
};

type TrainingTopic = {
  id: string;
  title: string;
  lesson: string;
  expectedBid: string;
};

type EvaluationResponse = {
  evaluation: {
    userBid: string;
    recommendedBid: string;
    judgement: "correct" | "acceptable" | "incorrect";
    facts: {
      hcp: number;
      shape: string;
      balanced: boolean;
      ruleOf20: number;
    };
    reasonCodes: string[];
  };
  coachExplanation: string;
};

type Stats = {
  attempted: number;
  correct: number;
};

type PracticeMode = "random" | "training";

const BIDS = [
  "Pass",
  "1C",
  "1D",
  "1H",
  "1S",
  "1NT",
  "2C",
  "2D",
  "2H",
  "2S",
  "2NT",
];

function displayBid(bid: string): string {
  return bid
    .replace("C", "♣")
    .replace("D", "♦")
    .replace("H", "♥")
    .replace("S", "♠");
}

function judgementLabel(judgement: string): string {
  if (judgement === "correct") return "Correct";
  if (judgement === "acceptable") return "Acceptable";
  return "Incorrect";
}

function SuitLine({
  label,
  cards,
}: {
  label: string;
  cards: string[];
}) {
  return (
    <div className="flex gap-3 text-xl">
      <span className="w-8 font-bold">{label}</span>
      <span>{cards.length ? cards.join(" ") : "—"}</span>
    </div>
  );
}

function HandDisplay({ hand }: { hand: Hand }) {
  const bySuit = formatHandBySuit(hand);

  return (
    <div className="rounded-xl border p-5 bg-white shadow-sm space-y-2">
      <SuitLine label="♠" cards={bySuit.S} />
      <SuitLine label="♥" cards={bySuit.H} />
      <SuitLine label="♦" cards={bySuit.D} />
      <SuitLine label="♣" cards={bySuit.C} />
    </div>
  );
}

export default function Home() {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [selectedBid, setSelectedBid] = useState<string>("");
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [loadingDeal, setLoadingDeal] = useState(false);
  const [checkingBid, setCheckingBid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("random");
  const [topics, setTopics] = useState<TrainingTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("random-training");
  const [stats, setStats] = useState<Stats>({
    attempted: 0,
    correct: 0,
  });

  async function loadTopics() {
    try {
      const response = await fetch("/api/training-topics");

      if (!response.ok) {
        throw new Error("Could not load training topics.");
      }

      const data: TrainingTopic[] = await response.json();
      setTopics(data);
    } catch (err) {
      console.error(err);
      setError("Sorry, I could not load the training topics.");
    }
  }

  async function loadDeal(
    mode: PracticeMode = practiceMode,
    topicId: string = selectedTopicId
  ) {
    try {
      setLoadingDeal(true);
      setError(null);
      setResult(null);
      setSelectedBid("");

      let endpoint = "/api/deal";

      if (mode === "training") {
        endpoint =
          topicId && topicId !== "random-training"
            ? `/api/training-hand?topic=${topicId}`
            : "/api/training-hand";
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Could not load a new deal.");
      }

      const data = await response.json();
      setDeal(data);
    } catch (err) {
      console.error(err);
      setError("Sorry, I could not deal a new hand. Please try again.");
    } finally {
      setLoadingDeal(false);
    }
  }

  async function changePracticeMode(mode: PracticeMode) {
    setPracticeMode(mode);
    await loadDeal(mode, selectedTopicId);
  }

  async function changeTrainingTopic(topicId: string) {
    setSelectedTopicId(topicId);
    setPracticeMode("training");
    await loadDeal("training", topicId);
  }

  async function evaluateBid() {
    if (!deal || !selectedBid) return;

    try {
      setCheckingBid(true);
      setError(null);
      setResult(null);

      const response = await fetch("/api/evaluate-bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hand: deal.south,
          userBid: selectedBid,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not evaluate bid.");
      }

      const data: EvaluationResponse = await response.json();

      setResult(data);

      setStats((previous) => ({
        attempted: previous.attempted + 1,
        correct:
          data.evaluation.judgement === "correct"
            ? previous.correct + 1
            : previous.correct,
      }));
    } catch (err) {
      console.error(err);
      setError(
        "Sorry, I could not evaluate that bid. Check your OpenAI API key and try again."
      );
    } finally {
      setCheckingBid(false);
    }
  }

  useEffect(() => {
    loadTopics();
    loadDeal("random", "random-training");
  }, []);

  const accuracy =
    stats.attempted === 0
      ? 0
      : Math.round((stats.correct / stats.attempted) * 100);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Acol Coach MVP</h1>
          <p className="text-slate-600">
            You are South. Dealer South. Vulnerability: None.
          </p>
        </div>

        <div className="rounded-xl border p-4 bg-white shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Practice mode</h2>

          <div className="flex gap-2">
            <button
              onClick={() => changePracticeMode("random")}
              className={`rounded-lg border px-4 py-2 ${
                practiceMode === "random"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              Random hands
            </button>

            <button
              onClick={() => changePracticeMode("training")}
              className={`rounded-lg border px-4 py-2 ${
                practiceMode === "training"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              Training hands
            </button>
          </div>

          {practiceMode === "training" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Training topic
              </label>

              <select
                value={selectedTopicId}
                onChange={(event) => changeTrainingTopic(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="random-training">Random training topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title} — expected {displayBid(topic.expectedBid)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="rounded-xl border p-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold">Progress</h2>
          <p className="text-slate-700">
            Attempted: <strong>{stats.attempted}</strong> | Correct:{" "}
            <strong>{stats.correct}</strong> | Accuracy:{" "}
            <strong>{accuracy}%</strong>
          </p>
        </div>

        {deal?.training && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <h2 className="text-lg font-semibold">{deal.title}</h2>
            <p>{deal.lesson}</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {loadingDeal && (
          <div className="rounded-xl border p-5 bg-white shadow-sm">
            Dealing a new hand...
          </div>
        )}

        {deal && !loadingDeal && <HandDisplay hand={deal.south} />}

        <div className="rounded-xl border p-5 bg-white shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">What is your opening bid?</h2>

          <div className="grid grid-cols-4 gap-2">
            {BIDS.map((bid) => (
              <button
                key={bid}
                onClick={() => setSelectedBid(bid)}
                disabled={checkingBid}
                className={`rounded-lg border px-4 py-2 ${
                  selectedBid === bid
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-slate-50"
                } disabled:opacity-50`}
              >
                {displayBid(bid)}
              </button>
            ))}
          </div>

          <button
            onClick={evaluateBid}
            disabled={!selectedBid || checkingBid || !deal}
            className="rounded-lg bg-black text-white px-5 py-2 disabled:opacity-50"
          >
            {checkingBid ? "Checking..." : "Check my bid"}
          </button>
        </div>

        {result && (
          <div className="rounded-xl border p-5 bg-white shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Result</h2>
              <p>
                Your bid:{" "}
                <strong>{displayBid(result.evaluation.userBid)}</strong>
              </p>
              <p>
                Recommended:{" "}
                <strong>{displayBid(result.evaluation.recommendedBid)}</strong>
              </p>
              <p>
                Judgement:{" "}
                <strong>{judgementLabel(result.evaluation.judgement)}</strong>
              </p>
            </div>

            {deal?.expectedBid && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                Training hand expected bid:{" "}
                <strong>{displayBid(deal.expectedBid)}</strong>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                HCP: <strong>{result.evaluation.facts.hcp}</strong>
              </p>
              <p>
                Shape: <strong>{result.evaluation.facts.shape}</strong>
              </p>
              <p>
                Balanced:{" "}
                <strong>
                  {result.evaluation.facts.balanced ? "Yes" : "No"}
                </strong>
              </p>
              <p>
                Rule of 20:{" "}
                <strong>{result.evaluation.facts.ruleOf20}</strong>
              </p>
            </div>

            {result.evaluation.reasonCodes.length > 0 && (
              <div>
                <h3 className="font-semibold">Reason tags</h3>
                <div className="flex flex-wrap gap-2">
                  {result.evaluation.reasonCodes.map((code) => (
                    <span
                      key={code}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold">Coach explanation</h3>
              <p className="whitespace-pre-line text-slate-700">
                {result.coachExplanation}
              </p>
            </div>

            <button
              onClick={() => loadDeal()}
              disabled={loadingDeal}
              className="rounded-lg bg-blue-600 text-white px-5 py-2 disabled:opacity-50"
            >
              Next hand
            </button>
          </div>
        )}
      </div>
    </main>
  );
}