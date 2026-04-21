import { type HTMLAttributes } from 'react';

import { cn } from '../cn';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function Separator({ label, className, ...props }: SeparatorProps) {
  if (!label) {
    return (
      <div
        role="separator"
        className={cn('h-px w-full bg-border/20', className)}
        {...props}
      />
    );
  }

  return (
    <div
      role="separator"
      className={cn('flex items-center gap-3', className)}
      {...props}
    >
      <div className="h-px flex-1 bg-border/20" />
      <span className="whitespace-nowrap text-xs text-muted">{label}</span>
      <div className="h-px flex-1 bg-border/20" />
    </div>
  );
}
