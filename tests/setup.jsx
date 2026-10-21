import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

class ResizeObserverMock {
  observe() { }
  unobserve() { }
  disconnect() { }
}
window.ResizeObserver = ResizeObserverMock;
globalThis.ResizeObserver = ResizeObserverMock;

window.print = vi.fn();

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock-blob");
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = vi.fn();
}

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
