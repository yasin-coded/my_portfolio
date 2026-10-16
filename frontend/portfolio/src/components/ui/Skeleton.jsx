import { cn } from '../../utils/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-surface-2', className)}
      {...props}
    />
  );
}

export function CardSkeleton({ lines = 3, hasCover = true, className }) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg overflow-hidden p-5 flex flex-col gap-4 animate-pulse',
        className
      )}
    >
      {hasCover && <Skeleton className="w-full h-44 rounded-md" />}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/40">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export default Skeleton;
