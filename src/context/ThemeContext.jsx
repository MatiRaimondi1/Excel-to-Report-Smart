/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context || { isDark: false, toggleTheme: () => {}, setTheme: () => {} };
};


const applyThemeToDOM = (dark) => {
  if (typeof document !== "undefined") {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });

  // Sincronizar en el montaje inicial y cuando cambie el estado
  useEffect(() => {
    applyThemeToDOM(isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      applyThemeToDOM(next);
      return next;
    });
  };

  const setTheme = (theme) => {
    const next = theme === "dark";
    applyThemeToDOM(next);
    setIsDark(next);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
