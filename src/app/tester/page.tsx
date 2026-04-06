"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PlayerAvatar from "@/components/PlayerAvatar";
import EloCalculator from "@/components/EloCalculator";

// ─── Types ──────────────────────────────────────────────────────────────────

interface User {
  robloxId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isAdmin: boolean;
  role: string;
}

interface Player {
  id: string;
  robloxId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  tryouts?: { discipline: { name: string } }[];
}

interface Discipline {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  description: string;
  order: number;
  active: boolean;
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
  player: Player;
  discipline: Discipline;
}

const TIER_OPTIONS = ["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5", "Unranked"];

// ─── Main Tester Page ───────────────────────────────────────────────────────

export default function TesterPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  // Shared data
  const [players, setPlayers] = useState<Player[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [tryouts, setTryouts] = useState<Tryout[]>([]);

  // Form state
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState("");
  const [region, setRegion] = useState("EU");
  const [position, setPosition] = useState("Field");
  const [tier, setTier] = useState("Tier 1");
  const [elo, setElo] = useState("1000");
  const [notes, setNotes] = useState("");
  const [ratings, setRatings] = useState<Record<string, number | null> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && !user.isAdmin && user.role === "tester") {
      fetchData();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        window.location.href = "/api/auth/login";
        return;
      }
      const data = await res.json();

      // Check if user is a tester or admin
      if (data.isAdmin) {
        // Admins can also access tester page, but redirect them to admin
        window.location.href = "/admin";
        return;
      }

      if (data.role !== "tester") {
        window.location.href = "/";
        return;
      }

      setUser(data);
    } catch {
      window.location.href = "/api/auth/login";
    } finally {
      setLoading(false);
    }
  };

  // Check for pending approval
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("pending") === "1") {
        setPending(true);
      }
    }
  }, []);

  const fetchData = async () => {
    const [pRes, dRes, tRes] = await Promise.all([
      fetch("/api/players"),
      fetch("/api/disciplines"),
      fetch("/api/tryouts"),
    ]);
    if (pRes.ok) setPlayers(await pRes.json());
    if (dRes.ok) setDisciplines(await dRes.json());
    if (tRes.ok) setTryouts(await tRes.json());
  };

  const filteredPlayers = playerSearch
    ? players.filter(
        (p) =>
          p.displayName.toLowerCase().includes(playerSearch.toLowerCase()) ||
          p.username.toLowerCase().includes(playerSearch.toLowerCase()) ||
          p.robloxId.includes(playerSearch)
      )
    : players;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId || !selectedDisciplineId || !elo.trim()) {
      setMessage("Please fill in player, discipline, and ELO.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const body: Record<string, unknown> = {
        playerId: selectedPlayerId,
        disciplineId: selectedDisciplineId,
        tier,
        elo: parseInt(elo, 10),
        notes,
        region,
        position,
      };
      if (ratings) {
        body.puckHandling = ratings.puckHandling;
        body.scoring = ratings.scoring;
        body.defense = ratings.defense;
        body.passing = ratings.passing;
        body.saves = ratings.saves;
        body.positioning = ratings.positioning;
        body.rebound = ratings.rebound;
        body.goalieDefense = ratings.goalieDefense;
      }
      const res = await fetch("/api/tryouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMessage("Tryout submitted successfully!");
        setSelectedPlayerId("");
        setPlayerSearch("");
        setSelectedDisciplineId("");
        setRegion("EU");
        setPosition("Field");
        setTier("Tier 1");
        setElo("1000");
        setNotes("");
        setRatings(null);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || "Failed to submit tryout.");
      }
    } catch (err) {
      console.error("Failed to submit tryout:", err);
      setMessage("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // ─── Loading / Auth states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null; // redirecting

  if (pending && !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">Pending Approval</h1>
          <p className="text-gray-400 mb-6">
            Your tester account is pending admin approval. Please wait until an admin approves your account.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-[#1e293b] rounded-xl font-semibold text-gray-300 hover:text-white w-full"
          >
            Log Out
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tester Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user.displayName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#1e293b] text-gray-400 rounded-xl text-sm hover:text-white transition-colors"
          >
            Log Out
          </button>
        </div>
      </motion.div>

      {/* Form */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Submit a Tryout Rating</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Search */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-1">Player</label>
            <input
              type="text"
              value={
                selectedPlayerId && players.find((p) => p.id === selectedPlayerId)
                  ? `${players.find((p) => p.id === selectedPlayerId)!.displayName} (${players.find((p) => p.id === selectedPlayerId)!.username})`
                  : playerSearch
              }
              onChange={(e) => {
                setPlayerSearch(e.target.value);
                setSelectedPlayerId("");
                setShowPlayerDropdown(true);
              }}
              onFocus={() => setShowPlayerDropdown(true)}
              onBlur={() => setTimeout(() => setShowPlayerDropdown(false), 200)}
              placeholder="Search players or paste Roblox ID..."
              className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <AnimatePresence>
              {showPlayerDropdown && !selectedPlayerId && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-20 w-full mt-1 bg-[#111827] border border-[#1e293b] rounded-xl shadow-xl max-h-48 overflow-y-auto"
                >
                  {filteredPlayers.slice(0, 20).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/[0.05] text-left"
                      onMouseDown={() => {
                        setSelectedPlayerId(p.id);
                        setPlayerSearch("");
                        setShowPlayerDropdown(false);
                      }}
                    >
                      <PlayerAvatar robloxId={p.robloxId} size={32} />
                      <div>
                        <span className="text-white text-sm font-medium">{p.displayName}</span>
                        <span className="text-gray-500 text-xs ml-2">@{p.username}</span>
                      </div>
                    </button>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <div className="px-4 py-3 text-gray-500 text-sm">No players found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Discipline */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">Discipline</label>
              <select
                value={selectedDisciplineId}
                onChange={(e) => setSelectedDisciplineId(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                required
              >
                <option value="" className="bg-[#111827]">Select discipline</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#111827]">
                    {d.icon} {d.displayName || d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="EU" className="bg-[#111827]">EU</option>
                <option value="NA" className="bg-[#111827]">NA</option>
                <option value="SA" className="bg-[#111827]">SA</option>
                <option value="AF" className="bg-[#111827]">AF</option>
                <option value="ASIA" className="bg-[#111827]">ASIA</option>
                <option value="AU" className="bg-[#111827]">AU</option>
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="Field" className="bg-[#111827]">🏒 Field</option>
                <option value="GK" className="bg-[#111827]">🧤 Goalie</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ELO (auto-sets tier) */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">ELO (auto-sets tier)</label>
              <input
                type="number"
                value={elo}
                onChange={(e) => {
                  setElo(e.target.value);
                  const v = parseInt(e.target.value, 10);
                  if (v >= 900) setTier("Tier 1");
                  else if (v >= 750) setTier("Tier 2");
                  else if (v >= 600) setTier("Tier 3");
                  else if (v >= 450) setTier("Tier 4");
                  else if (v >= 300) setTier("Tier 5");
                  else setTier("Unranked");
                }}
                className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tier (auto-set, can override) */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">Tier (auto-set)</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-[#111827]">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* ELO Calculator */}
          <EloCalculator
            onSubmit={(result) => {
              const r = result.ratings as unknown as Record<string, number | undefined>;
              setRatings({
                puckHandling: r.puckHandling ?? null,
                scoring: r.scoring ?? null,
                defense: r.defense ?? null,
                passing: r.passing ?? null,
                saves: r.saves ?? null,
                positioning: r.positioning ?? null,
                rebound: r.rebound ?? null,
                goalieDefense: r.goalieDefense ?? null,
              });
              setElo(String(result.average));
              if (result.average >= 900) setTier("Tier 1");
              else if (result.average >= 750) setTier("Tier 2");
              else if (result.average >= 600) setTier("Tier 3");
              else if (result.average >= 450) setTier("Tier 4");
              else if (result.average >= 300) setTier("Tier 5");
              else setTier("Unranked");
            }}
          />

          {message && (
            <p className={`text-sm ${message.includes("success") ? "text-green-400" : "text-red-400"}`}>
              {message}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </motion.button>
        </form>
      </div>

      {/* Tryout History */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-[#1e293b]">
          <h3 className="text-white font-semibold">Your Tryout Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Player</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Discipline</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Tier</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">ELO</th>
              </tr>
            </thead>
            <tbody>
              {tryouts.map((t) => (
                <tr key={t.id} className="border-b border-[#1e293b] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar robloxId={t.player.robloxId} size={32} />
                      <span className="text-white font-medium text-sm">{t.player.displayName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1e293b] rounded-md text-sm text-gray-300">
                      {t.discipline.icon} {t.discipline.displayName || t.discipline.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-sm border ${
                      t.tier === "Tier 1" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      t.tier === "Tier 2" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                      t.tier === "Tier 3" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      t.tier === "Tier 4" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      t.tier === "Tier 5" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                      "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }`}>
                      {t.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-mono">{t.elo}</td>
                </tr>
              ))}
              {tryouts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No tryouts submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
