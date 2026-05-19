import type { ReactNode } from 'react';

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-bg">
      {children}
    </div>
  );
}
