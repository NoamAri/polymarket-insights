const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em] py-3 border-t-2 border-muted border-b border-border/30 my-8">
    {children}
  </div>
);

export default SectionHeader;
