const Masthead = () => {
  const today = new Date();
  const editionNum = Math.floor(
    (today.getTime() - new Date("2025-01-01").getTime()) / 86400000
  );

  return (
    <div className="text-center py-6 pb-4 border-b-4 border-double border-muted-foreground/30 mb-6">
      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
        {today.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        — Edition No.&nbsp;{editionNum}
      </p>
      <h1 className="font-display text-5xl font-black text-foreground tracking-wide leading-tight">
        THE POLYMARKET CHRONICLE
      </h1>
      <p className="font-serif text-base italic text-muted-foreground mt-1">
        All the Odds That Are Fit to Print
      </p>
    </div>
  );
};

export default Masthead;
