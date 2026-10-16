import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Badge = forwardRef(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'sm',
      clickable = false,
      active = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center font-mono font-medium rounded-full transition-colors duration-150 select-none';

    const variants = {
      default: 'bg-surface-2 text-text-muted border border-border',
      accent: 'bg-accent/15 text-accent border border-accent/30',
      success: 'bg-success/15 text-success border border-success/30',
      warning: 'bg-warning/15 text-warning border border-warning/30',
      danger: 'bg-danger/15 text-danger border border-danger/30',
      outline: 'bg-transparent text-text border border-border',
    };

    const activeStyles = active ? 'bg-accent text-on-accent border-accent' : '';
    const clickableStyles = clickable
      ? 'cursor-pointer hover:border-accent hover:text-accent'
      : '';

    const sizes = {
      sm: 'text-xs px-2.5 py-0.5 gap-1',
      md: 'text-sm px-3 py-1 gap-1.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          activeStyles,
          clickableStyles,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
export { Badge };
