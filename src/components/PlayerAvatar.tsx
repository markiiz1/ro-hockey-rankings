"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_SIZE = 40;

interface PlayerAvatarProps {
  robloxId: string;
  size?: number;
  className?: string;
}

export default function PlayerAvatar({ robloxId, size = DEFAULT_SIZE, className = "" }: PlayerAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAvatar = useCallback(async () => {
    if (!robloxId || !/^\d+$/.test(robloxId)) {
      setError(true);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(false);

    try {
      // Use roproxy (CORS-enabled Roblox thumbnails proxy)
      const res = await fetch(
        `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png&isCircular=false`,
        { signal: controller.signal }
      );
      if (res.ok) {
        const data = await res.json();
        const url = data.data?.[0]?.imageUrl ?? null;
        if (url && url.startsWith("https://")) {
          setImageUrl(url);
          setLoading(false);
          return;
        }
      }
      setError(true);
      setLoading(false);
    } catch (e) {
      // Ignore abort errors
      if (controller.signal.aborted) return;
      setError(true);
      setLoading(false);
    }
  }, [robloxId]);

  useEffect(() => {
    fetchAvatar();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchAvatar]);

  const initials = robloxId ? robloxId.slice(0, 2).toUpperCase() : "?";

  if (loading) {
    return (
      <div
        className={`rounded-full bg-gray-800 animate-pulse shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
    );
  }

  if (error || !imageUrl) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold select-none shrink-0 ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size, fontSize: size * 0.35 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`group relative shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <img
        src={imageUrl}
        alt="Player avatar"
        className="rounded-full w-full h-full object-cover transition-all duration-200 group-hover:ring-2 group-hover:ring-blue-400/50 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.4)]"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        onError={() => {
          setError(true);
          setImageUrl(null);
        }}
      />
    </div>
  );
}
