"use client";

import { motion } from "framer-motion";

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

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const SECTIONS = [
  {
    number: "1",
    title: "Information We Collect",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    content: "When you log in to PuckTiers using your Roblox account, we collect:",
    list: [
      "Your Roblox User ID",
      "Your Roblox username and display name",
      "Your avatar information",
      "Match history and ranking data you submit to the platform",
    ],
    note: "We do not collect your Roblox password, payment information, or any data beyond what is necessary for the functionality of this service.",
  },
  {
    number: "2",
    title: "How We Use Your Information",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    content: "We use the collected information to:",
    list: [
      "Authenticate your identity via Roblox OAuth",
      "Display your player profile and ranking on the tier list",
      "Track match history and ranking changes",
      "Provide administrative features for ranked players and moderators",
    ],
  },
  {
    number: "3",
    title: "Data Storage and Security",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    content:
      "All data is stored securely. We implement standard security practices to protect your information. We do not sell, trade, or share your personal data with any third parties.",
  },
  {
    number: "4",
    title: "Roblox OAuth Authentication",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    content:
      "We use Roblox's official OAuth 2.0 system for authentication. We never store your Roblox credentials. We only receive basic profile information that you authorize us to access through the Roblox OAuth flow.",
  },
  {
    number: "5",
    title: "Data Retention",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    content:
      "Your player data and ranking history are retained for as long as the service is active. If you wish to have your data removed, please contact us through the Roblox group or our official communication channels.",
  },
  {
    number: "6",
    title: "Changes to This Policy",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    content:
      "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.",
  },
  {
    number: "7",
    title: "Contact",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    content:
      "If you have questions about this Privacy Policy, please reach out through our official Roblox group or Discord server.",
  },
];

export default function PrivacyPage() {
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
        {/* Hero Header */}
        <AnimatedSection className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)]/80 border border-[var(--card-border)] backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm text-[var(--foreground)]/70">Legal</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-[var(--foreground)]/50 max-w-2xl mx-auto"
          >
            Last updated: April 6, 2026
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-3 text-base text-[var(--foreground)]/40 max-w-xl mx-auto"
          >
            Your privacy matters to us. Here&apos;s exactly what we collect, how we use it, and how we protect it.
          </motion.p>
        </AnimatedSection>

        {/* Policy Sections */}
        <div className="max-w-3xl mx-auto space-y-6 mb-20">
          {SECTIONS.map((section, i) => (
            <AnimatedSection key={section.number} delay={0.1 * i}>
              <motion.div
                whileHover={{ y: -2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-[var(--card)]/60 border border-[var(--card-border)] rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:border-[var(--primary)]/30 transition-all duration-300">
                  {/* Section header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-[var(--card-border)] flex items-center justify-center text-[var(--accent)]">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-mono text-[var(--accent)]/60 uppercase tracking-wider">
                        Section {section.number}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">{section.title}</h2>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-[var(--foreground)]/70 leading-relaxed mb-4">{section.content}</p>

                  {/* List items */}
                  {section.list && (
                    <ul className="space-y-2 mb-4">
                      {section.list.map((item, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * j + 0.2, duration: 0.3 }}
                          className="flex items-start gap-3 text-[var(--foreground)]/70"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  )}

                  {/* Note callout */}
                  {section.note && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="mt-4 p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20"
                    >
                      <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">{section.note}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Disclaimer */}
        <AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <div className="text-center p-6 bg-[var(--card)]/30 border border-[var(--card-border)]/50 rounded-xl">
              <p className="text-[var(--foreground)]/40 text-sm">
                This service is not affiliated with or endorsed by Roblox Corporation. Roblox is a registered trademark of Roblox Corporation.
              </p>
            </div>
          </div>
        </AnimatedSection>

        <div className="h-20" />
      </div>
    </div>
  );
}
