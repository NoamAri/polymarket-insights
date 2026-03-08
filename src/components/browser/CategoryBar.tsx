import { cn } from "@/lib/utils";
import type { CategoryInfo } from "@/types/polymarket";
import { BarChart3 } from "lucide-react";

interface CategoryBarProps {
  categories: CategoryInfo[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
  loading?: boolean;
}

const CategoryBar = ({ categories, selected, onSelect, loading }: CategoryBarProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all border",
          selected === null
            ? "bg-[image:var(--gradient-primary)] text-foreground border-transparent shadow-[var(--shadow-glow)]"
            : "bg-muted/70 text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
        )}
      >
        <BarChart3 className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
        All Analytics
      </button>
      {loading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-muted animate-pulse" />
        ))
      ) : (
        categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all border",
              selected === cat.slug
                ? "bg-[image:var(--gradient-primary)] text-foreground border-transparent shadow-[var(--shadow-glow)]"
                : "bg-muted/70 text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
            )}
          >
            {cat.label}
          </button>
        ))
      )}
    </div>
  );
};

export default CategoryBar;
