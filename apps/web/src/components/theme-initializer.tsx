'use client';

import { useServerInsertedHTML } from 'next/navigation';

export function ThemeInitializer() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-initializer"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('sellio-theme');if(t==='dark'||t==='light'){document.documentElement.classList.add(t)}}catch(e){}})()`,
        }}
      />
    );
  });

  return null;
}
