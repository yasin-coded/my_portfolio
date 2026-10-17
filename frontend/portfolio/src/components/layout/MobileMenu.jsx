import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard } from 'lucide-react';
import { cn } from '../../utils/cn';

export function MobileMenu({
  isOpen,
  onClose,
  sections = [],
  activeSection,
  isOwner,
  authLoading,
  isHomePage,
  onSectionClick,
}) {
  // Prevent background scrolling while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Press ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 md:hidden flex flex-col justify-between bg-bg/95 backdrop-blur-md animate-fade-in"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border/70 shrink-0">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>// navigation_menu</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors hover:bg-surface-2"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Destination Panel - All sections visible at once without scrolling */}
      <div className="flex-1 flex flex-col justify-center px-6 py-6 max-w-sm mx-auto w-full animate-menu-in">
        <p className="font-mono text-[11px] text-text-muted/70 uppercase tracking-widest mb-3 px-1">
          // destination
        </p>

        <nav className="flex flex-col gap-2.5">
          {sections.map(({ id, label }, index) => {
            const isActive = isHomePage && activeSection === id;
            return (
              <a
                key={id}
                href={`/#${id}`}
                onClick={(e) => onSectionClick(e, id)}
                className={cn(
                  'group flex items-center justify-between px-5 py-3.5 rounded-lg font-mono text-base transition-all duration-150 border min-h-[48px]',
                  isActive
                    ? 'bg-accent/15 border-accent text-accent font-semibold shadow-sm shadow-accent/10'
                    : 'bg-surface/80 border-border/70 text-text hover:bg-surface-2 hover:border-accent/50 hover:text-accent'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-xs transition-colors',
                      isActive ? 'text-accent' : 'text-text-muted group-hover:text-accent'
                    )}
                  >
                    $
                  </span>
                  <span>{label}</span>
                </div>
                <span
                  className={cn(
                    'text-xs font-mono tracking-wider transition-colors',
                    isActive ? 'text-accent' : 'text-text-muted group-hover:text-accent'
                  )}
                >
                  0{index + 1}
                </span>
              </a>
            );
          })}

          {/* Dashboard link for owner */}
          {!authLoading && isOwner && (
            <div className="pt-2 border-t border-border/60 mt-1">
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-5 py-3.5 rounded-lg font-mono text-base transition-all duration-150 border min-h-[48px]',
                    isActive
                      ? 'bg-accent/20 border-accent text-accent font-semibold shadow-sm shadow-accent/10'
                      : 'bg-surface/80 border-border/70 text-accent hover:bg-surface-2 hover:border-accent/50'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>/dashboard</span>
                </div>
                <span className="text-xs text-accent tracking-wider">
                  owner
                </span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Terminal status bar */}
      <div className="px-6 py-4 border-t border-border/40 text-center shrink-0">
        <span className="font-mono text-[11px] text-text-muted select-none">
          the highlighted is the section that you were on
          press [esc] or tap outside to dismiss
        </span>
      </div>
    </div>
  );
}

export default MobileMenu;
