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

interface Tester {
  id: string;
  robloxId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  approved: boolean;
  createdAt: string;
}

type Tab = "players" | "test" | "disciplines" | "testers";

const TIER_OPTIONS = ["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5", "Unranked"];

const TIER_COLORS: Record<string, string> = {
  "Tier 1": "bg-red-500/20 text-red-400 border-red-500/30",
  "Tier 2": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Tier 3": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Tier 4": "bg-green-500/20 text-green-400 border-green-500/30",
  "Tier 5": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Unranked: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

// ─── Main Admin Page ────────────────────────────────────────────────────────

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("players");

  // Shared data
  const [players, setPlayers] = useState<Player[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [testers, setTesters] = useState<Tester[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch {
      window.location.href = "/admin/login";
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    const [pRes, dRes, tRes, testersRes] = await Promise.all([
      fetch("/api/players"),
      fetch("/api/disciplines"),
      fetch("/api/tryouts"),
      fetch("/api/testers"),
    ]);
    if (pRes.ok) setPlayers(await pRes.json());
    if (dRes.ok) setDisciplines(await dRes.json());
    if (tRes.ok) setTryouts(await tRes.json());
    if (testersRes.ok) setTesters(await testersRes.json());
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

  if (!user.isAdmin) {
    if (user.role === "tester") {
      // Redirect testers to their own dashboard
      window.location.href = "/tester";
      return null;
    }
    // Not admin and not tester - redirect to login
    window.location.href = "/admin/login";
    return null;
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "players", label: "Players", icon: "👥" },
    { key: "test", label: "Test Player", icon: "🏒" },
    { key: "disciplines", label: "Disciplines", icon: "🎯" },
    { key: "testers", label: "Testers", icon: "🧪" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Welcome back, {user.displayName}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Players" value={players.length} icon="👥" delay={0.1} />
        <StatCard label="Total Tryouts" value={tryouts.length} icon="🏒" delay={0.2} />
        <StatCard label="Disciplines Active" value={disciplines.length} icon="🎯" delay={0.3} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-[#111827] text-gray-400 border border-[#1e293b] hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "players" && (
            <PlayersTab
              players={players}
              disciplines={disciplines}
              onRefresh={fetchData}
            />
          )}
          {activeTab === "test" && (
            <TestPlayerTab
              players={players}
              disciplines={disciplines}
              tryouts={tryouts}
              onRefresh={fetchData}
            />
          )}
          {activeTab === "disciplines" && (
            <DisciplinesTab
              disciplines={disciplines}
              tryouts={tryouts}
              onRefresh={fetchData}
            />
          )}
          {activeTab === "testers" && (
            <TestersTab
              testers={testers}
              onRefresh={fetchData}
              user={user}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, delay }: { label: string; value: number; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </motion.div>
  );
}

// ─── Players Tab ────────────────────────────────────────────────────────────

function PlayersTab({
  players,
  disciplines,
  onRefresh,
}: {
  players: Player[];
  disciplines: Discipline[];
  onRefresh: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [robloxId, setRobloxId] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!robloxId || !username || !displayName) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ robloxId, username, displayName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || `Failed (${res.status}). Are you logged in as admin?`);
        setSubmitting(false);
        return;
      }
      onRefresh();
      setShowModal(false);
      setRobloxId("");
      setUsername("");
      setDisplayName("");
    } catch (err) {
      console.error("Failed to add player:", err);
      setErrorMsg("Network error. Check console for details.");
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    try {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to delete player:", err);
    }
  };

  const getDisciplineCount = useCallback(
    (player: Player) => {
      if (!player.tryouts?.length) return 0;
      return new Set(player.tryouts.map((t) => t.discipline.name)).size;
    },
    []
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Players</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium text-sm hover:bg-blue-500/30"
        >
          + Add Player
        </motion.button>
      </div>

      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Avatar</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Username</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Disciplines</th>
                <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-[#1e293b] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <PlayerAvatar robloxId={player.robloxId} size={40} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/players/${player.id}`} className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
                      {player.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{player.username}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400">{getDisciplineCount(player)} rated</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(player.id)}
                      className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-500/30 rounded-lg hover:bg-red-500/10"
                    >
                      Delete
                    </motion.button>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No players yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Player Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Player</h2>
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Roblox ID</label>
                  <input
                    type="text"
                    value={robloxId}
                    onChange={(e) => setRobloxId(e.target.value)}
                    placeholder="e.g. 123456789"
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. PlayerOne"
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ice King"
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Player"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-[#1e293b] text-gray-300 rounded-xl font-semibold hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Test Player Tab (main feature) ────────────────────────────────────────

function TestPlayerTab({
  players,
  disciplines,
  tryouts,
  onRefresh,
}: {
  players: Player[];
  disciplines: Discipline[];
  tryouts: Tryout[];
  onRefresh: () => void;
}) {
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

  // Filter
  const [filterDiscipline, setFilterDiscipline] = useState("");

  const dropdownRef = useState<HTMLDivElement | null>(null);

  const filteredPlayers = playerSearch
    ? players.filter(
        (p) =>
          p.displayName.toLowerCase().includes(playerSearch.toLowerCase()) ||
          p.username.toLowerCase().includes(playerSearch.toLowerCase()) ||
          p.robloxId.includes(playerSearch)
      )
    : players;

  const filteredTryouts = filterDiscipline
    ? tryouts.filter((t) => t.disciplineId === filterDiscipline || t.discipline.name === filterDiscipline)
    : tryouts;

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
        onRefresh();
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

  const handleDeleteTryout = async (id: string) => {
    if (!confirm("Delete this tryout?")) return;
    try {
      const res = await fetch(`/api/tryouts?id=${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to delete tryout:", err);
    }
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Test Player - Rate a Player</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Search */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-1">Player</label>
            <input
              type="text"
              value={selectedPlayer ? `${selectedPlayer.displayName} (${selectedPlayer.username})` : playerSearch}
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
              {showPlayerDropdown && !selectedPlayer && (
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
            {/* ELO */}
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

            {/* Tier (auto-set, but can override) */}
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
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </motion.button>
        </form>
      </div>

      {/* Tryouts Table */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
          <h3 className="text-white font-semibold">Tryout History</h3>
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="bg-[#0a0e1a] border border-[#1e293b] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="" className="bg-[#111827]">All Disciplines</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#111827]">
                {d.icon} {d.displayName || d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Player</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Discipline</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Tier</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">ELO</th>
                <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTryouts.map((t) => (
                <tr key={t.id} className="border-b border-[#1e293b] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar robloxId={t.player.robloxId} size={32} />
                      <Link href={`/players/${t.player.id}`} className="text-blue-400 hover:text-blue-300 hover:underline font-medium text-sm">
                        {t.player.displayName}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1e293b] rounded-md text-sm text-gray-300">
                      {t.discipline.icon} {t.discipline.displayName || t.discipline.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-sm border ${TIER_COLORS[t.tier] || TIER_COLORS.Unranked}`}>
                      {t.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-mono">{t.elo}</td>
                  <td className="px-4 py-3 text-right">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteTryout(t.id)}
                      className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-500/30 rounded-lg hover:bg-red-500/10"
                    >
                      Delete
                    </motion.button>
                  </td>
                </tr>
              ))}
              {filteredTryouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No tryouts yet.
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

// ─── Disciplines Tab ────────────────────────────────────────────────────────

function DisciplinesTab({
  disciplines,
  tryouts,
  onRefresh,
}: {
  disciplines: Discipline[];
  tryouts: Tryout[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Discipline | null>(null);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setDisplayName("");
    setIcon("");
    setDescription("");
    setOrder("0");
    setShowForm(true);
  };

  const openEdit = (d: Discipline) => {
    setEditing(d);
    setName(d.name);
    setDisplayName(d.displayName);
    setIcon(d.icon);
    setDescription(d.description);
    setOrder(String(d.order));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const payload = { name, displayName, icon, description, order: parseInt(order, 10) || 0 };
      if (editing) {
        const res = await fetch("/api/disciplines", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        if (res.ok) onRefresh();
      } else {
        const res = await fetch("/api/disciplines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) onRefresh();
      }
    } catch (err) {
      console.error("Failed to save discipline:", err);
    } finally {
      setSubmitting(false);
      setShowForm(false);
      setEditing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this discipline?")) return;
    try {
      const res = await fetch(`/api/disciplines?id=${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to delete discipline:", err);
    }
  };

  const getPlayerCount = useCallback(
    (discId: string) => {
      return new Set(tryouts.filter((t) => t.disciplineId === discId).map((t) => t.playerId)).size;
    },
    [tryouts]
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Disciplines</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAdd}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium text-sm hover:bg-blue-500/30"
        >
          + Add Discipline
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplines.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{d.icon || "🎯"}</span>
                <div>
                  <h3 className="text-white font-semibold">{d.displayName || d.name}</h3>
                  <p className="text-gray-500 text-xs">{d.name}</p>
                </div>
              </div>
            </div>
            {d.description && <p className="text-gray-400 text-sm mb-3">{d.description}</p>}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">{getPlayerCount(d.id)} players</span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEdit(d)}
                  className="px-2 py-1 text-gray-400 hover:text-white text-xs border border-[#1e293b] rounded-lg hover:bg-[#1e293b]"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(d.id)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 text-xs border border-red-500/30 rounded-lg hover:bg-red-500/10"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {disciplines.length === 0 && (
        <div className="text-center py-12 text-gray-500">No disciplines yet.</div>
      )}

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {editing ? "Edit Discipline" : "Add Discipline"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Name (identifier)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. HM"
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Hockey Manager"
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. 🏒"
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editing ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-[#1e293b] text-gray-300 rounded-xl font-semibold hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Testers Tab ────────────────────────────────────────────────────────────

function TestersTab({
  testers,
  onRefresh,
  user,
}: {
  testers: Tester[];
  onRefresh: () => void;
  user: User;
}) {
  // Add tester state
  const [addRobloxId, setAddRobloxId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  // Add player state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerRobloxId, setPlayerRobloxId] = useState("");
  const [playerUsername, setPlayerUsername] = useState("");
  const [playerDisplayName, setPlayerDisplayName] = useState("");
  const [playerSubmitting, setPlayerSubmitting] = useState(false);
  const [playerMsg, setPlayerMsg] = useState("");

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testerId: id, action: "approve" }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to approve tester:", err);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this tester? This will not delete their tryout submissions.")) return;
    try {
      const res = await fetch("/api/testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testerId: id, action: "remove" }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to remove tester:", err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addRobloxId.trim()) return;
    setAdding(true);
    setAddMsg("");
    try {
      const res = await fetch("/api/testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ robloxId: addRobloxId.trim(), action: "add" }),
      });
      if (res.ok) {
        setAddMsg("Tester added successfully!");
        setAddRobloxId("");
        onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        setAddMsg(err.error || "Failed to add tester.");
      }
    } catch (err) {
      console.error("Failed to add tester:", err);
      setAddMsg("Network error. Check console for details.");
    } finally {
      setAdding(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerRobloxId.trim() || !playerUsername.trim() || !playerDisplayName.trim()) return;
    setPlayerSubmitting(true);
    setPlayerMsg("");
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          robloxId: playerRobloxId.trim(),
          username: playerUsername.trim(),
          displayName: playerDisplayName.trim(),
        }),
      });
      if (res.ok) {
        setPlayerMsg("Player added successfully!");
        setPlayerRobloxId("");
        setPlayerUsername("");
        setPlayerDisplayName("");
        onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        setPlayerMsg(err.error || "Failed to add player.");
      }
    } catch (err) {
      console.error("Failed to add player:", err);
      setPlayerMsg("Network error.");
    } finally {
      setPlayerSubmitting(false);
    }
  };

  const isOwner = user.role === "owner";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Testers</h2>
          <p className="text-gray-400 text-sm mt-1">
            Testers can log in with Roblox and submit tryout ratings. Approve them to allow submissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddPlayer(!showAddPlayer)}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium text-sm hover:bg-blue-500/30 transition-colors"
        >
          {showAddPlayer ? "Cancel" : "+ Add Player"}
        </button>
      </div>

      {/* Add Player Form */}
      {showAddPlayer && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-3">Add Player</h3>
          <form onSubmit={handleAddPlayer} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={playerRobloxId}
                onChange={(e) => setPlayerRobloxId(e.target.value)}
                placeholder="Roblox ID"
                className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="text"
                value={playerUsername}
                onChange={(e) => setPlayerUsername(e.target.value)}
                placeholder="Username"
                className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="text"
                value={playerDisplayName}
                onChange={(e) => setPlayerDisplayName(e.target.value)}
                placeholder="Display Name"
                className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={playerSubmitting}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                {playerSubmitting ? "Adding..." : "Add Player"}
              </button>
            </div>
            {playerMsg && (
              <p className={`text-sm ${playerMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
                {playerMsg}
              </p>
            )}
          </form>
        </div>
      )}

      {/* Owner-only: Add Tester by Roblox ID */}
      {isOwner && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-3">Add Tester</h3>
          <form onSubmit={handleAdd} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={addRobloxId}
                onChange={(e) => setAddRobloxId(e.target.value)}
                placeholder="Enter Roblox User ID (e.g. 123456789)"
                className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50 whitespace-nowrap"
            >
              {adding ? "Adding..." : "Add Tester"}
            </button>
          </form>
          {addMsg && (
            <p className={`text-sm mt-2 ${addMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
              {addMsg}
            </p>
          )}
        </div>
      )}

      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Username</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Joined</th>
                <th className="text-right px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testers.map((tester) => (
                <tr key={tester.id} className="border-b border-[#1e293b] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">{tester.displayName}</td>
                  <td className="px-4 py-3 text-gray-300">{tester.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs border ${
                        tester.approved
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }`}
                    >
                      {tester.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {new Date(tester.createdAt).toISOString().split('T')[0]}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {!tester.approved && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleApprove(tester.id)}
                          className="px-3 py-1 text-green-400 hover:text-green-300 text-sm border border-green-500/30 rounded-lg hover:bg-green-500/10"
                        >
                          Approve
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(tester.id)}
                        className="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-500/30 rounded-lg hover:bg-red-500/10"
                      >
                        Remove
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
              {testers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No testers yet.{isOwner ? " Add one above or share the login link." : " Share the login link so testers can register."}
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
