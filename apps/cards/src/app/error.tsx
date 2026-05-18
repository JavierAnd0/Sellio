'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12 text-center">
      <div className="mb-6 font-display text-6xl font-black text-muted opacity-40">500</div>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8341A] font-display text-xl font-black text-white">
        S
      </div>
      <h1 className="mb-3 font-display text-2xl font-black tracking-tight text-fg">
        Algo salió mal
      </h1>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted">
        Ups. Tuvimos un error inesperado. Inténtalo de nuevo.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-[#E8341A] px-6 py-3 font-display text-sm font-black text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
