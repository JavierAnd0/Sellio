'use client';

import Link from 'next/link';
import { type FormEvent, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Alert, Button, FormField, Input, Separator } from '@sellio/ui';
import { createClient } from '@sellio/db/client';

import { registerAction } from '@/actions/auth/register.action';

function passwordStrength(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const STRENGTH_COLORS = ['', '#FF4444', '#E8B96A', '#4FC3F7', '#52D699'];

export function RegisterForm() {
  const t = useTranslations('auth.register');

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isPendingGoogle, setIsPendingGoogle] = useState(false);

  const strength = passwordStrength(password);
  const STRENGTH_LABELS = ['', t('strengthWeak'), t('strengthFair'), t('strengthGood'), t('strengthStrong')];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await registerAction(new FormData(e.currentTarget));
      if (!result.ok) {
        if (result.field) setFieldErrors({ [result.field]: result.error });
        else setError(result.error);
      }
    });
  };

  const handleGoogleSignIn = async () => {
    setIsPendingGoogle(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthErr) {
        setError(oauthErr.message);
        setIsPendingGoogle(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión con Google');
      setIsPendingGoogle(false);
    }
  };

  return (
    <div className="animate-fade-slide-in">
      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-fg">
          {t('title')}
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          {t('subtitle')}
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label={t('fullName')} htmlFor="fullName" error={fieldErrors.fullName} required>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder={t('fullNamePlaceholder')}
            error={!!fieldErrors.fullName}
          />
        </FormField>

        <FormField label={t('businessName')} htmlFor="businessName" error={fieldErrors.businessName} required>
          <Input
            id="businessName"
            name="businessName"
            type="text"
            autoComplete="organization"
            placeholder={t('businessNamePlaceholder')}
            error={!!fieldErrors.businessName}
          />
        </FormField>

        <FormField label={t('email')} htmlFor="email" error={fieldErrors.email} required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            error={!!fieldErrors.email}
          />
        </FormField>

        <FormField label={t('password')} htmlFor="password" error={fieldErrors.password} required>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-fg transition-colors"
              tabIndex={-1}
            >
              {showPass ? t('hidePassword') : t('showPassword')}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? STRENGTH_COLORS[strength] : 'rgb(var(--surface-2))' }}
                  />
                ))}
              </div>
              {strength > 0 && (
                <p className="mt-1 text-xs" style={{ color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </p>
              )}
            </div>
          )}
        </FormField>

        <Button type="submit" fullWidth loading={isPending} className="mt-2">
          {t('createAccount')}
        </Button>
      </form>

      <Separator label={t('orContinueWith')} className="my-5" />

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending || isPendingGoogle}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-fg hover:bg-surface hover:border-muted active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {isPendingGoogle ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted/30 border-t-muted" />
        ) : (
          <GoogleIcon />
        )}
        {t('continueWithGoogle')}
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="font-semibold text-coral hover:opacity-80 transition-opacity">
          {t('signIn')}
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-muted">
        {t('terms')}{' '}
        <a href="#" className="underline hover:text-fg transition-colors">
          {t('termsLink')}
        </a>
        .
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
