import { Terminal, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

export function EmptyState({
  title = 'No records found',
  description = 'Nothing matches your current query or filter criteria.',
  icon: Icon = Terminal,
  actionLabel,
  onAction,
  isError = false,
  className,
}) {
  const DisplayIcon = isError ? AlertCircle : Icon;

  return (
    <div
      className={cn(
        'w-full py-16 px-4 rounded-lg border border-dashed border-border bg-surface/50 flex flex-col items-center justify-center text-center',
        className
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mb-4 border',
          isError
            ? 'bg-danger/10 border-danger/30 text-danger'
            : 'bg-surface-2 border-border text-accent'
        )}
      >
        <DisplayIcon className="w-6 h-6" />
      </div>

      <h3 className="font-mono text-base font-semibold text-text mb-1.5 flex items-center gap-1.5">
        <span className="text-text-muted select-none">//</span> {title}
      </h3>

      {description && (
        <p className="text-sm text-text-muted max-w-md mb-6">{description}</p>
      )}

      {actionLabel && onAction && (
        <Button
          variant={isError ? 'danger' : 'outline'}
          size="sm"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
