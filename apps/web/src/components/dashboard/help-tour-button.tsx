'use client';

import { Sparkle } from 'lucide-react';

export function HelpTourButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('start-sellio-tour'));
        }
      }}
      className="text-xs font-bold text-[#E8341A] hover:text-[#D02B13] bg-[#E8341A]/5 hover:bg-[#E8341A]/10 border border-[#E8341A]/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-sm"
    >
      <Sparkle size={14} /> Ayuda interactiva
    </button>
  );
}
