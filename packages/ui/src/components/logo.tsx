import { cn } from '../cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { box: 'h-7 w-7 text-xs', text: 'text-base' },
  md: { box: 'h-9 w-9 text-sm', text: 'text-xl' },
  lg: { box: 'h-12 w-12 text-lg', text: 'text-2xl' },
};

export function Logo({ size = 'md', className }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-coral font-display font-extrabold text-white',
          s.box,
        )}
      >
        S
      </div>
      <span className={cn('font-display font-extrabold tracking-tight text-fg', s.text)}>
        Sellio<span className="text-coral">.</span>
      </span>
    </div>
  );
}
