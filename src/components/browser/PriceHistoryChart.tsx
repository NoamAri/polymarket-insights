import { usePriceHistory } from "@/hooks/usePolymarket";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceHistoryChartProps {
  tokenId: string;
  outcomeLabel: string;
  winner: string | null;
}

const PriceHistoryChart = ({ tokenId, outcomeLabel, winner }: PriceHistoryChartProps) => {
  const { data: history, isLoading } = usePriceHistory(tokenId);

  if (isLoading) return <Skeleton className="h-48 w-full rounded-lg" />;
  if (!history || history.length < 3) return <p className="text-xs text-muted-foreground">📉 No price history available.</p>;

  const chartData = history.map((h) => ({
    time: new Date(h.t * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: h.p,
  }));

  return (
    <div>
      <h4 className="text-sm font-bold text-foreground mb-2">📈 Price History — {outcomeLabel}</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 1.05]}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222, 47%, 8%)",
                border: "1px solid hsl(220, 20%, 15%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(213, 31%, 91%)",
              }}
              formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, outcomeLabel]}
            />
            {winner === outcomeLabel ? (
              <ReferenceLine y={1} stroke="hsl(142, 71%, 45%)" strokeDasharray="5 5" opacity={0.5} />
            ) : (
              <ReferenceLine y={0} stroke="hsl(0, 84%, 60%)" strokeDasharray="5 5" opacity={0.5} />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#priceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[0.65rem] text-muted-foreground/40 mt-1">{history.length} data points</p>
    </div>
  );
};

export default PriceHistoryChart;
