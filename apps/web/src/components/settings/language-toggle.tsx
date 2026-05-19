'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocaleAction } from '@/actions/locale/set-locale.action';

const LOCALES = [
  { value: 'es', flag: '🇨🇴', label: 'Español' },
  { value: 'en', flag: '🇺🇸', label: 'English' },
] as const;

export function LanguageToggle() {
  const t = useTranslations('settings.preferences');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(value: string) {
    startTransition(async () => {
      await setLocaleAction(value);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] text-fg">{t('language')}</span>
      <div className="flex items-center gap-0.5 rounded-xl bg-surface-2 p-1">
        {LOCALES.map(({ value, flag, label }) => (
          <button
            key={value}
            type="button"
            title={label}
            disabled={isPending}
            onClick={() => select(value)}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3 h-8 text-[12px] font-semibold transition-all',
              locale === value
                ? 'bg-surface-2 dark:bg-surface shadow-sm text-fg'
                : 'text-muted hover:text-fg',
            ].join(' ')}
          >
            <span>{flag}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
