"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import PlayerAvatar from "@/components/PlayerAvatar";

// Types
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
  player: Player;
  discipline: Discipline;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  "Tier 1": "#fbbf24",
  "Tier 2": "#3b82f6",
  "Tier 3": "#10b981",
  "Tier 4": "#f59e0b",
  "Tier 5": "#6b7280",
  Unranked: "#4b5563",
};

function getTierColor(tier: string): string {
  return TIER_COLORS[tier] || "#6b7280";
}

// ─── Ice Particles ───────────────────────────────────────────────────────

function IceParticle({ index }: { index: number }) {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 5;
  const randomDuration = 5 + Math.random() * 10;
  const randomSize = 2 + Math.random() * 4;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${randomX}%`,
        width: randomSize,
        height: randomSize,
        background: `rgba(255, 255, 255, ${0.2 + Math.random() * 0.5})`,
      }}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: "100vh", opacity: [0, 0.8, 0] }}
      transition={{ duration: randomDuration, repeat: Infinity, delay: randomDelay, ease: "linear" }}
    />
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────

function HeroSection({ playerCount, tryoutCount }: { playerCount: number; tryoutCount: number }) {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Season badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-gray-300">Beta is Now Live</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight"
      >
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          PuckTiers
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-6 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light"
      >
        The Official Ranking System
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-3 text-base text-gray-500 max-w-xl mx-auto"
      >
        Track your ELO, climb the tiers, and prove you&apos;re the best on the ice.
      </motion.p>

      {/* Stats pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex gap-3 mt-8 flex-wrap justify-center"
      >
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
          <span className="text-blue-400 font-bold">{playerCount}</span>
          <span className="text-gray-400 ml-2">Players</span>
        </div>
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
          <span className="text-cyan-400 font-bold">{tryoutCount}</span>
          <span className="text-gray-400 ml-2">Tryouts</span>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 mt-10"
      >
        <Link href="/rankings">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
          >
            View Rankings
          </motion.button>
        </Link>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-500/30 rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Disciplines Showcase ────────────────────────────────────────────────

function DisciplinesShowcase({ disciplines }: { disciplines: Discipline[] }) {
  return (
    <section className="relative z-10 px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Active Disciplines
            </span>
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Rankings across multiple Ro-Hockey Games
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {disciplines
            .filter((d) => d.active)
            .sort((a, b) => a.order - b.order)
            .map((disc, i) => (
              <motion.div
                key={disc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/5"
              >
                <div className="text-4xl mb-3">{disc.icon || "🏒"}</div>
                <h3 className="text-lg font-bold text-white">{disc.displayName || disc.name}</h3>
                {disc.description && (
                  <p className="mt-1 text-xs text-gray-500">{disc.description}</p>
                )}
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}

// ─── Top Players Section ─────────────────────────────────────────────────

function TopPlayersShowcase({ tryouts }: { tryouts: Tryout[] }) {
  const topPlayers = useMemo(() => {
    // Get unique players sorted by highest ELO across all disciplines
    const playerMap = new Map<
      string,
      { player: Player; maxElo: number; bestTier: string; disciplines: string[] }
    >();

    tryouts.forEach((t) => {
      const existing = playerMap.get(t.player.id);
      const discName = t.discipline.displayName || t.discipline.name;
      if (!existing) {
        playerMap.set(t.player.id, {
          player: t.player,
          maxElo: t.elo,
          bestTier: t.tier,
          disciplines: [discName],
        });
      } else if (t.elo > existing.maxElo) {
        existing.maxElo = t.elo;
        existing.bestTier = t.tier;
        existing.disciplines.push(discName);
      }
    });

    return Array.from(playerMap.values())
      .sort((a, b) => b.maxElo - a.maxElo)
      .slice(0, 5);
  }, [tryouts]);

  if (topPlayers.length === 0) return null;

  return (
    <section className="relative z-10 px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Top Rated Players
            </span>
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            The highest ELO players across all disciplines
          </p>
        </motion.div>

        <div className="space-y-3">
          {topPlayers.map((entry, i) => {
            const tierColor = getTierColor(entry.bestTier);
            return (
              <motion.div
                key={entry.player.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.01, x: 4 }}
              >
                <Link href={`/players/${entry.player.id}`}>
                  <motion.div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm cursor-pointer">
                    {/* Rank badge */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                        i === 0
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
                          : i === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black"
                            : i === 2
                              ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                              : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </div>

                    {/* Avatar */}
                    <PlayerAvatar robloxId={entry.player.robloxId} size={44} />

                    {/* Name & disciplines */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{entry.player.displayName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {entry.disciplines.slice(0, 2).join(", ")}
                        {entry.disciplines.length > 2 && ` +${entry.disciplines.length - 2}`}
                      </p>
                    </div>

                    {/* Tier & ELO */}
                    <div className="text-right">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1"
                        style={{
                          backgroundColor: `${tierColor}20`,
                          color: tierColor,
                          border: `1px solid ${tierColor}40`,
                        }}
                      >
                        {entry.bestTier}
                      </span>
                      <p className="text-sm font-mono text-blue-400">{entry.maxElo} ELO</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-8"
        >
          <Link href="/rankings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 text-sm font-medium text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/10 transition-all duration-300"
            >
              View Full Rankings
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="relative z-10 px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-2xl pointer-events-none" />

          <div className="relative p-10 md:p-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Hit the{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Ice?</span>
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Admins can add players and manage tryout ratings through the dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rankings">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                >
                  View Rankings
                </motion.button>
              </Link>
              <Link href="/admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-gray-300 font-semibold rounded-xl hover:text-white hover:border-blue-500/30 transition-all duration-300"
                >
                  Admin Dashboard
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────

export default function Home() {
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
        console.error("Failed to fetch home data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const uniquePlayers = new Set(tryouts.map((t) => t.playerId)).size;

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Ice particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <IceParticle key={i} index={i} />
        ))}
      </div>

      {/* Radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Sections */}
      <HeroSection playerCount={uniquePlayers} tryoutCount={tryouts.length} />
      <DisciplinesShowcase disciplines={disciplines} />
      <TopPlayersShowcase tryouts={tryouts} />
      <CTASection />

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  );
}
