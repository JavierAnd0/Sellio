import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';

import { cn } from '../cn';

const alertVariants = cva(
  'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        error: 'border-error/30 bg-error/10 text-error',
        success: 'border-success/30 bg-success/10 text-success',
        info: 'border-info/30 bg-info/10 text-info',
        warning: 'border-warning/30 bg-warning/10 text-warning',
      },
    },
    defaultVariants: {
      variant: 'error',
    },
  },
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, children, ...props }: AlertProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      {children}
    </div>
  );
}
