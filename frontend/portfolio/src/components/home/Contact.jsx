export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 py-24 border-t border-border/40">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-accent tracking-widest uppercase">// contact</p>
        <h2 className="font-mono text-2xl sm:text-3xl font-bold text-text">
          $ echo &quot;message&quot; &gt; /dev/contact
        </h2>
        <p className="text-text-muted font-mono text-sm">
          // Contact form with validation, throttle handling and success state — assembled in Phase 8.
        </p>
      </div>
    </section>
  );
}

export default Contact;
