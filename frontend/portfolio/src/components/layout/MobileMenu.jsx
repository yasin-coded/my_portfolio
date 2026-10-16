import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, LayoutDashboard } from 'lucide-react';
import { cn } from '../../utils/cn';

export function MobileMenu({
  isOpen,
  onClose,
  sections,
  activeSection,
  isOwner,
  authLoading,
  isHomePage,
  onSectionClick,
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-bg/95 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/70">
        <span className="font-mono text-xs text-text-muted">// navigation_menu</span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Section links */}
      <nav className="flex-1 px-6 py-8 flex flex-col gap-2 overflow-y-auto">
        {sections.map(({ id, label }) => (
          <a
            key={id}
            href={`/#${id}`}
            onClick={(e) => onSectionClick(e, id)}
            className={cn(
              'flex items-center px-4 py-3 rounded-md font-mono text-base transition-colors min-h-[48px]',
              isHomePage && activeSection === id
                ? 'bg-accent/15 text-accent font-semibold border-l-2 border-accent'
                : 'text-text hover:bg-surface-2 hover:text-accent'
            )}
          >
            <span className="text-text-muted mr-2.5 select-none">$</span>
            {label}
          </a>
        ))}

        {/* Dashboard button – owner only */}
        {!authLoading && isOwner && (
          <div className="mt-4 pt-4 border-t border-border/60">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-3 rounded-md font-mono text-sm transition-colors min-h-[48px]',
                  isActive
                    ? 'bg-accent/20 text-accent font-semibold'
                    : 'text-accent hover:bg-surface-2'
                )
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>/dashboard</span>
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
}

export default MobileMenu;
