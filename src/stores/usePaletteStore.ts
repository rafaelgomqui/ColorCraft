import { create } from 'zustand';

interface PaletteState {
  colors: string[];
  setColors: (colors: string[]) => void;
  updateColor: (index: number, newColor: string) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  colors: ['#ff0000', '#ff8000', '#ff0080', '#00ffff', '#0080ff', '#00ff80'], // Harmony fan starting colors
  setColors: (colors) => set({ colors: colors.slice(0, 6) }),
  updateColor: (index, newColor) =>
    set((state) => {
      const newColors = [...state.colors];
      newColors[index] = newColor;
      return { colors: newColors };
    }),
}));
