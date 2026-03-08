import { useTeamLogos } from "@/hooks/useTeamLogos";
import { cn } from "@/lib/utils";

interface TeamLogoProps {
  name: string;
  className?: string;
}

/**
 * Renders a team logo fetched from TheSportsDB if available.
 * Falls back to nothing if no logo found.
 */
const TeamLogo = ({ name, className }: TeamLogoProps) => {
  const logos = useTeamLogos([name]);
  const url = logos[name];

  if (!url) return null;

  return (
    <img
      src={url + "/tiny"}
      alt={name}
      className={cn("inline-block rounded-sm object-contain", className)}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
};

export default TeamLogo;
