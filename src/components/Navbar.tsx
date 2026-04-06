"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Rankings", path: "/rankings" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
            >
              🏒 PuckTiers
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.path
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
            <Link href="/admin">
              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Admin
              </motion.button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0a0e1a]/95 backdrop-blur-md border-t border-[#1e293b] px-4 py-4"
        >
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}>
              <div
                className={`px-4 py-3 rounded-lg ${
                  pathname === item.path
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-300"
                }`}
              >
                {item.name}
              </div>
            </Link>
          ))}
          <Link href="/admin" onClick={() => setMobileOpen(false)}>
            <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white text-center mt-2">
              Admin
            </div>
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
