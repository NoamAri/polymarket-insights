import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Global in-memory cache shared across all hook instances
const logoCache: Record<string, string | null> = {};
const pendingNames = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

async function flushPending() {
  if (pendingNames.size === 0) return;
  const names = [...pendingNames];
  pendingNames.clear();

  // Filter out already cached
  const uncached = names.filter((n) => !(n in logoCache));
  if (uncached.length === 0) return;

  // Mark as loading (null = no logo found, undefined = not yet fetched)
  uncached.forEach((n) => {
    logoCache[n] = null;
  });

  try {
    // Try localStorage first
    const stored = localStorage.getItem("team-logos");
    const localCache: Record<string, string | null> = stored ? JSON.parse(stored) : {};

    const stillNeeded: string[] = [];
    for (const name of uncached) {
      if (name in localCache) {
        logoCache[name] = localCache[name];
      } else {
        stillNeeded.push(name);
      }
    }

    if (stillNeeded.length > 0) {
      const { data, error } = await supabase.functions.invoke("team-logo", {
        body: { names: stillNeeded },
      });

      if (!error && data?.logos) {
        for (const [name, url] of Object.entries(data.logos)) {
          logoCache[name] = url as string | null;
          localCache[name] = url as string | null;
        }
        // Persist to localStorage
        try {
          localStorage.setItem("team-logos", JSON.stringify(localCache));
        } catch {}
      }
    }

    notifyListeners();
  } catch (err) {
    console.error("useTeamLogos fetch error:", err);
  }
}

function requestLogos(names: string[]) {
  let hasNew = false;
  for (const name of names) {
    if (!(name in logoCache)) {
      pendingNames.add(name);
      hasNew = true;
    }
  }
  if (hasNew) {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushPending, 100); // debounce 100ms
  }
}

/**
 * Hook that returns a map of team name → logo URL.
 * Batches requests, caches in memory + localStorage.
 */
export function useTeamLogos(names: string[]): Record<string, string | null> {
  const [, forceUpdate] = useState(0);
  const namesRef = useRef(names);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    namesRef.current = names;
    if (names.length > 0) {
      requestLogos(names);
    }
  }, [names.join(",")]);

  const result: Record<string, string | null> = {};
  for (const name of names) {
    result[name] = logoCache[name] ?? null;
  }
  return result;
}

/**
 * Get a single cached logo URL (sync, for use outside React).
 */
export function getCachedLogo(name: string): string | null {
  return logoCache[name] ?? null;
}
