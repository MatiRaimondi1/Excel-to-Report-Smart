/**
 * @file vite.config.js
 * @description Configuración principal de empaquetado y servidor de desarrollo con Vite.
 * Integra el compilador de React (`@vitejs/plugin-react`), Tailwind CSS v4 (`@tailwindcss/vite`),
 * y define el entorno de ejecución para pruebas automatizadas con Vitest y JSDOM.
 */

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.jsx",
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
    },
  },
});
