import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Known sports teams/entities for name extraction.
 * Maps lowercase canonical name → TheSportsDB search name (title case).
 */
const KNOWN_TEAMS: Record<string, string> = {
  // Soccer
  "manchester united": "Manchester United", "man united": "Manchester United", "man utd": "Manchester United",
  "manchester city": "Manchester City", "man city": "Manchester City",
  liverpool: "Liverpool", chelsea: "Chelsea", arsenal: "Arsenal",
  tottenham: "Tottenham", spurs: "Tottenham", "tottenham hotspur": "Tottenham",
  "west ham": "West Ham", newcastle: "Newcastle", "aston villa": "Aston Villa",
  brighton: "Brighton", wolverhampton: "Wolverhampton", wolves: "Wolverhampton",
  "crystal palace": "Crystal Palace", fulham: "Fulham", bournemouth: "Bournemouth",
  "nottingham forest": "Nottingham Forest", brentford: "Brentford", leicester: "Leicester",
  barcelona: "Barcelona", "real madrid": "Real Madrid", "atletico madrid": "Atletico Madrid",
  sevilla: "Sevilla", villarreal: "Villarreal", valencia: "Valencia",
  "bayern munich": "Bayern Munich", bayern: "Bayern Munich",
  "borussia dortmund": "Borussia Dortmund", dortmund: "Borussia Dortmund",
  "bayer leverkusen": "Bayer Leverkusen", leverkusen: "Bayer Leverkusen",
  "rb leipzig": "RB Leipzig", leipzig: "RB Leipzig",
  psg: "Paris Saint-Germain", "paris saint-germain": "Paris Saint-Germain",
  marseille: "Marseille", lyon: "Lyon", monaco: "Monaco",
  juventus: "Juventus", "ac milan": "AC Milan", "inter milan": "Inter Milan",
  napoli: "Napoli", roma: "Roma", lazio: "Lazio", atalanta: "Atalanta",
  ajax: "Ajax", psv: "PSV", feyenoord: "Feyenoord",
  benfica: "Benfica", porto: "Porto", "sporting cp": "Sporting CP",
  celtic: "Celtic", rangers: "Rangers",
  galatasaray: "Galatasaray", fenerbahce: "Fenerbahce", besiktas: "Besiktas",
  "al hilal": "Al Hilal", "al nassr": "Al Nassr",
  flamengo: "Flamengo", palmeiras: "Palmeiras",
  "boca juniors": "Boca Juniors", "river plate": "River Plate",
  // NBA
  lakers: "Los Angeles Lakers", celtics: "Boston Celtics", warriors: "Golden State Warriors",
  heat: "Miami Heat", bulls: "Chicago Bulls", knicks: "New York Knicks",
  nets: "Brooklyn Nets", "76ers": "Philadelphia 76ers", sixers: "Philadelphia 76ers",
  bucks: "Milwaukee Bucks", nuggets: "Denver Nuggets",
  mavericks: "Dallas Mavericks", mavs: "Dallas Mavericks",
  suns: "Phoenix Suns", clippers: "Los Angeles Clippers",
  raptors: "Toronto Raptors", hawks: "Atlanta Hawks",
  cavaliers: "Cleveland Cavaliers", cavs: "Cleveland Cavaliers",
  pacers: "Indiana Pacers", magic: "Orlando Magic",
  grizzlies: "Memphis Grizzlies", pelicans: "New Orleans Pelicans",
  thunder: "Oklahoma City Thunder", okc: "Oklahoma City Thunder",
  timberwolves: "Minnesota Timberwolves", kings: "Sacramento Kings",
  rockets: "Houston Rockets", pistons: "Detroit Pistons",
  // NFL
  chiefs: "Kansas City Chiefs", eagles: "Philadelphia Eagles",
  "49ers": "San Francisco 49ers", niners: "San Francisco 49ers",
  cowboys: "Dallas Cowboys", bills: "Buffalo Bills",
  ravens: "Baltimore Ravens", dolphins: "Miami Dolphins",
  jets: "New York Jets", patriots: "New England Patriots", pats: "New England Patriots",
  packers: "Green Bay Packers", bears: "Chicago Bears",
  lions: "Detroit Lions", vikings: "Minnesota Vikings",
  steelers: "Pittsburgh Steelers", bengals: "Cincinnati Bengals",
  browns: "Cleveland Browns", texans: "Houston Texans",
  colts: "Indianapolis Colts", jaguars: "Jacksonville Jaguars",
  titans: "Tennessee Titans", broncos: "Denver Broncos",
  chargers: "Los Angeles Chargers", raiders: "Las Vegas Raiders",
  seahawks: "Seattle Seahawks", rams: "Los Angeles Rams",
  commanders: "Washington Commanders", giants: "New York Giants",
  falcons: "Atlanta Falcons", panthers: "Carolina Panthers",
  saints: "New Orleans Saints", buccaneers: "Tampa Bay Buccaneers",
  // MLB
  yankees: "New York Yankees", dodgers: "Los Angeles Dodgers",
  "red sox": "Boston Red Sox", mets: "New York Mets",
  cubs: "Chicago Cubs", astros: "Houston Astros",
  braves: "Atlanta Braves", phillies: "Philadelphia Phillies", padres: "San Diego Padres",
  // NHL
  "maple leafs": "Toronto Maple Leafs", bruins: "Boston Bruins",
  penguins: "Pittsburgh Penguins", canadiens: "Montreal Canadiens",
  blackhawks: "Chicago Blackhawks", oilers: "Edmonton Oilers",
  avalanche: "Colorado Avalanche", lightning: "Tampa Bay Lightning",
  // F1
  "red bull": "Red Bull Racing", ferrari: "Ferrari", mercedes: "Mercedes",
  mclaren: "McLaren",
  // Soccer - additional full names that might appear
  "olympique lyonnais": "Lyon", "paris fc": "Paris FC",
  "rayo vallecano": "Rayo Vallecano", "sevilla fc": "Sevilla",
  // Esports / other
  "bilibili gaming": "Bilibili Gaming", "jd gaming": "JD Gaming",
};

// Sorted by key length descending for greedy matching
const SORTED_TEAMS = Object.entries(KNOWN_TEAMS).sort((a, b) => b[0].length - a[0].length);

/**
 * Extract a known team name from an outcome string.
 * E.g. "Will Arsenal win the 2025-26 EPL?" → "Arsenal"
 */
function extractTeamName(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, searchName] of SORTED_TEAMS) {
    if (key.length >= 3 && lower.includes(key)) {
      return searchName;
    }
  }
  return null;
}

// Global caches
const logoCache: Record<string, string | null> = {};
const pendingNames = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

// Load from localStorage on init
try {
  const stored = localStorage.getItem("team-logos-v2");
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.assign(logoCache, parsed);
  }
} catch {}

async function flushPending() {
  if (pendingNames.size === 0) return;
  const names = [...pendingNames];
  pendingNames.clear();

  const uncached = names.filter((n) => !(n in logoCache));
  if (uncached.length === 0) return;

  // Mark as loading
  uncached.forEach((n) => { logoCache[n] = null; });

  try {
    const { data, error } = await supabase.functions.invoke("team-logo", {
      body: { names: uncached },
    });

    if (!error && data?.logos) {
      for (const [name, url] of Object.entries(data.logos)) {
        logoCache[name] = url as string | null;
      }
      // Persist
      try {
        localStorage.setItem("team-logos-v2", JSON.stringify(logoCache));
      } catch {}
    }

    notifyListeners();
  } catch (err) {
    console.error("useTeamLogos fetch error:", err);
  }
}

function requestLogos(searchNames: string[]) {
  let hasNew = false;
  for (const name of searchNames) {
    if (!(name in logoCache)) {
      pendingNames.add(name);
      hasNew = true;
    }
  }
  if (hasNew) {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flushPending, 150);
  }
}

/**
 * Hook that returns a map of original outcome name → logo URL.
 * Extracts known team names from outcome strings before looking up.
 */
export function useTeamLogos(outcomeNames: string[]): Record<string, string | null> {
  const [, forceUpdate] = useState(0);

  // Build mapping: original name → search name
  const mappingRef = useRef<Record<string, string>>({});
  const mapping: Record<string, string> = {};
  const searchNames: string[] = [];

  for (const name of outcomeNames) {
    const team = extractTeamName(name);
    if (team) {
      mapping[name] = team;
      searchNames.push(team);
    }
  }
  mappingRef.current = mapping;

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  useEffect(() => {
    if (searchNames.length > 0) {
      requestLogos(searchNames);
    }
  }, [searchNames.join(",")]);

  const result: Record<string, string | null> = {};
  for (const name of outcomeNames) {
    const searchName = mapping[name];
    result[name] = searchName ? (logoCache[searchName] ?? null) : null;
  }
  return result;
}
