import { forwardRef, type LabelHTMLAttributes } from 'react';

import { cn } from '../cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block text-xs font-semibold uppercase tracking-wider text-muted',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-error">*</span>}
    </label>
  ),
);
Label.displayName = 'Label';
