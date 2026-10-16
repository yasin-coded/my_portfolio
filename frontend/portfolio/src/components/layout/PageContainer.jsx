import { cn } from '../../utils/cn';

export function PageContainer({ children, className, as: Component = 'div', ...props }) {
  return (
    <Component
      className={cn(
        'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default PageContainer;
