"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FIELD_CATEGORIES = [
  { key: "puckHandling", label: "Puck Handling", icon: "🏒" },
  { key: "scoring", label: "Scoring / Goals", icon: "🥅" },
  { key: "defense", label: "Defense", icon: "🛡️" },
  { key: "passing", label: "Passing", icon: "🎯" },
] as const;

const GOALIE_CATEGORIES = [
  { key: "saves", label: "Saves (X/10 shots)", icon: "🧤" },
  { key: "positioning", label: "Positioning", icon: "📐" },
  { key: "rebound", label: "Rebound Control", icon: "🔄" },
  { key: "goalieDefense", label: "Puck Handling (G)", icon: "🏒" },
] as const;

type FieldKey = (typeof FIELD_CATEGORIES)[number]["key"];
type GoalieKey = (typeof GOALIE_CATEGORIES)[number]["key"];

interface FieldRatings {
  puckHandling: number;
  scoring: number;
  defense: number;
  passing: number;
}

interface GoalieRatings {
  saves: number;
  positioning: number;
  rebound: number;
  goalieDefense: number;
}

interface EloCalculatorProps {
  onSubmit?: (result: {
    type: "field" | "goalie";
    ratings: FieldRatings | GoalieRatings;
    average: number;
  }) => void;
  initialRatings?: Partial<FieldRatings | GoalieRatings>;
  initialType?: "field" | "goalie";
}

export default function EloCalculator({ onSubmit, initialRatings = {}, initialType = "field" }: EloCalculatorProps) {
  const [isGoalie, setIsGoalie] = useState(initialType === "goalie");
  const [fieldRatings, setFieldRatings] = useState<FieldRatings>({
    puckHandling: (initialRatings as Partial<FieldRatings>).puckHandling ?? 5,
    scoring: (initialRatings as Partial<FieldRatings>).scoring ?? 5,
    defense: (initialRatings as Partial<FieldRatings>).defense ?? 5,
    passing: (initialRatings as Partial<FieldRatings>).passing ?? 5,
  });
  const [goalieRatings, setGoalieRatings] = useState<GoalieRatings>({
    saves: (initialRatings as Partial<GoalieRatings>).saves ?? 5,
    positioning: (initialRatings as Partial<GoalieRatings>).positioning ?? 5,
    rebound: (initialRatings as Partial<GoalieRatings>).rebound ?? 5,
    goalieDefense: (initialRatings as Partial<GoalieRatings>).goalieDefense ?? 5,
  });

  const ratings = isGoalie ? goalieRatings : fieldRatings;
  const categories = isGoalie ? GOALIE_CATEGORIES : FIELD_CATEGORIES;

  const average = Math.round(
    (Object.values(ratings).reduce((a, b) => a + b, 0) / categories.length) * 100
  );

  const tier = (() => {
    if (average >= 900) return { label: "Tier 1", color: "text-red-400" };
    if (average >= 750) return { label: "Tier 2", color: "text-orange-400" };
    if (average >= 600) return { label: "Tier 3", color: "text-yellow-400" };
    if (average >= 450) return { label: "Tier 4", color: "text-green-400" };
    if (average >= 300) return { label: "Tier 5", color: "text-blue-400" };
    return { label: "Unranked", color: "text-gray-400" };
  })();

  const setRating = <K extends FieldKey | GoalieKey>(key: K, value: number) => {
    if (isGoalie) {
      setGoalieRatings((prev) => ({ ...prev, [key]: value }));
    } else {
      setFieldRatings((prev) => ({ ...prev, [key]: value }));
    }
  };

  const setAll = (value: number) => {
    if (isGoalie) {
      setGoalieRatings({ saves: value, positioning: value, rebound: value, goalieDefense: value });
    } else {
      setFieldRatings({ puckHandling: value, scoring: value, defense: value, passing: value });
    }
  };

  const resetAll = () => setAll(5);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        type: isGoalie ? "goalie" : "field",
        ratings,
        average,
      });
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">📊</span>
          <h3 className="text-white font-semibold">ELO Calculator</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Role toggle */}
          <div className="flex bg-[#0a0e1a] rounded-lg p-0.5 border border-[#1e293b]">
            <button
              type="button"
              onClick={() => setIsGoalie(false)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                !isGoalie ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Field
            </button>
            <button
              type="button"
              onClick={() => setIsGoalie(true)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isGoalie ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Goalie
            </button>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-black text-white">{average}</p>
            <p className={`text-xs font-semibold ${tier.color}`}>{tier.label}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="border-t border-[#1e293b] px-5 py-5">
        {/* Quick actions */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-gray-500 mr-1">Set all:</span>
          {[0, 3, 5, 7, 10].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAll(v)}
              className="px-2.5 py-1 bg-[#1e293b] text-gray-300 rounded-lg text-xs font-medium hover:text-white hover:bg-[#2a3a52] transition-colors"
            >
              {v}
            </button>
          ))}
          <button
            type="button"
            onClick={resetAll}
            className="ml-auto px-3 py-1 text-gray-400 text-xs hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Rating sliders */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isGoalie ? "goalie" : "field"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {categories.map((cat) => (
              <div key={cat.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-300">{cat.label}</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-white w-8 text-right">
                    {(ratings as unknown as Record<string, number>)[cat.key]}
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 11 }, (_, i) => i).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(cat.key, val)}
                      className={`flex-1 h-8 rounded-md text-xs font-bold transition-all ${
                        val <= (ratings as unknown as Record<string, number>)[cat.key]
                          ? isGoalie
                            ? "bg-purple-500 text-white shadow-sm"
                            : "bg-blue-500 text-white shadow-sm"
                          : "bg-[#1e293b] text-gray-600 hover:bg-[#2a3a52] hover:text-gray-400"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Summary bar */}
        <div className="mt-6 flex items-center justify-between bg-[#0a0e1a] rounded-xl px-4 py-3 border border-[#1e293b]">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Overall Score</p>
            <p className="font-mono text-3xl font-black text-white">{average}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              {isGoalie ? "Goalie" : "Field"} Tier
            </p>
            <p className={`text-lg font-bold ${tier.color}`}>{tier.label}</p>
          </div>
        </div>

        {/* Submit button */}
        {onSubmit && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            type="button"
            className={`w-full mt-4 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity ${
              isGoalie
                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                : "bg-gradient-to-r from-blue-500 to-cyan-500"
            }`}
          >
            Use These Ratings
          </motion.button>
        )}
      </div>
    </div>
  );
}
