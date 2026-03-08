export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  icon?: string;
  active: boolean;
  closed: boolean;
  volume: number;
  volume24hr?: number;
  liquidity?: number;
  openInterest?: number;
  competitive?: number;
  commentCount?: number;
  markets: PolymarketMarket[];
  tags?: EventTag[];
  negRisk?: boolean;
  series?: EventSeries[];
}

export interface EventTag {
  id?: string;
  label: string;
  slug: string;
}

export interface EventSeries {
  id: string;
  ticker: string;
  slug: string;
  title: string;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  liquidity?: number;
  active: boolean;
  closed: boolean;
  startDate?: string;
  endDate?: string;
  closedTime?: string;
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
  clobTokenIds?: string[];
  conditionId?: string;
  winner?: string;
  image?: string;
}

export interface PricePoint {
  t: number;
  p: number;
}

export interface CategoryInfo {
  label: string;
  slug: string;
  count?: number;
}

export interface ArticleMap {
  [eventId: string]: string;
}

// For local sample_markets.json analytics
export interface SampleMarket {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: number[];
  winner: string | null;
  volume: number;
  volumeNum: number;
  liquidity: number;
  startDate: string;
  endDate: string;
  closedTime: string;
  lastTradePrice: number;
  bestBid: number;
  bestAsk: number;
  tags: string[] | null;
  category: string | null;
  events: any[];
  clobTokenIds: string[];
  conditionId: string;
}
