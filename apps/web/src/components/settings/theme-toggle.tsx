'use client';

import { useEffect, useState } from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Theme = 'system' | 'light' | 'dark';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (theme !== 'system') root.classList.add(theme);
  try { localStorage.setItem('sellio-theme', theme); } catch {}
}

export function ThemeToggle() {
  const t = useTranslations('theme');
  const tPref = useTranslations('settings.preferences');
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sellio-theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') setTheme(saved);
    } catch {}
  }, []);

  function select(v: Theme) {
    setTheme(v);
    applyTheme(v);
  }

  const options: { value: Theme; Icon: typeof Monitor }[] = [
    { value: 'system', Icon: Monitor },
    { value: 'light',  Icon: Sun     },
    { value: 'dark',   Icon: Moon    },
  ];

  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] text-fg">{tPref('appearance')}</span>
      <div className="flex items-center gap-0.5 rounded-xl bg-surface-2 p-1">
        {options.map(({ value, Icon }) => (
          <button
            key={value}
            type="button"
            title={t(value)}
            onClick={() => select(value)}
            className={[
              'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
              theme === value
                ? 'bg-surface-2 dark:bg-surface shadow-sm text-fg'
                : 'text-muted hover:text-fg',
            ].join(' ')}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
    </div>
  );
}
