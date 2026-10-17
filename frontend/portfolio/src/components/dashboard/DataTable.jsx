import { AlertCircle, RotateCcw, FolderOpen } from 'lucide-react';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import { cn } from '../../utils/cn';

function renderActionItem(action, item, index, aIdx) {
  if (!action) return null;
  if (typeof action.hidden === 'function' && action.hidden(item, index)) return null;
  if (action.hidden === true) return null;

  // Defensive: skip rendering an action whose icon is missing instead of crashing
  const Icon = action.icon;
  if (!Icon) return null;

  const href = typeof action.href === 'function' ? action.href(item, index) : action.href;
  const label =
    action.label ||
    action.title ||
    (typeof action.ariaLabel === 'function' ? action.ariaLabel(item, index) : action.ariaLabel) ||
    'Action';

  // If action has href
  if (action.href !== undefined) {
    // Hidden when the URL is empty
    if (!href || !String(href).trim()) return null;

    return (
      <a
        key={action.key || aIdx}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={action.title || label}
        className={cn(
          'p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors inline-flex items-center justify-center',
          typeof action.className === 'function' ? action.className(item) : action.className
        )}
      >
        {typeof Icon === 'function' || typeof Icon === 'object' ? (
          <Icon className="w-3.5 h-3.5" />
        ) : null}
      </a>
    );
  }

  return (
    <button
      key={action.key || aIdx}
      type="button"
      onClick={() => action.onClick?.(item, index)}
      aria-label={label}
      title={action.title || label}
      className={cn(
        'p-1.5 rounded border border-border hover:border-accent text-text-muted hover:text-accent transition-colors inline-flex items-center justify-center cursor-pointer',
        typeof action.className === 'function' ? action.className(item) : action.className
      )}
    >
      {typeof Icon === 'function' || typeof Icon === 'object' ? (
        <Icon className="w-3.5 h-3.5" />
      ) : null}
    </button>
  );
}

export function DataTable({
  columns = [],
  data = [],
  actions = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry = null,
  emptyMessage = 'No records found.',
  keyField = 'id',
  skeletonRows = 5,
  className = '',
}) {
  const hasActionsCol = columns.some(
    (col) => col.header === 'Actions' || col.id === 'actions' || col.actions
  );

  const effectiveColumns =
    !hasActionsCol && actions && actions.length > 0
      ? [
          ...columns,
          {
            header: 'Actions',
            align: 'right',
            actions,
          },
        ]
      : columns;

  const dataList = Array.isArray(data) ? data : [];

  return (
    <div className={cn('w-full border border-border/80 bg-surface/90 rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/80 text-left border-collapse">
          <thead className="bg-surface-2/80 select-none">
            <tr className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              {effectiveColumns.map((col, idx) => (
                <th
                  key={col.header || col.id || idx}
                  className={cn(
                    'px-4 py-3 font-semibold',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono text-xs text-text">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`} className="bg-surface/50">
                  {effectiveColumns.map((col, cIdx) => (
                    <td key={`skel-${rIdx}-${cIdx}`} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={effectiveColumns.length || 1} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-8 h-8 text-danger" />
                    <div>
                      <p className="font-mono text-sm text-text font-semibold">Failed to load data</p>
                      <p className="font-mono text-xs text-danger mt-1">
                        {error?.response?.data?.detail || error?.message || 'Server error occurred.'}
                      </p>
                    </div>
                    {onRetry && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={onRetry}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        className="mt-1"
                      >
                        Retry Request
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : dataList.length === 0 ? (
              <tr>
                <td colSpan={effectiveColumns.length || 1} className="px-6 py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <FolderOpen className="w-8 h-8 text-text-muted/60" />
                    <p className="font-mono text-xs">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              dataList.map((item, index) => {
                const rowKey = item?.[keyField] ?? index;
                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-surface-2/40 transition-colors duration-150"
                  >
                    {effectiveColumns.map((col, cIdx) => {
                      const value = col.accessor ? item?.[col.accessor] : undefined;
                      let content;

                      if (col.actions && Array.isArray(col.actions)) {
                        content = (
                          <div className="flex items-center justify-end gap-1.5">
                            {col.actions.map((act, aIdx) =>
                              renderActionItem(act, item, index, aIdx)
                            )}
                          </div>
                        );
                      } else if (col.cell) {
                        try {
                          content = col.cell(item, index);
                        } catch (err) {
                          console.error('DataTable cell render error:', err);
                          content = '—';
                        }
                      } else {
                        content = value ?? '—';
                      }

                      return (
                        <td
                          key={`cell-${cIdx}`}
                          className={cn(
                            'px-4 py-3 align-middle',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                            col.className
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
