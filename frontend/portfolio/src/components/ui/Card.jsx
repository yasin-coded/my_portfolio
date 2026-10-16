import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Card = forwardRef(({ className, hoverable = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-surface border border-border rounded-lg text-text shadow-sm transition-all duration-200 overflow-hidden',
      hoverable && 'hover:border-accent/50 hover:shadow-md hover:-translate-y-0.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-5 border-b border-border/60 flex flex-col gap-1.5', className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef(({ className, as: Component = 'h3', children, ...props }, ref) => (
  <Component
    ref={ref}
    className={cn('font-mono text-lg font-semibold tracking-tight text-text', className)}
    {...props}
  >
    {children}
  </Component>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-muted', className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-5', className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-5 border-t border-border/60 flex items-center gap-3', className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

export default Card;
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
