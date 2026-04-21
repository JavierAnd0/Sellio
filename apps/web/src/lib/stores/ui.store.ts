'use client';

import { create } from 'zustand';

interface UiStore {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}));
