import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Button = forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      type = 'button',
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono font-medium select-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] border';

    const variants = {
      primary:
        'bg-accent text-on-accent border-accent hover:bg-accent-hover hover:border-accent-hover shadow-sm',
      secondary:
        'bg-surface-2 text-text border-border hover:bg-surface hover:border-accent/40',
      outline:
        'bg-transparent text-text border-border hover:border-accent hover:text-accent',
      ghost:
        'bg-transparent border-transparent text-text hover:bg-surface-2 hover:text-accent',
      danger:
        'bg-danger text-white border-danger hover:opacity-90',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded min-h-[32px] gap-1.5',
      md: 'text-sm px-4 py-2 rounded-md min-h-[40px] gap-2',
      lg: 'text-base px-6 py-2.5 rounded-md min-h-[48px] gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };
