import { Logo } from '@sellio/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <Logo size="lg" />
      <p className="mt-8 text-center text-sm text-muted">
        Esta es la app para clientes finales. Cada tarjeta vive en <code>/c/[slug]</code>.
      </p>
    </main>
  );
}
