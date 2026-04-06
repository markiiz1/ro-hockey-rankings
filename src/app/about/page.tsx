"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function StepCard({
  step,
  icon,
  title,
  description,
  index,
}: {
  step: number;
  icon: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex gap-5 items-start"
    >
      {/* Connector line */}
      {index < 3 && (
        <div className="absolute left-8 top-16 w-0.5 h-12 bg-gradient-to-b from-blue-500/30 to-transparent hidden md:block" />
      )}

      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
          {icon}
        </div>
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0a0e1a] border border-blue-500/50 flex items-center justify-center text-[10px] font-bold text-blue-400">
          {step}
        </span>
      </div>

      <div className="pt-3">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed max-w-md">{description}</p>
      </div>
    </motion.div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
      <span className="text-2xl mb-3 block">{icon}</span>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="border-b border-[#1e293b]/50">
        <div className="max-w-5xl mx-auto px-4 py-10 pt-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              How Tryouts Work
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-lg mx-auto">
              Request a tryout on Discord, get evaluated by a tester, and find your fair ranking.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Steps */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-white mb-8"
          >
            The Process
          </motion.h2>

          <div className="space-y-8 relative">
            <StepCard
              step={1}
              icon="💬"
              title="Request a Tryout on Discord"
              description="Join our Discord server and post a tryout request in the designated channel. Include your Roblox username and which discipline you want to be evaluated in (e.g. HM, EKHL, etc.)."
              index={0}
            />
            <StepCard
              step={2}
              icon="📋"
              title="Get Matched with a Tester"
              description="Our team will assign a tester to evaluate you. If the assigned tester is rated significantly lower than your expected skill level, we'll try to match you with a player closer to your level so the evaluation is fair."
              index={1}
            />
            <StepCard
              step={3}
              icon="🏒"
              title="Play the Tryout"
              description="Meet up with your tester in-game and play the tryout match. The tester will evaluate your skills across multiple categories — puck handling, scoring, defense, passing, and for goalies: saves, positioning, rebound control, and puck handling."
              index={2}
            />
            <StepCard
              step={4}
              icon="👁️"
              title="Tester Overwatches & Submits"
              description="The tester overwatches your performance during the tryout and submits their ratings through the system. Your ELO score and tier placement are calculated based on their evaluation."
              index={3}
            />
            <StepCard
              step={5}
              icon="📊"
              title="See Your Ranking"
              description="Once submitted, your ranking appears on the Rankings page. Your tier reflects your evaluated skill level. Want to move up? Play more tryouts and show improvement."
              index={4}
            />
          </div>
        </section>

        {/* Key info cards */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-white mb-6"
          >
            Need to Know
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard
              icon="🎯"
              title="Fair Matchmaking"
              description="If your assigned tester is much lower rated than you, we'll match you with a player at your level so the evaluation is accurate. The tester will then overwatch that match."
            />
            <InfoCard
              icon="🧤"
              title="Goalie Ratings"
              description="Goalies are rated on a different scale: saves out of 10 shots, positioning, rebound control, and puck handling. The ELO calculator switches to goalie mode automatically."
            />
            <InfoCard
              icon="📈"
              title="Climbing Tiers"
              description="Want a higher tier? Request additional tryouts and show improved performance. Each new tryout can update your ranking. Consistency is key."
            />
          </div>
        </section>

        {/* Discord CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 text-center"
        >
          <span className="text-4xl mb-4 block">💬</span>
          <h3 className="text-xl font-bold text-white mb-2">Ready to Get Ranked?</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Join our Discord server and request your tryout. Our team will get you set up with a tester.
          </p>
          <a
            href="https://discord.gg/6z6eS87T3d"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] text-white rounded-xl font-semibold hover:bg-[#4752C4] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Join Discord
          </a>
        </motion.div>

        {/* Footer links */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
