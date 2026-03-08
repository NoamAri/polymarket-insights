import { useQuery } from "@tanstack/react-query";
import {
  fetchTopCategories,
  fetchEventsByCategory,
  fetchNewspaperEvents,
  fetchPriceHistory,
} from "@/lib/polymarket-api";
import { generateArticles } from "@/lib/articles";
import type { PolymarketEvent, ArticleMap } from "@/types/polymarket";

export function useTopCategories() {
  return useQuery({
    queryKey: ["polymarket", "categories"],
    queryFn: () => fetchTopCategories(14),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventsByCategory(slug: string | null) {
  return useQuery({
    queryKey: ["polymarket", "events", slug],
    queryFn: () => fetchEventsByCategory(slug!, 5),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useNewspaperEvents() {
  return useQuery({
    queryKey: ["polymarket", "newspaper"],
    queryFn: () => fetchNewspaperEvents(15),
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticles(events: PolymarketEvent[] | undefined) {
  return useQuery({
    queryKey: ["polymarket", "articles", events?.map((e) => e.id).join(",")],
    queryFn: () => generateArticles(events!),
    enabled: !!events && events.length > 0,
    staleTime: 15 * 60 * 1000,
  });
}

export function usePriceHistory(tokenId: string | null) {
  return useQuery({
    queryKey: ["polymarket", "price-history", tokenId],
    queryFn: () => fetchPriceHistory(tokenId!),
    enabled: !!tokenId,
    staleTime: 5 * 60 * 1000,
  });
}
