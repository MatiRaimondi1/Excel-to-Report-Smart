import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ReportHistory from "../../src/components/ReportHistory";
import { renderWithMockData } from "../test-utils";

describe("Componente ReportHistory", () => {
  it("debe mostrar el estado vacío cuando no existen reportes guardados", () => {
    renderWithMockData(<ReportHistory />, { initialHistory: [] });

    expect(
      screen.getByText(/Historial de Reportes Generados/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No hay reportes en el historial/i),
    ).toBeInTheDocument();
  });

  it("debe listar los reportes previos con su metadata correspondiente", () => {
    const mockHistory = [
      {
        id: 101,
        timestamp: "08/10/2026, 14:30:00",
        fileName: "ventas_enero.xlsx",
        title: "Reporte Mensual Enero",
        theme: "indigo",
        rowCount: 50,
        colCount: 6,
      },
      {
        id: 102,
        timestamp: "08/10/2026, 15:00:00",
        fileName: "ventas_febrero.xlsx",
        title: "Reporte Mensual Febrero",
        theme: "emerald",
        rowCount: 45,
        colCount: 6,
      },
    ];

    renderWithMockData(<ReportHistory />, { initialHistory: mockHistory });

    expect(screen.getByText("Reporte Mensual Enero")).toBeInTheDocument();
    expect(screen.getByText("Reporte Mensual Febrero")).toBeInTheDocument();
    expect(screen.getByText("ventas_enero.xlsx")).toBeInTheDocument();
    expect(screen.getByText("ventas_febrero.xlsx")).toBeInTheDocument();
    expect(screen.getByText(/50 filas/i)).toBeInTheDocument();
  });

  it("debe permitir eliminar un reporte individual del historial", () => {
    const mockHistory = [
      {
        id: 101,
        timestamp: "08/10/2026, 14:30:00",
        fileName: "ventas_enero.xlsx",
        title: "Reporte Mensual Enero",
        theme: "indigo",
        rowCount: 50,
        colCount: 6,
      },
    ];

    renderWithMockData(<ReportHistory />, { initialHistory: mockHistory });

    expect(screen.getByText("Reporte Mensual Enero")).toBeInTheDocument();

    const deleteBtn = screen.getByTitle(/Eliminar del historial/i);
    fireEvent.click(deleteBtn);

    expect(screen.queryByText("Reporte Mensual Enero")).not.toBeInTheDocument();
    expect(
      screen.getByText(/No hay reportes en el historial/i),
    ).toBeInTheDocument();
  });

  it("debe permitir vaciar todo el historial con el botón Vaciar Historial", () => {
    const mockHistory = [
      {
        id: 101,
        timestamp: "08/10/2026",
        fileName: "a.xlsx",
        title: "Reporte 1",
        theme: "indigo",
        rowCount: 10,
        colCount: 4,
      },
      {
        id: 102,
        timestamp: "08/10/2026",
        fileName: "b.xlsx",
        title: "Reporte 2",
        theme: "emerald",
        rowCount: 20,
        colCount: 4,
      },
    ];

    renderWithMockData(<ReportHistory />, { initialHistory: mockHistory });

    const clearAllBtn = screen.getByRole("button", { name: /Vaciar Historial/i });
    fireEvent.click(clearAllBtn);

    expect(screen.queryByText("Reporte 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Reporte 2")).not.toBeInTheDocument();
    expect(
      screen.getByText(/No hay reportes en el historial/i),
    ).toBeInTheDocument();
  });
});
