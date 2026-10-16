export function About() {
  return (
    <section id="about" className="scroll-mt-20 py-24 border-t border-border/40">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-accent tracking-widest uppercase">// about</p>
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-text">
          $ cat /about/bio.md
        </h2>
        <p className="text-text-muted font-mono text-sm">
          // Bio, education timeline, experience and skills — assembled in Phase 8.
        </p>
      </div>
    </section>
  );
}

export default About;
