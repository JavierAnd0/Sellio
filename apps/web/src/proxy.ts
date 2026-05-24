import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware que:
 *   1. Refresca la sesión de Supabase en cada request
 *   2. Protege rutas bajo /app/* redirigiendo a /login si no hay sesión
 *
 * Las cookies se escriben en la response para mantener sync.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const pathname = request.nextUrl.pathname;

  // Proteger rutas /app/* y /onboarding
  if ((pathname.startsWith('/app') || pathname.startsWith('/onboarding')) && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirigir a dashboard si está autenticado y entra a auth pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Si está autenticado y accede al panel (/app/*), validar su estado de suscripción y trial
  if (user && pathname.startsWith('/app')) {
    const isBillingPath = pathname === '/app/settings/billing';
    const isApiPath = pathname.startsWith('/api');

    if (!isBillingPath && !isApiPath) {
      // Obtener la organización, plan, trial y suscripciones vinculadas en un solo query
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select(`
          org_id,
          organizations (
            plan,
            trial_ends_at,
            subscriptions (
              status
            )
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      const org = orgMember?.organizations as any;
      if (org) {
        const isTrialExpired = org.trial_ends_at && new Date(org.trial_ends_at) < new Date();

        // Si el trial ya expiró y sigue en plan gratuito ('free')
        if (isTrialExpired && org.plan === 'free') {
          const sub = Array.isArray(org.subscriptions) ? org.subscriptions[0] : org.subscriptions;
          if (!sub || sub.status !== 'active') {
            // Redirigir a facturación con parámetro de expiración
            const billingUrl = new URL('/app/settings/billing', request.url);
            billingUrl.searchParams.set('expired', 'true');
            return NextResponse.redirect(billingUrl);
          }
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/app/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
  ],
};
