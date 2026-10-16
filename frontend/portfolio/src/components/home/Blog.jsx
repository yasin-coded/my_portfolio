export function Blog() {
  return (
    <section id="blog" className="scroll-mt-20 py-24 border-t border-border/40">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-accent tracking-widest uppercase">// blog</p>
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-text">
          $ cat /var/log/posts/*
        </h2>
        <p className="text-text-muted font-mono text-sm">
          // Latest published posts with debounced search, category chips and pagination — assembled in Phase 8.
        </p>
      </div>
    </section>
  );
}

export default Blog;
