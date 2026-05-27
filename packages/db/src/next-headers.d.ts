declare module 'next/headers' {
  export function cookies(): Promise<{
    getAll(): { name: string; value: string }[];
    set(name: string, value: string, options?: unknown): void;
  }>;
}
