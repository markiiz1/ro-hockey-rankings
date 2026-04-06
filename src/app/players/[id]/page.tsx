"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PlayerAvatar from "@/components/PlayerAvatar";

// Types
interface Discipline {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
}

interface Tryout {
  id: string;
  discipline: Discipline;
  tier: string;
  tierLabel: string;
  elo: number;
  notes: string;
  date: string;
}

interface Player {
  id: string;
  robloxId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  tryouts: Tryout[];
}

// Tier badge styling
const TIER_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  "Tier 1": {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.5)",
    text: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.3)",
  },
  "Tier 2": {
    bg: "rgba(168, 85, 247, 0.15)",
    border: "rgba(168, 85, 247, 0.5)",
    text: "#a855f7",
    glow: "rgba(168, 85, 247, 0.3)",
  },
  "Tier 3": {
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.5)",
    text: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.3)",
  },
  "Tier 4": {
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.5)",
    text: "#10b981",
    glow: "rgba(16, 185, 129, 0.3)",
  },
  "Tier 5": {
    bg: "rgba(107, 114, 128, 0.15)",
    border: "rgba(107, 114, 128, 0.5)",
    text: "#6b7280",
    glow: "rgba(107, 114, 128, 0.3)",
  },
  Unranked: {
    bg: "rgba(75, 85, 99, 0.15)",
    border: "rgba(75, 85, 99, 0.4)",
    text: "#9ca3af",
    glow: "rgba(75, 85, 99, 0.2)",
  },
};

function getTierStyle(tier: string) {
  return TIER_STYLES[tier] || TIER_STYLES["Unranked"];
}

// Ice Particle component
function IceParticle({ index }: { index: number }) {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 5;
  const randomDuration = 5 + Math.random() * 10;
  const randomSize = 2 + Math.random() * 4;

  return (
    <motion.div
      className="ice-particle"
      style={{
        left: `${randomX}%`,
        width: randomSize,
        height: randomSize,
        background: `rgba(255, 255, 255, ${0.2 + Math.random() * 0.5})`,
      }}
      initial={{ y: -10, opacity: 0 }}
      animate={{
        y: "100vh",
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: "linear",
      }}
    />
  );
}

// Mock data for development
const MOCK_PLAYER: Player = {
  id: "1",
  robloxId: "3569563947",
  username: "xXSlapShotKingXx",
  displayName: "SlapShot King",
  avatarUrl: null,
  tryouts: [
    {
      id: "t1",
      discipline: { id: "d1", name: "HM", displayName: "Hockey Manager", description: "", icon: "HM" },
      tier: "Tier 1",
      tierLabel: "Elite",
      elo: 2847,
      notes: "Exceptional game sense and leadership.",
      date: "2026-04-05T10:00:00Z",
    },
    {
      id: "t2",
      discipline: { id: "d2", name: "EKHL", displayName: "Eastern KHL", description: "", icon: "EKHL" },
      tier: "Tier 2",
      tierLabel: "Advanced",
      elo: 2450,
      notes: "",
      date: "2026-04-03T14:00:00Z",
    },
    {
      id: "t3",
      discipline: { id: "d3", name: "CBH", displayName: "College Beer Hockey", description: "", icon: "CBH" },
      tier: "Tier 3",
      tierLabel: "Intermediate",
      elo: 1980,
      notes: "Still improving positioning.",
      date: "2026-04-01T09:00:00Z",
    },
    {
      id: "t4",
      discipline: { id: "d4", name: "RHV4", displayName: "Rivals Hockey V4", description: "", icon: "RHV4" },
      tier: "Tier 1",
      tierLabel: "Elite",
      elo: 2720,
      notes: "",
      date: "2026-03-28T16:00:00Z",
    },
    {
      id: "t5",
      discipline: { id: "d5", name: "BMHL", displayName: "Beer Mile Hockey League", description: "", icon: "BMHL" },
      tier: "Unranked",
      tierLabel: "Unranked",
      elo: 1000,
      notes: "Pending evaluation.",
      date: "2026-03-25T11:00:00Z",
    },
  ],
};

const MOCK_PLAYER_NO_TRYOUTS: Player = {
  id: "2",
  robloxId: "1234567890",
  username: "NewPlayer123",
  displayName: "New Player",
  avatarUrl: null,
  tryouts: [],
};

// Tier badge component
function TierBadge({ tier, tierLabel }: { tier: string; tierLabel: string }) {
  const style = getTierStyle(tier);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        boxShadow: `0 0 8px ${style.glow}`,
      }}
    >
      {tier !== "Unranked" && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: style.text }}
        />
      )}
      {tierLabel}
    </span>
  );
}

// Discipline card component
function DisciplineCard({ tryout, index }: { tryout: Tryout; index: number }) {
  const tierStyle = getTierStyle(tryout.tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-[var(--card)]/50 border border-[var(--card-border)] rounded-xl p-5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-[var(--primary)]/30"
    >
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, ${tierStyle.glow}, transparent 70%)` }}
      />

      <div className="relative z-10">
        {/* Discipline header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: tierStyle.bg,
                color: tierStyle.text,
                border: `1px solid ${tierStyle.border}`,
              }}
            >
              {tryout.discipline.icon || tryout.discipline.name}
            </div>
            <div>
              <h3 className="font-bold text-[var(--foreground)] text-lg">
                {tryout.discipline.displayName || tryout.discipline.name}
              </h3>
              <p className="text-xs text-[var(--foreground)]/40">{tryout.discipline.name}</p>
            </div>
          </div>
        </div>

        {/* Tier and ELO */}
        <div className="flex items-center justify-between">
          <TierBadge tier={tryout.tier} tierLabel={tryout.tierLabel} />
          <div className="text-right">
            <p className="text-2xl font-mono font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {tryout.elo}
            </p>
            <p className="text-xs text-[var(--foreground)]/40 uppercase tracking-wider">ELO</p>
          </div>
        </div>

        {/* Notes */}
        {tryout.notes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 + index * 0.08 }}
            className="mt-4 pt-3 border-t border-[var(--card-border)]/50"
          >
            <p className="text-sm text-[var(--foreground)]/60 italic">
              &quot;{tryout.notes}&quot;
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-[var(--card)] rounded-lg mb-8" />
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
          <div className="w-32 h-32 rounded-full bg-[var(--card)]" />
          <div className="flex-1 space-y-4 w-full">
            <div className="h-10 w-64 bg-[var(--card)] rounded-lg" />
            <div className="h-6 w-40 bg-[var(--card)] rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-[var(--card)] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Not yet rated placeholder
function NoTryoutsMessage({ playerName }: { playerName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-[var(--card)]/60 border border-[var(--card-border)] flex items-center justify-center mb-6"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-[var(--foreground)]/30"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </motion.div>
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Not Yet Rated</h3>
      <p className="text-[var(--foreground)]/50 max-w-sm">
        {playerName} hasn&apos;t completed any tryouts yet. Check back later for their discipline ratings.
      </p>
    </motion.div>
  );
}

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const res = await fetch(`/api/players/${playerId}`);
        if (res.ok) {
          const data = await res.json();
          setPlayer(data);
        } else if (res.status === 404) {
          setNotFound(true);
        } else {
          // Fallback to mock data
          if (playerId === "2") {
            setPlayer(MOCK_PLAYER_NO_TRYOUTS);
          } else {
            const mock = MOCK_PLAYER;
            if (mock) setPlayer(mock);
            else setNotFound(true);
          }
        }
      } catch {
        // Fallback to mock data if API is unavailable
        if (playerId === "2") {
          setPlayer(MOCK_PLAYER_NO_TRYOUTS);
        } else {
          setPlayer({ ...MOCK_PLAYER, robloxId: playerId });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen animated-bg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <IceParticle key={i} index={i} />
          ))}
        </div>
        <div className="relative z-10 px-4 py-24 md:py-32">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (notFound || !player) {
    return (
      <div className="min-h-screen animated-bg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <IceParticle key={i} index={i} />
          ))}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-8xl md:text-9xl font-black bg-gradient-to-r from-blue-400/30 to-cyan-400/30 bg-clip-text text-transparent mb-6"
            >
              404
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-4"
            >
              Player Not Found
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-[var(--foreground)]/50 max-w-md mb-8"
            >
              The player you&apos;re looking for doesn&apos;t exist or has been removed from the rankings.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link href="/rankings">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow duration-300"
                >
                  Back to Rankings
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      {/* Ice particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <IceParticle key={i} index={i} />
        ))}
      </div>

      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Link href="/rankings">
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card)]/60 border border-[var(--card-border)] rounded-xl text-[var(--foreground)]/70 hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all duration-300 text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Rankings
              </motion.button>
            </Link>
          </motion.div>

          {/* Player header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12"
          >
            {/* Avatar with glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              {/* Outer glow ring */}
              <div
                className="absolute -inset-3 rounded-full blur-xl opacity-30"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
              />
              {/* Inner glow ring */}
              <div
                className="absolute -inset-1 rounded-full blur-md opacity-50"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
              />
              <div className="relative">
                <PlayerAvatar robloxId={player.robloxId} size={128} />
              </div>
            </motion.div>

            {/* Player info */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2"
              >
                {player.displayName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-[var(--foreground)]/50"
              >
                @{player.username}
              </motion.p>
              
              {/* Roblox Profile Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mt-3"
              >
                <a
                  href={`https://www.roblox.com/users/${player.robloxId}/profile`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-[#1e293b] rounded-xl text-sm text-gray-300 hover:text-white hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.636 21h12.728L6.292 3H19V1h1v5h-1V4.414L7.344 21H5.636V19h1v2zm4.243-3l8.485-12H6.344L14.83 18H9.879z"/>
                  </svg>
                  View Roblox Profile
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              </motion.div>
              
              {player.tryouts.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-sm text-[var(--foreground)]/40 mt-3"
                >
                  Rated in {player.tryouts.length} discipline{player.tryouts.length !== 1 ? "s" : ""}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Discipline cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Discipline Ratings
              </span>
            </h2>

            {player.tryouts.length === 0 ? (
              <NoTryoutsMessage playerName={player.displayName} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {player.tryouts.map((tryout, i) => (
                  <DisciplineCard key={tryout.id} tryout={tryout} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
}
