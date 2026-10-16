import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Pagination({
  currentPage = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
  className,
}) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(
        <button
          key={1}
          type="button"
          onClick={() => onPageChange(1)}
          className="font-mono text-xs px-2.5 py-1.5 rounded border border-border bg-surface-2 text-text hover:border-accent"
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span key="start-dots" className="px-1 text-text-muted font-mono text-xs">
            ...
          </span>
        );
      }
    }

    for (let p = start; p <= end; p++) {
      const isActive = p === currentPage;
      pages.push(
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            'font-mono text-xs px-2.5 py-1.5 rounded border transition-colors select-none min-w-[32px]',
            isActive
              ? 'bg-accent text-on-accent border-accent font-semibold'
              : 'border-border bg-surface-2 text-text hover:border-accent hover:text-accent'
          )}
        >
          {p}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="end-dots" className="px-1 text-text-muted font-mono text-xs">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          type="button"
          onClick={() => onPageChange(totalPages)}
          className="font-mono text-xs px-2.5 py-1.5 rounded border border-border bg-surface-2 text-text hover:border-accent"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-4 select-none',
        className
      )}
    >
      <div className="font-mono text-xs text-text-muted hidden sm:block">
        Page <span className="text-text">{currentPage}</span> of{' '}
        <span className="text-text">{totalPages}</span> ({totalCount} items)
      </div>

      <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
          className="flex items-center gap-1 font-mono text-xs px-2.5 py-1.5 rounded border border-border bg-surface-2 text-text hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {renderPageNumbers()}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
          className="flex items-center gap-1 font-mono text-xs px-2.5 py-1.5 rounded border border-border bg-surface-2 text-text hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
