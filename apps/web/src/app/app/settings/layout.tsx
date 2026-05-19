import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { SettingsNav } from '@/components/settings/settings-nav';

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('settings');

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted mb-2">{t('breadcrumb')}</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-fg">
          {t('title')}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <aside className="w-full md:w-[260px] shrink-0">
          <SettingsNav />
        </aside>

        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
