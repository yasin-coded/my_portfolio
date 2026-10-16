import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Terminal, User } from 'lucide-react';
import api from '../../api/axios';
import localProfile from '../../data/profile.js';
import Button from '../ui/Button';

/* ── Typing effect hook ──────────────────────────────────────────────── */
function useTypingEffect(lines, speed = 38) {
  const fullText = lines.join('\n');
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText]);

  return { displayed, done };
}

/* ── Code-window card ────────────────────────────────────────────────── */
function CodeWindow({ name, role, focus }) {
  const lines = [
    `class Developer:`,
    `    name  = "${name}"`,
    `    role  = "${role}"`,
    `    focus = [`,
    ...focus.map((f, i) => `        "${f}"${i < focus.length - 1 ? ',' : ''}`),
    `    ]`,
    ``,
    `print(Developer())`,
  ];

  const { displayed, done } = useTypingEffect(lines);

  return (
    <div className="w-full rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-border select-none">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/80" />
        </div>
        <span className="font-mono text-xs text-text-muted">profile.py</span>
        <Terminal className="w-3.5 h-3.5 text-text-muted" />
      </div>

      {/* Code body */}
      <pre
        aria-label="Developer profile code"
        className="p-5 font-mono text-sm text-text leading-relaxed min-h-[220px] whitespace-pre-wrap"
      >
        {/* Screen-reader gets the full text always */}
        <span className="sr-only">{lines.join('\n')}</span>
        <span aria-hidden="true">
          <SyntaxHighlight text={displayed} />
          {!done && (
            <span className="inline-block w-2 h-4 bg-accent align-middle animate-blink" />
          )}
        </span>
      </pre>
    </div>
  );
}

/* Very lightweight syntax colouring – no extra dependency */
function SyntaxHighlight({ text }) {
  if (!text) return null;
  return text.split('\n').map((line, li) => (
    <span key={li} className="block">
      {line
        .split(/(\b(?:class|print)\b|"[^"]*"|\[|\]|=)/g)
        .map((part, pi) => {
          if (/^"/.test(part))
            return <span key={pi} className="text-success">{part}</span>;
          if (/^(class|print)$/.test(part))
            return <span key={pi} className="text-accent font-semibold">{part}</span>;
          if (/^[=\[\]]$/.test(part))
            return <span key={pi} className="text-warning">{part}</span>;
          return <span key={pi} className="text-text-muted">{part}</span>;
        })}
    </span>
  ));
}

/* ── Avatar placeholder / photo ─────────────────────────────────────── */
function Avatar({ src, name, openToWork }) {
  return (
    <div className="relative mx-auto w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 shrink-0">
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full ring-4 ring-accent/40 shadow-[0_0_60px_-10px] shadow-accent/30" />

      {src ? (
        <img
          src={src}
          alt={`${name} profile photo`}
          className="w-full h-full rounded-full object-cover border-2 border-border"
        />
      ) : (
        /* Placeholder until a real photo is uploaded */
        <div className="w-full h-full rounded-full bg-surface-2 border-2 border-border flex flex-col items-center justify-center gap-3">
          <User className="w-20 h-20 text-accent/30" />
          <span className="font-mono text-xs text-text-muted text-center px-4">
            // add photo to public/ and update profile.js
          </span>
        </div>
      )}

      {/* open_to_work badge */}
      {openToWork && (
        <div className="absolute bottom-4 right-0 bg-surface border border-success/60 text-success font-mono text-[10px] px-2.5 py-1 rounded-full shadow-lg select-none whitespace-nowrap">
          open_to_work = True
        </div>
      )}
    </div>
  );
}

/* ── Main Hero section ───────────────────────────────────────────────── */
export function Hero() {
  const { data: apiProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => { const r = await api.get('/profile/'); return r.data; },
    staleTime: 1000 * 60 * 10,
  });

  // Merge: API wins over local fallback
  const p = {
    name:       apiProfile?.full_name   ?? localProfile.name,
    role:       apiProfile?.headline    ?? localProfile.role,
    focus:      localProfile.focus,           // only in local file
    description:apiProfile?.hero_pitch  ?? localProfile.description,
    photo:      apiProfile?.avatar      ?? localProfile.photo,
    openToWork: apiProfile?.is_available_for_hire ?? localProfile.openToWork,
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="home"
      className="scroll-mt-20 min-h-[calc(100vh-4rem)] flex items-center py-20 lg:py-24"
    >
      <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-8 order-2 lg:order-1">
          <CodeWindow name={p.name} role={p.role} focus={p.focus} />

          {/* Headline + description + CTAs */}
          <div className="flex flex-col gap-5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div>
              <p className="font-mono text-xs text-accent mb-2 tracking-widest uppercase">
                // Hello, I&rsquo;m
              </p>
              <h1 className="font-mono text-3xl sm:text-4xl font-bold text-text leading-tight tracking-tight">
                {p.name}
                <br />
                <span className="text-accent">{p.role}</span>
              </h1>
            </div>

            <p className="text-text-muted text-base leading-relaxed max-w-md font-sans">
              {p.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollTo('projects')}
              >
                run(projects)
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollTo('blog')}
              >
                read(blog)
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex justify-center order-1 lg:order-2 animate-fade-up">
          <Avatar src={p.photo} name={p.name} openToWork={p.openToWork} />
        </div>
      </div>
    </section>
  );
}

export default Hero;
