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
    title: "Acceptance of Terms",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    content:
      'By accessing or using PuckTiers ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.',
  },
  {
    number: "2",
    title: "Description of Service",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    content:
      "PuckTiers is a community-driven competitive ranking platform for Roblox Hockey players. The Service allows players to view tier rankings, track match history, and manage their competitive profile.",
  },
  {
    number: "3",
    title: "Eligibility",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    content:
      "You must have a valid Roblox account to use this Service. By logging in, you confirm that you are at least 13 years of age or have parental consent to use the platform.",
  },
  {
    number: "4",
    title: "User Conduct",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    content: "When using the Service, you agree not to:",
    list: [
      "Submit false or manipulated match results",
      "Impersonate other players",
      "Harass, threaten, or abuse other users or administrators",
      "Attempt to exploit, hack, or disrupt the Service",
      "Use automated bots or scripts to interact with the Service without permission",
    ],
  },
  {
    number: "5",
    title: "Ranking System",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    content:
      "Tier placements and rankings are determined by the administration team based on submitted match evidence and performance. The admin team reserves the right to adjust rankings as necessary. All ranking decisions are final but can be appealed through official channels.",
  },
  {
    number: "6",
    title: "Account Responsibilities",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    content:
      "You are responsible for maintaining the security of your Roblox account. We are not responsible for any unauthorized access to your account through no fault of our own.",
  },
  {
    number: "7",
    title: "Content Ownership",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    content:
      "Match data, rankings, and statistics submitted to the Service may be displayed publicly. We reserve the right to moderate, edit, or remove any content that violates these Terms.",
  },
  {
    number: "8",
    title: "Termination",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    content:
      "We reserve the right to suspend or terminate access to the Service for any user who violates these Terms.",
  },
  {
    number: "9",
    title: "Limitation of Liability",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    content:
      'PuckTiers is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of this Service.',
  },
  {
    number: "10",
    title: "Changes to Terms",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    content:
      "We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.",
  },
  {
    number: "11",
    title: "Contact",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    content:
      "For questions or appeals regarding these Terms, contact us through our official Roblox group or Discord server.",
  },
];

export default function TermsPage() {
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
              Terms of Service
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
            Please read these terms carefully before using PuckTiers. By using the Service, you agree to these terms.
          </motion.p>
        </AnimatedSection>

        {/* Terms Sections */}
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
                    <ul className="space-y-2">
                      {section.list.map((item, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * j + 0.2, duration: 0.3 }}
                          className="flex items-start gap-3 text-[var(--foreground)]/70"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--warning)] flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
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
