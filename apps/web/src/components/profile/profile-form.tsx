'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Alert, Button, Input } from '@sellio/ui';
import type { Organization, Profile } from '@sellio/domain';

import { updateProfileAction } from '@/actions/profile/update-profile.action';
import { ThemeToggle } from '@/components/settings/theme-toggle';
import { LanguageToggle } from '@/components/settings/language-toggle';

interface ProfileFormProps {
  initialProfile: Profile | null;
  initialOrg: Organization | null;
  userEmail?: string;
}

export function ProfileForm({ initialProfile, initialOrg, userEmail = '' }: ProfileFormProps) {
  const t = useTranslations('settings.profile');
  const tPref = useTranslations('settings.preferences');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProfileAction(new FormData(e.currentTarget));
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error });
        else setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="rounded-2xl bg-surface shadow-sm border border-border/10 p-8 max-w-[700px]">
      <div className="mb-8">
        <h2 className="font-display text-[28px] font-black tracking-tight text-fg mb-1">
          {t('title')}
        </h2>
        <p className="text-[15px] text-muted">
          {t('subtitle')}
        </p>
      </div>

      {success && (
        <Alert variant="success" className="mb-6">
          {t('saveSuccess')}
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-bold text-fg">
              {t('username')} <span className="text-muted font-normal ml-1">{t('notEditable')}</span>
            </label>
            <Input
              readOnly
              disabled
              value={initialOrg?.slug || ''}
              className="h-[46px] rounded-xl border-border/20 shadow-sm px-4 bg-surface-2/60 cursor-not-allowed opacity-80"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[15px] font-bold text-fg">
              {t('email')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              readOnly
              value={userEmail}
              className="h-[46px] rounded-xl border-border/20 shadow-sm px-4 bg-surface-2/30 cursor-default"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="orgName" className="text-[15px] font-bold text-fg">
              {t('businessName')}
            </label>
            <Input
              id="orgName"
              name="orgName"
              type="text"
              defaultValue={initialOrg?.name || ''}
              error={!!fieldErrors.orgName}
              className="h-[46px] rounded-xl border-border/20 shadow-sm px-4"
            />
            {fieldErrors.orgName && (
              <p className="text-xs text-error">{fieldErrors.orgName}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-[15px] font-bold text-fg">
              {t('phone')}
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialProfile?.phone || ''}
              error={!!fieldErrors.phone}
              className="h-[46px] rounded-xl border-border/20 shadow-sm px-4"
            />
            {fieldErrors.phone && (
              <p className="text-xs text-error">{fieldErrors.phone}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            loading={isPending}
            className="bg-[#E8341A] hover:bg-[#D02B13] text-white font-bold px-6 py-3.5 h-auto rounded-xl shadow-sm transition-colors text-[15px]"
          >
            {t('saveChanges')}
          </Button>
        </div>
      </form>

      {/* Preferencias */}
      <div className="mt-8 pt-8 border-t border-border/10">
        <h3 className="text-[15px] font-bold text-fg mb-1">{tPref('title')}</h3>
        <p className="text-[13px] text-muted mb-2">{tPref('subtitle')}</p>
        <div className="divide-y divide-border/10">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
