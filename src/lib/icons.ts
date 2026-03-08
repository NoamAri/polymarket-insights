/**
 * Entity icon system ported from the Python dashboard.
 * Adds emoji flags, sports, crypto, and entity icons to outcome names.
 */

const COUNTRY_FLAGS: Record<string, string> = {
  afghanistan: "🇦🇫", albania: "🇦🇱", algeria: "🇩🇿", argentina: "🇦🇷",
  armenia: "🇦🇲", australia: "🇦🇺", austria: "🇦🇹", azerbaijan: "🇦🇿",
  bahrain: "🇧🇭", bangladesh: "🇧🇩", belarus: "🇧🇾", belgium: "🇧🇪",
  bolivia: "🇧🇴", bosnia: "🇧🇦", brazil: "🇧🇷", bulgaria: "🇧🇬",
  cambodia: "🇰🇭", cameroon: "🇨🇲", canada: "🇨🇦", chile: "🇨🇱",
  china: "🇨🇳", colombia: "🇨🇴", "costa rica": "🇨🇷", croatia: "🇭🇷",
  cuba: "🇨🇺", cyprus: "🇨🇾", "czech republic": "🇨🇿", czechia: "🇨🇿",
  denmark: "🇩🇰", "dominican republic": "🇩🇴",
  ecuador: "🇪🇨", egypt: "🇪🇬", "el salvador": "🇸🇻",
  estonia: "🇪🇪", ethiopia: "🇪🇹", finland: "🇫🇮",
  france: "🇫🇷", georgia: "🇬🇪", germany: "🇩🇪", ghana: "🇬🇭",
  greece: "🇬🇷", guatemala: "🇬🇹", honduras: "🇭🇳", hungary: "🇭🇺",
  iceland: "🇮🇸", india: "🇮🇳", indonesia: "🇮🇩", iran: "🇮🇷",
  iraq: "🇮🇶", ireland: "🇮🇪", israel: "🇮🇱", italy: "🇮🇹",
  jamaica: "🇯🇲", japan: "🇯🇵", jordan: "🇯🇴", kazakhstan: "🇰🇿",
  kenya: "🇰🇪", kuwait: "🇰🇼", latvia: "🇱🇻", lebanon: "🇱🇧",
  libya: "🇱🇾", lithuania: "🇱🇹", luxembourg: "🇱🇺", malaysia: "🇲🇾",
  mexico: "🇲🇽", moldova: "🇲🇩", mongolia: "🇲🇳", morocco: "🇲🇦",
  mozambique: "🇲🇿", myanmar: "🇲🇲", nepal: "🇳🇵", netherlands: "🇳🇱",
  "new zealand": "🇳🇿", nicaragua: "🇳🇮", nigeria: "🇳🇬",
  "north korea": "🇰🇵", "north macedonia": "🇲🇰", norway: "🇳🇴",
  oman: "🇴🇲", pakistan: "🇵🇰", palestine: "🇵🇸", panama: "🇵🇦",
  paraguay: "🇵🇾", peru: "🇵🇪", philippines: "🇵🇭", poland: "🇵🇱",
  portugal: "🇵🇹", qatar: "🇶🇦", romania: "🇷🇴", russia: "🇷🇺",
  "saudi arabia": "🇸🇦", senegal: "🇸🇳", serbia: "🇷🇸",
  singapore: "🇸🇬", slovakia: "🇸🇰", slovenia: "🇸🇮",
  somalia: "🇸🇴", "south africa": "🇿🇦", "south korea": "🇰🇷",
  spain: "🇪🇸", "sri lanka": "🇱🇰", sudan: "🇸🇩",
  sweden: "🇸🇪", switzerland: "🇨🇭", syria: "🇸🇾", taiwan: "🇹🇼",
  thailand: "🇹🇭", tunisia: "🇹🇳", turkey: "🇹🇷", turkiye: "🇹🇷",
  ukraine: "🇺🇦", "united arab emirates": "🇦🇪", uae: "🇦🇪",
  "united kingdom": "🇬🇧", uk: "🇬🇧",
  "united states": "🇺🇸", usa: "🇺🇸", us: "🇺🇸",
  uruguay: "🇺🇾", uzbekistan: "🇺🇿",
  venezuela: "🇻🇪", vietnam: "🇻🇳",
  yemen: "🇾🇪", zambia: "🇿🇲", zimbabwe: "🇿🇼",
};

const SPORTS_TEAMS: Record<string, string> = {
  // Soccer ⚽
  "manchester united": "⚽", "man united": "⚽", "man utd": "⚽",
  "manchester city": "⚽", "man city": "⚽",
  liverpool: "⚽", chelsea: "⚽", arsenal: "⚽",
  tottenham: "⚽", spurs: "⚽", "tottenham hotspur": "⚽",
  "west ham": "⚽", newcastle: "⚽", "aston villa": "⚽",
  brighton: "⚽", wolverhampton: "⚽", wolves: "⚽",
  "crystal palace": "⚽", fulham: "⚽", bournemouth: "⚽",
  "nottingham forest": "⚽", brentford: "⚽", leicester: "⚽",
  barcelona: "⚽", "real madrid": "⚽", "atletico madrid": "⚽",
  sevilla: "⚽", villarreal: "⚽", valencia: "⚽",
  "bayern munich": "⚽", bayern: "⚽", "borussia dortmund": "⚽", dortmund: "⚽",
  "bayer leverkusen": "⚽", leverkusen: "⚽",
  "rb leipzig": "⚽", leipzig: "⚽",
  psg: "⚽", "paris saint-germain": "⚽", marseille: "⚽", lyon: "⚽", monaco: "⚽",
  juventus: "⚽", "ac milan": "⚽", "inter milan": "⚽",
  napoli: "⚽", roma: "⚽", lazio: "⚽", atalanta: "⚽",
  ajax: "⚽", psv: "⚽", feyenoord: "⚽",
  benfica: "⚽", porto: "⚽", "sporting cp": "⚽",
  celtic: "⚽", rangers: "⚽",
  galatasaray: "⚽", fenerbahce: "⚽", besiktas: "⚽",
  "al hilal": "⚽", "al nassr": "⚽",
  flamengo: "⚽", palmeiras: "⚽",
  "boca juniors": "⚽", "river plate": "⚽",
  "la liga": "⚽", "premier league": "⚽", "serie a": "⚽",
  bundesliga: "⚽", "ligue 1": "⚽", "champions league": "⚽",
  "europa league": "⚽", "world cup": "⚽",
  // NBA 🏀
  lakers: "🏀", celtics: "🏀", warriors: "🏀", heat: "🏀",
  bulls: "🏀", knicks: "🏀", nets: "🏀", "76ers": "🏀", sixers: "🏀",
  bucks: "🏀", nuggets: "🏀", mavericks: "🏀", mavs: "🏀",
  suns: "🏀", clippers: "🏀", raptors: "🏀", hawks: "🏀",
  cavaliers: "🏀", cavs: "🏀", pacers: "🏀", magic: "🏀",
  grizzlies: "🏀", pelicans: "🏀", thunder: "🏀", okc: "🏀",
  timberwolves: "🏀", kings: "🏀", rockets: "🏀",
  // NFL 🏈
  chiefs: "🏈", eagles: "🏈", "49ers": "🏈", niners: "🏈",
  cowboys: "🏈", bills: "🏈", ravens: "🏈", dolphins: "🏈",
  jets: "🏈", patriots: "🏈", pats: "🏈",
  packers: "🏈", bears: "🏈", lions: "🏈", vikings: "🏈",
  steelers: "🏈", bengals: "🏈", browns: "🏈",
  texans: "🏈", colts: "🏈", jaguars: "🏈", jags: "🏈",
  titans: "🏈", broncos: "🏈", chargers: "🏈",
  raiders: "🏈", seahawks: "🏈", rams: "🏈",
  commanders: "🏈", giants: "🏈", falcons: "🏈",
  panthers: "🏈", saints: "🏈", buccaneers: "🏈", bucs: "🏈",
  // MLB ⚾
  yankees: "⚾", dodgers: "⚾", "red sox": "⚾", mets: "⚾",
  cubs: "⚾", astros: "⚾", braves: "⚾", phillies: "⚾", padres: "⚾",
  // NHL 🏒
  "maple leafs": "🏒", bruins: "🏒", penguins: "🏒",
  canadiens: "🏒", habs: "🏒", blackhawks: "🏒",
  oilers: "🏒", avalanche: "🏒", lightning: "🏒",
  // F1 🏎️
  "red bull": "🏎️", ferrari: "🏎️", mercedes: "🏎️", mclaren: "🏎️",
  verstappen: "🏎️", hamilton: "🏎️", leclerc: "🏎️", norris: "🏎️",
  // Tennis 🎾
  djokovic: "🎾", nadal: "🎾", federer: "🎾", alcaraz: "🎾", sinner: "🎾",
  // UFC 🥊
  ufc: "🥊",
};

const CRYPTO_ICONS: Record<string, string> = {
  bitcoin: "₿", btc: "₿", ethereum: "⟠", eth: "⟠",
  solana: "◎", sol: "◎", xrp: "✕", dogecoin: "🐕", doge: "🐕",
  cardano: "₳", ada: "₳", polkadot: "●", dot: "●",
  avalanche: "🔺", avax: "🔺", chainlink: "⬡", link: "⬡",
  uniswap: "🦄", polygon: "⬡", matic: "⬡", litecoin: "Ł", ltc: "Ł",
  shiba: "🐕", pepe: "🐸", bonk: "🐕",
};

const ENTITY_ICONS: Record<string, string> = {
  trump: "🐘", "donald trump": "🐘", biden: "🫏", "joe biden": "🫏",
  harris: "🫏", "kamala harris": "🫏",
  desantis: "🐘", "ron desantis": "🐘",
  musk: "🚀", "elon musk": "🚀", spacex: "🚀", tesla: "🚀",
  apple: "🍎", google: "🔍", microsoft: "💠", amazon: "📦",
  meta: "♾️", nvidia: "💚", openai: "🤖",
  democrat: "🫏", republican: "🐘", democrats: "🫏", republicans: "🐘",
  fed: "🏛️", "federal reserve": "🏛️",
  nato: "🛡️", "european union": "🇪🇺", eu: "🇪🇺", un: "🌐",
  olympics: "🏅", oscar: "🏆", grammy: "🎵", "nobel prize": "🏅",
};

/**
 * Add an icon emoji prefix to a name based on entity type.
 * Priority: country flags > sports teams > crypto > entities
 */
export function addIcon(name: string): string {
  const lower = name.trim().toLowerCase();

  // 1. Direct match: countries
  if (COUNTRY_FLAGS[lower]) return `${COUNTRY_FLAGS[lower]} ${name}`;

  // 2. Direct match: sports
  if (SPORTS_TEAMS[lower]) return `${SPORTS_TEAMS[lower]} ${name}`;

  // 3. Direct match: crypto
  if (CRYPTO_ICONS[lower]) return `${CRYPTO_ICONS[lower]} ${name}`;

  // 4. Direct match: entities
  if (ENTITY_ICONS[lower]) return `${ENTITY_ICONS[lower]} ${name}`;

  // 5. Partial substring matching
  for (const [country, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (country.length >= 3 && lower.includes(country)) return `${flag} ${name}`;
  }
  for (const [team, emoji] of Object.entries(SPORTS_TEAMS)) {
    if (team.length >= 4 && lower.includes(team)) return `${emoji} ${name}`;
  }
  for (const [token, icon] of Object.entries(CRYPTO_ICONS)) {
    if (token.length >= 3 && lower.includes(token)) return `${icon} ${name}`;
  }
  for (const [entity, icon] of Object.entries(ENTITY_ICONS)) {
    if (entity.length >= 3 && lower.includes(entity)) return `${icon} ${name}`;
  }

  return name;
}
