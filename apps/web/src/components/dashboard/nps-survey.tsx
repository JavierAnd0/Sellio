'use client';

import { useEffect, useState } from 'react';
import { checkNpsEligibility, submitNpsResponse } from '@/actions/nps/nps.actions';
import type { NpsEligibility } from '@/actions/nps/nps.actions';

const DISMISSED_KEY = 'nps_dismissed_until';

export function NpsSurvey() {
  const [eligibility, setEligibility] = useState<NpsEligibility | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;
    checkNpsEligibility().then(setEligibility);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setEligibility({ shouldShow: false });
  };

  const handleSubmit = async () => {
    if (selected === null) return;
    setSubmitting(true);
    const result = await submitNpsResponse(selected);
    if (result.ok) {
      setDone(true);
      setTimeout(() => setEligibility({ shouldShow: false }), 2500);
    }
    setSubmitting(false);
  };

  if (!eligibility?.shouldShow) return null;

  if (done) {
    return (
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-surface/95 backdrop-blur-sm px-4 py-4 flex items-center justify-center gap-2 animate-fadeUp">
        <span className="text-sm font-semibold text-fg">¡Gracias por tu feedback!</span>
        <span className="text-sm">🙌</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-surface/95 backdrop-blur-sm px-4 py-3 animate-fadeUp">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-[13px] font-semibold text-fg shrink-0">
          ¿Cuánto recomendarías Sellio?
        </p>

        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${
                selected === i
                  ? 'bg-[#E8341A] text-white scale-110 shadow-lg shadow-coral/30'
                  : i <= 6
                    ? 'bg-red-950/40 text-red-400 hover:bg-red-900/50'
                    : i <= 8
                      ? 'bg-yellow-950/40 text-yellow-400 hover:bg-yellow-900/50'
                      : 'bg-green-950/40 text-green-400 hover:bg-green-900/50'
              }`}
            >
              {i}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto shrink-0">
          <button
            onClick={handleSubmit}
            disabled={selected === null || submitting}
            className="px-4 py-1.5 rounded-lg bg-[#E8341A] text-white text-[12px] font-bold disabled:opacity-40 hover:bg-[#D02B13] transition-colors"
          >
            {submitting ? '...' : 'Enviar'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted hover:text-fg transition-colors"
          >
            Después
          </button>
        </div>
      </div>
    </div>
  );
}
