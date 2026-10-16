export function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 py-24 border-t border-border/40">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-accent tracking-widest uppercase">// projects</p>
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-text">
          $ ls -la /projects/
        </h2>
        <p className="text-text-muted font-mono text-sm">
          // Featured project cards with search, category filter and sort — assembled in Phase 8.
        </p>
      </div>
    </section>
  );
}

export default Projects;
