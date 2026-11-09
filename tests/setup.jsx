/**
 * @file setup.jsx
 * @description Configuración inicial global del entorno de ejecución de pruebas con Vitest y JSDOM.
 * Establece la limpieza del DOM y `localStorage` tras cada test, e implementa mocks globales
 * para interfaces no soportadas de manera nativa por JSDOM (`ResizeObserver`, `window.print`,
 * `URL.createObjectURL`, `URL.revokeObjectURL` y el contenedor `ResponsiveContainer` de Recharts).
 */

import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Hook de ciclo de vida ejecutado después de cada caso de prueba individual.
 * Realiza el desmontaje limpio de árboles de React, resetea mocks y vacía el almacenamiento local.
 */
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

/**
 * Mock de la API nativa `ResizeObserver` ausente en el entorno headless JSDOM.
 * Requerida para evitar excepciones durante el renderizado de gráficos y contenedores reactivos.
 */
class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}
window.ResizeObserver = ResizeObserverMock;
globalThis.ResizeObserver = ResizeObserverMock;

/**
 * Mock global para la API `window.print` utilizada en la generación de reportes PDF.
 */
window.print = vi.fn();

/**
 * Mock para generación y revocación de URLs de objetos Blob en el navegador.
 */
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock-blob");
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = vi.fn();
}

/**
 * Mock de la biblioteca Recharts para simplificar el renderizado en JSDOM
 * asignando dimensiones estáticas fijas al contenedor responsivo.
 */
vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ResponsiveContainer: ({ children, width = 800, height = 400 }) => (
      <div
        className="recharts-responsive-container"
        style={{ width, height, minWidth: 200, minHeight: 200 }}
        data-testid="responsive-container"
      >
        {children}
      </div>
    ),
  };
});
