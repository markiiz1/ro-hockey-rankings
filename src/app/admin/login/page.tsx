"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  invalid_state: "Login verification failed. Please try again.",
  no_code: "Login was not completed. Please try again.",
  token_error: "Failed to get access token from Roblox. Please try again.",
  user_info_error: "Failed to get your Roblox info. Please try again.",
  not_admin: "Your Roblox account is not authorized as admin.",
  default: "Login failed. Please try again.",
};

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error && errorMessages[error]) {
      setErrorMessage(errorMessages[error]);
      setShowError(true);
    } else if (error) {
      setErrorMessage(errorMessages.default);
      setShowError(true);
    }
  }, [error]);

  const handleRetry = () => {
    setShowError(false);
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 max-w-md w-full text-center glow-blue"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-6xl mb-6"
        >
          🔐
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-3"
        >
          Admin Login Required
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-8"
        >
          You must be logged in with an admin Roblox account to access this area.
        </motion.p>

        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6"
          >
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {showError ? "Try Again" : "Login with Roblox"}
          </button>

          {showError && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => setShowError(false)}
              className="px-4 py-2 bg-[#1e293b] rounded-xl text-gray-400 text-sm w-full hover:text-white transition-colors cursor-pointer"
            >
              Dismiss
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            &larr; Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-2xl font-bold text-white mb-3">Loading...</h1>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
