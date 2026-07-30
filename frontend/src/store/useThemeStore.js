import { create } from "zustand";

// Keep in sync with the pre-paint fallback in index.html
const DEFAULT_THEME = "autumn";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("preferred-theme") || DEFAULT_THEME,
  setTheme: (theme) => {
    localStorage.setItem("preferred-theme", theme);
    set({ theme });
  },
}));
