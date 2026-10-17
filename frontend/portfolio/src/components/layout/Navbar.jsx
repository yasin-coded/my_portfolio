import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sun, Moon, Menu, LayoutDashboard } from 'lucide-react';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import PageContainer from './PageContainer';
import MobileMenu from './MobileMenu';
import Skeleton from '../ui/Skeleton';

// Sections on the single-page site
const NAV_SECTIONS = [
  { id: 'home',       label: 'Home' },
  { id: 'about',      label: 'About' },
  { id: 'projects',   label: 'Projects' },
  { id: 'blog',       label: 'Blog' },
  { id: 'contact',    label: 'Contact' },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isOwner, loading: authLoading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const isHomePage = location.pathname === '/';

  // ── Fetch profile for dynamic logo_text ─────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/profile/');
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
  const logoText = 'yasin';

  // ── IntersectionObserver: highlight the visible section ─────────
  useEffect(() => {
    if (!isHomePage) return;

    const observers = [];
    const thresholds = { home: 0.4, about: 0.3, projects: 0.2, blog: 0.2, contact: 0.3 };

    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-60px 0px -40% 0px', threshold: thresholds[id] ?? 0.2 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [isHomePage]);

  // ── Smooth scroll helper ─────────────────────────────────────────
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavClick = (e, id) => {
    if (isHomePage) {
      e.preventDefault();
      scrollTo(id);
      window.history.replaceState(null, '', `/#${id}`);
    }
    // On a non-home page the href="/#about" will navigate back to home
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-bg/85 backdrop-blur-md border-b border-border/80 transition-colors duration-200">
      <PageContainer>
        <div className="flex items-center justify-between h-16">

          {/* ── Logo with blinking block cursor ───────────────────── */}
          <a
            href="/#home"
            onClick={(e) => { if (isHomePage) { e.preventDefault(); scrollTo('home'); } }}
            className="flex items-center gap-1.5 font-mono text-base sm:text-lg font-bold text-text hover:text-accent transition-colors select-none"
          >
            <span className="text-accent">$</span>
            {profileLoading
              ? <Skeleton className="h-5 w-24" />
              : <span>{logoText}</span>
            }
            <span
              className="inline-block w-2.5 h-4 sm:h-5 bg-accent ml-0.5 animate-blink"
              aria-hidden="true"
            />
          </a>

          {/* ── Desktop nav ───────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1" aria-label="Main navigation">
            {NAV_SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => handleNavClick(e, id)}
                className={cn(
                  'px-3 py-1.5 rounded-md font-mono text-xs lg:text-sm transition-colors duration-150',
                  isHomePage && activeSection === id
                    ? 'text-accent font-semibold bg-surface-2'
                    : 'text-text-muted hover:text-text hover:bg-surface-2/60'
                )}
              >
                {label}
              </a>
            ))}

            {/* Dashboard button – owner only, no flicker */}
            {!authLoading && isOwner && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cn(
                    'ml-2 px-2.5 py-1.5 rounded-md font-mono text-xs flex items-center gap-1.5 border border-accent/40 transition-colors',
                    isActive
                      ? 'bg-accent text-on-accent'
                      : 'text-accent bg-accent/10 hover:bg-accent/20'
                  )
                }
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </NavLink>
            )}
          </nav>

          {/* ── Right controls ────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-text rounded-md hover:bg-surface-2 border border-border/60 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-warning" />
                : <Moon className="w-4 h-4 text-accent" />
              }
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-text-muted hover:text-text rounded-md hover:bg-surface-2 border border-border/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </PageContainer>
    </header>

    <MobileMenu
      isOpen={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sections={NAV_SECTIONS}
      activeSection={activeSection}
      isOwner={isOwner}
      authLoading={authLoading}
      isHomePage={isHomePage}
      onSectionClick={(e, id) => { handleNavClick(e, id); setMobileMenuOpen(false); }}
    />
  </>
);
}

export default Navbar;
