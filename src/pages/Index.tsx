import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewspaperEvents, useArticles } from "@/hooks/usePolymarket";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { PolymarketEvent } from "@/types/polymarket";
import Masthead from "@/components/newspaper/Masthead";
import TickerBar from "@/components/newspaper/TickerBar";
import LeadStory from "@/components/newspaper/LeadStory";
import ArticleCard from "@/components/newspaper/ArticleCard";
import CompactCard from "@/components/newspaper/CompactCard";
import HotTake from "@/components/newspaper/HotTake";
import SectionHeader from "@/components/newspaper/SectionHeader";

const Index = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: events, isLoading: eventsLoading } = useNewspaperEvents();
  const { data: articles, isLoading: articlesLoading } = useArticles(events);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["polymarket"] });
  };

  const handleExplore = (event: PolymarketEvent) => {
    navigate("/event", { state: { event } });
  };

  if (eventsLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-64 w-full mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-muted-foreground">No fresh news available right now.</p>
      </div>
    );
  }

  const getArticle = (id: string) => articles?.[id] || "";

  const lead = events[0];
  const topStories = events.slice(1, 5);
  const marketWatch = events.slice(5, 10);
  const hotTakes = events.slice(10);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Masthead />
      <TickerBar events={events} />

      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={eventsLoading || articlesLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${articlesLoading ? "animate-spin" : ""}`} />
          {articlesLoading ? "Writing edition…" : "Refresh Edition"}
        </Button>
      </div>

      <LeadStory event={lead} article={getArticle(lead.id)} onExplore={handleExplore} />

      {topStories.length > 0 && (
        <>
          <SectionHeader>TOP STORIES</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topStories.map((ev) => (
              <ArticleCard key={ev.id} event={ev} article={getArticle(ev.id)} onExplore={handleExplore} />
            ))}
          </div>
        </>
      )}

      {marketWatch.length > 0 && (
        <>
          <SectionHeader>MARKET WATCH</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {marketWatch.map((ev) => (
              <CompactCard key={ev.id} event={ev} onExplore={handleExplore} />
            ))}
          </div>
        </>
      )}

      {hotTakes.length > 0 && (
        <>
          <SectionHeader>HOT TAKES</SectionHeader>
          {hotTakes.map((ev) => (
            <HotTake key={ev.id} event={ev} article={getArticle(ev.id)} onExplore={handleExplore} />
          ))}
        </>
      )}

      <div className="border-t border-border mt-12 pt-4 text-center">
        <p className="text-xs text-muted-foreground/40">
          The Polymarket Chronicle • Live market data •{" "}
          {articlesLoading ? "Generating articles…" : "AI-generated via Lovable AI"}
        </p>
        <p className="text-[0.65rem] text-muted-foreground/25 mt-1">
          Odds are not guarantees. Past market performance does not predict future outcomes.
        </p>
      </div>
    </div>
  );
};

export default Index;
