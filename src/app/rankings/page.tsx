"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayerAvatar from "@/components/PlayerAvatar";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Discipline {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  description: string;
  order: number;
  active: boolean;
}

interface Player {
  id: string;
  robloxId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface Tryout {
  id: string;
  playerId: string;
  disciplineId: string;
  tier: string;
  tierLabel: string;
  elo: number;
  notes: string;
  createdAt: string;
  region: string;
  position: string;
  player: Player;
  discipline: Discipline;
}

const REGIONS = ["EU", "NA", "SA", "AF", "ASIA", "AU"];
const POSITIONS = [
  { key: "Field", label: "Field", icon: "🏒" },
  { key: "GK", label: "Goalie", icon: "🧤" },
];

const TIER_ORDER = ["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5", "Unranked"];

const TIER_GRADIENTS: Record<string, string> = {
  "Tier 1": "from-red-500 to-rose-600",
  "Tier 2": "from-orange-500 to-amber-600",
  "Tier 3": "from-yellow-400 to-yellow-600",
  "Tier 4": "from-green-500 to-emerald-600",
  "Tier 5": "from-blue-500 to-indigo-600",
  Unranked: "from-gray-500 to-gray-600",
};

// ─── Rank Card ──────────────────────────────────────────────────────────────

function RankCard({ tryout, rank, index }: { tryout: Tryout; rank: number; index: number }) {
  const gradient = TIER_GRADIENTS[tryout.tier] ?? TIER_GRADIENTS.Unranked;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Link
        href={`/players/${tryout.player.id}`}
        className="group flex items-center gap-4 rounded-xl border border-[#1e293b] bg-[#111827] p-4 transition-all hover:border-[#2a3a52] hover:-translate-y-0.5"
      >
        {/* Rank */}
        <div className="flex-shrink-0 w-10 text-center">
          <span className={`text-lg font-black ${rank <= 3 ? "text-yellow-400" : "text-gray-600"}`}>
            #{rank}
          </span>
        </div>

        {/* Avatar */}
        <PlayerAvatar robloxId={tryout.player.robloxId} size={52} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate group-hover:text-blue-300 transition-colors">
            {tryout.player.displayName}
          </p>
          <p className="text-xs text-gray-500 truncate">@{tryout.player.username}</p>
        </div>

        {/* Tier */}
        <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradient} text-white text-xs font-bold shadow-sm`}>
          {tryout.tier}
        </div>

        {/* ELO */}
        <div className="flex-shrink-0 text-right min-w-[60px]">
          <p className="font-mono text-xl font-black text-white">{tryout.elo.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">ELO</p>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function RankingsPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("EU");
  const [selectedPosition, setSelectedPosition] = useState("Field");
  const [search, setSearch] = useState("");

  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tRes, dRes] = await Promise.all([
          fetch("/api/tryouts"),
          fetch("/api/disciplines"),
        ]);
        if (tRes.ok) setTryouts(await tRes.json());
        if (dRes.ok) setDisciplines(await dRes.json());
      } catch (err) {
        console.error("Failed to fetch rankings data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const gameTabs = useMemo(() => {
    return disciplines
      .filter((d) => d.active)
      .sort((a, b) => a.order - b.order)
      .map((d) => ({
        key: d.name,
        label: d.displayName || d.name,
        icon: d.icon || "🎯",
      }));
  }, [disciplines]);

  // Default to first discipline if none selected
  useEffect(() => {
    if (gameTabs.length > 0 && selectedGame === null) {
      setSelectedGame(gameTabs[0].key);
    }
  }, [gameTabs, selectedGame]);

  const filtered = useMemo(() => {
    let list = [...tryouts];

    // Game filter (always active since a game is always selected)
    if (selectedGame) {
      list = list.filter(
        (t) => t.discipline.name === selectedGame || t.disciplineId === selectedGame
      );
    }

    // Region & position filter
    list = list.filter(
      (t) => t.region === selectedRegion && t.position === selectedPosition
    );

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.player.displayName.toLowerCase().includes(q) ||
          t.player.username.toLowerCase().includes(q)
      );
    }

    // Sort by ELO descending
    list.sort((a, b) => b.elo - a.elo);

    return list;
  }, [tryouts, selectedGame, selectedRegion, selectedPosition, search]);

  const ranked = useMemo(
    () => filtered.map((t, i) => ({ ...t, rank: i + 1 })),
    [filtered]
  );

  const stats = useMemo(() => {
    const uniquePlayers = new Set(filtered.map((t) => t.playerId));
    return {
      tryouts: filtered.length,
      players: uniquePlayers.size,
    };
  }, [filtered]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="border-b border-[#1e293b]/50">
        <div className="max-w-5xl mx-auto px-4 py-10 pt-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Rankings
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Player rankings by game, region, and position
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Game tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-1.5 bg-[#111827] border border-[#1e293b] rounded-2xl p-1.5 mb-4"
        >
          {gameTabs.map((tab) => {
            const isActive = tab.key === selectedGame;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedGame(tab.key)}
                className={`relative z-10 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeGame"
                    className="absolute inset-0 rounded-xl bg-blue-600"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {tab.icon} {tab.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Filters row: Region + Position + Search */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-3 mb-6 flex-wrap"
        >
          {/* Region selector */}
          <div className="flex bg-[#111827] border border-[#1e293b] rounded-xl p-0.5">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedRegion === r
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Position selector */}
          <div className="flex bg-[#111827] border border-[#1e293b] rounded-xl p-0.5">
            {POSITIONS.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPosition(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  selectedPosition === p.key
                    ? selectedPosition === "GK"
                      ? "bg-purple-600 text-white"
                      : "bg-blue-600 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#1e293b] bg-[#111827] py-2 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
            <span>{stats.players} players</span>
            <span>·</span>
            <span>{stats.tryouts} ranked</span>
          </div>
        </motion.div>

        {/* Empty state */}
        {ranked.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-gray-600"
          >
            <span className="text-5xl mb-4">
              {selectedPosition === "GK" ? "🧤" : "🏒"}
            </span>
            <p className="text-lg font-semibold text-gray-500">No players ranked</p>
            <p className="text-sm">
              No {selectedPosition === "GK" ? "goalies" : "field players"} in{" "}
              {selectedGame || "this game"} ({selectedRegion}) yet
            </p>
          </motion.div>
        )}

        {/* Podium for top 3 */}
        {ranked.length >= 1 && !search && (
          <div className="flex items-end justify-center gap-3 sm:gap-4 mb-8 px-2">
            {/* 2nd */}
            {ranked[1] ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                <Link href={`/players/${ranked[1].player.id}`} className="group block text-center">
                  <div className="relative mx-auto mb-2">
                    <PlayerAvatar robloxId={ranked[1].player.robloxId} size={56} className="mx-auto" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-300/20 text-[10px] font-bold text-gray-300 ring-1 ring-gray-300/40">2</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors max-w-[80px] truncate">{ranked[1].player.displayName}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{ranked[1].elo}</p>
                </Link>
                <div className="mt-2 w-20 sm:w-24 h-16 rounded-t-lg bg-gradient-to-t from-gray-500/10 to-gray-400/5 border border-gray-500/20 flex items-start justify-center pt-2">
                  <span className="text-xl font-black text-gray-400/60">2</span>
                </div>
              </motion.div>
            ) : (
              <div className="w-20 sm:w-24 h-[96px] rounded-t-lg border border-dashed border-gray-700/50" />
            )}

            {/* 1st */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col items-center">
              <Link href={`/players/${ranked[0].player.id}`} className="group block text-center">
                <div className="relative mx-auto mb-2">
                  <div className="absolute -inset-2 rounded-full bg-yellow-500/20 blur-md" />
                  <PlayerAvatar robloxId={ranked[0].player.robloxId} size={72} className="mx-auto relative" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-xs ring-1 ring-yellow-400/40">👑</span>
                </div>
                <p className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors max-w-[100px] truncate">{ranked[0].player.displayName}</p>
                <p className="text-xs font-mono font-bold text-yellow-400">{ranked[0].elo}</p>
              </Link>
              <div className="mt-2 w-24 sm:w-28 h-24 rounded-t-xl bg-gradient-to-t from-yellow-500/10 to-yellow-400/5 border border-yellow-500/20 flex items-start justify-center pt-2">
                <span className="text-2xl font-black text-yellow-400/60">1</span>
              </div>
            </motion.div>

            {/* 3rd */}
            {ranked[2] ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col items-center">
                <Link href={`/players/${ranked[2].player.id}`} className="group block text-center">
                  <div className="relative mx-auto mb-2">
                    <PlayerAvatar robloxId={ranked[2].player.robloxId} size={48} className="mx-auto" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700/20 text-[10px] ring-1 ring-amber-600/40">3</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors max-w-[80px] truncate">{ranked[2].player.displayName}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{ranked[2].elo}</p>
                </Link>
                <div className="mt-2 w-20 sm:w-24 h-12 rounded-t-lg bg-gradient-to-t from-amber-700/10 to-amber-600/5 border border-amber-700/20 flex items-start justify-center pt-2">
                  <span className="text-xl font-black text-amber-600/60">3</span>
                </div>
              </motion.div>
            ) : (
              <div className="w-20 sm:w-24 h-[72px] rounded-t-lg border border-dashed border-gray-700/50" />
            )}
          </div>
        )}

        {/* Player list */}
        {ranked.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {(ranked.length >= 3 && !search ? ranked.slice(3) : ranked).map(
                (t, i) => (
                  <RankCard
                    key={t.id}
                    tryout={t}
                    rank={ranked.length >= 3 && !search ? i + 4 : i + 1}
                    index={i}
                  />
                )
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tier legend */}
        {ranked.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600"
          >
            <span className="font-medium text-gray-500">Tiers:</span>
            {TIER_ORDER.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${TIER_GRADIENTS[t]}`} />
                <span className="text-gray-400">{t}</span>
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
