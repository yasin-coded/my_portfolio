import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-xs font-medium text-text-muted flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-danger">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none shrink-0 flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'w-full bg-surface-2 border border-border rounded-md px-3.5 py-2 font-mono text-sm text-text placeholder:text-text-muted/60 transition-colors duration-200 outline-none',
              'focus:border-accent focus:ring-1 focus:ring-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-danger focus:border-danger focus:ring-danger text-danger',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-text-muted shrink-0 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-danger font-mono mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-text-muted font-mono mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      id,
      className,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-xs font-medium text-text-muted flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-danger">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full bg-surface-2 border border-border rounded-md px-3.5 py-2 font-mono text-sm text-text placeholder:text-text-muted/60 transition-colors duration-200 outline-none resize-y',
            'focus:border-accent focus:ring-1 focus:ring-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-danger focus:border-danger focus:ring-danger text-danger',
            className
          )}
          {...props}
        />

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-danger font-mono mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-text-muted font-mono mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export default Input;
export { Input, Textarea };
