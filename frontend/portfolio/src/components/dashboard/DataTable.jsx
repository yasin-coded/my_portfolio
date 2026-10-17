import { AlertCircle, RotateCcw, FolderOpen } from 'lucide-react';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import { cn } from '../../utils/cn';

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry = null,
  emptyMessage = 'No records found.',
  keyField = 'id',
  skeletonRows = 5,
  className = '',
}) {
  return (
    <div className={cn('w-full border border-border/80 bg-surface/90 rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/80 text-left border-collapse">
          <thead className="bg-surface-2/80 select-none">
            <tr className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              {columns.map((col, idx) => (
                <th
                  key={col.header || idx}
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
                  {columns.map((col, cIdx) => (
                    <td key={`skel-${rIdx}-${cIdx}`} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
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
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <FolderOpen className="w-8 h-8 text-text-muted/60" />
                    <p className="font-mono text-xs">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowKey = item?.[keyField] ?? index;
                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-surface-2/40 transition-colors duration-150"
                  >
                    {columns.map((col, cIdx) => {
                      const value = col.accessor ? item?.[col.accessor] : undefined;
                      const content = col.cell ? col.cell(item, index) : value ?? '—';
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
