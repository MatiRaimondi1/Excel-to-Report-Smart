/**
 * @file ThemeContext.jsx
 * @description Contexto global y proveedor para la gestión del tema visual (claro / oscuro).
 * Provee persistencia en `localStorage`, detección automática de preferencias del sistema
 * operativo mediante `matchMedia`, y manipulación reactiva de la clase `.dark` en el elemento raíz del DOM (`<html>`).
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

/**
 * @typedef {Object} ThemeContextValue
 * @property {boolean} isDark - Indica si el tema oscuro se encuentra actualmente activo.
 * @property {() => void} toggleTheme - Alterna el tema actual entre modo claro y modo oscuro.
 * @property {(theme: "light" | "dark") => void} setTheme - Establece un tema específico ("light" o "dark").
 */

/**
 * Contexto de React para la administración del tema de la aplicación.
 * @type {React.Context<ThemeContextValue | null>}
 */
export const ThemeContext = createContext(null);

/**
 * Hook personalizado para acceder al estado y funciones de manipulación del tema visual.
 * Si se utiliza fuera de un `ThemeProvider`, devuelve valores seguros por defecto (modo claro).
 *
 * @returns {ThemeContextValue} Objeto con el estado del tema y funciones de alternancia.
 * @example
 * const { isDark, toggleTheme, setTheme } = useTheme();
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context || { isDark: false, toggleTheme: () => {}, setTheme: () => {} };
};

/**
 * Sincroniza el estado del tema con el DOM agregando o quitando la clase `.dark`
 * en `document.documentElement` y persistiendo la selección en `localStorage`.
 *
 * @param {boolean} dark - `true` para activar modo oscuro, `false` para modo claro.
 * @returns {void}
 */
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

/**
 * Proveedor de contexto para el tema visual de la aplicación.
 * Detecta y gestiona el estado del tema con sincronización hacia `localStorage` y el DOM.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Elementos hijos que consumirán el contexto.
 * @returns {JSX.Element} Proveedor de contexto `ThemeContext.Provider`.
 */
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

  /**
   * Alterna el tema actual entre claro y oscuro.
   */
  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      applyThemeToDOM(next);
      return next;
    });
  };

  /**
   * Establece explícitamente el tema a "dark" o "light".
   *
   * @param {"light" | "dark"} theme - Nombre del tema a activar.
   */
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
