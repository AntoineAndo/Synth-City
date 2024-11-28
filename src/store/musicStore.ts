import { create } from "zustand";

export interface MusicStore {
  isPlaying: boolean;
  getIsPlaying: () => boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  isPlaying: false,
  getIsPlaying: () => get().isPlaying,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
