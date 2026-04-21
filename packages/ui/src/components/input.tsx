import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-md border bg-surface-2 px-4 text-sm text-fg outline-none transition-all placeholder:text-muted',
        'focus:border-coral/50 focus:shadow-[0_0_0_3px_rgba(232,52,26,0.1)]',
        error ? 'border-error' : 'border-border',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
