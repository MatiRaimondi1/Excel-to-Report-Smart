import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../src/context/ThemeContext";

function TestConsumer() {
  const { isDark, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-status">{isDark ? "oscuro" : "claro"}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
    </div>
  );
}

describe("Contexto de Tema (ThemeContext)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("debe inicializar en modo claro por defecto si no hay preferencia en localStorage", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-status")).toHaveTextContent("claro");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("debe inicializar en modo oscuro si está configurado en localStorage", () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-status")).toHaveTextContent("oscuro");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("debe alternar el tema correctamente y persistirlo en localStorage", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    const toggleBtn = screen.getByRole("button", { name: "Toggle" });

    // Alternar a oscuro
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId("theme-status")).toHaveTextContent("oscuro");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    // Alternar a claro
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId("theme-status")).toHaveTextContent("claro");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("debe permitir cambiar directamente con setTheme", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Set Dark" }));
    expect(screen.getByTestId("theme-status")).toHaveTextContent("oscuro");
    expect(localStorage.getItem("theme")).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "Set Light" }));
    expect(screen.getByTestId("theme-status")).toHaveTextContent("claro");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("debe proveer valores de respaldo si useTheme es llamado fuera del ThemeProvider", () => {
    render(<TestConsumer />);
    expect(screen.getByTestId("theme-status")).toHaveTextContent("claro");
  });
});
