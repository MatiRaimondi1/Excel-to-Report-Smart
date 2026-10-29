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

  it("debe permitir volver a descargar un reporte PDF previamente exportado desde el historial", () => {
    const mockHistory = [
      {
        id: 101,
        timestamp: "08/10/2026, 14:30:00",
        fileName: "ventas_enero.xlsx",
        title: "Reporte Mensual Enero",
        theme: "indigo",
        rowCount: 2,
        colCount: 2,
        columns: ["Producto", "Total"],
        data: [
          { Producto: "Notebook Pro", Total: 1200 },
          { Producto: "Mouse USB", Total: 25 },
        ],
      },
    ];

    renderWithMockData(<ReportHistory />, { initialHistory: mockHistory });

    const downloadButtons = screen.getAllByRole("button", {
      name: /Volver a descargar/i,
    });
    expect(downloadButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(downloadButtons[0]);

    expect(window.print).toHaveBeenCalledTimes(1);

    const printableArea = document.getElementById("pdf-printable-area");
    expect(printableArea).toBeInTheDocument();
    expect(printableArea).toHaveTextContent("Reporte Mensual Enero");
    expect(printableArea).toHaveTextContent("Notebook Pro");
    expect(printableArea).toHaveTextContent("Mouse USB");
  });

  it("debe abrir y cerrar la vista previa del reporte histórico y permitir descargarlo desde el modal", () => {
    const mockHistory = [
      {
        id: 101,
        timestamp: "08/10/2026, 14:30:00",
        fileName: "ventas_enero.xlsx",
        title: "Reporte Mensual Enero",
        theme: "indigo",
        rowCount: 2,
        colCount: 2,
        columns: ["Producto", "Total"],
        data: [{ Producto: "Notebook Pro", Total: 1200 }],
      },
    ];

    renderWithMockData(<ReportHistory />, { initialHistory: mockHistory });

    const previewButton = screen.getByTitle(/Ver vista previa/i);
    fireEvent.click(previewButton);

    expect(
      screen.getByText(/Vista Previa del Reporte Histórico/i),
    ).toBeInTheDocument();

    const modalDownloadBtn = screen.getByRole("button", {
      name: /^Descargar PDF$/i,
    });
    fireEvent.click(modalDownloadBtn);
    expect(window.print).toHaveBeenCalled();

    const closeBtn = screen.getByLabelText(/Cerrar vista previa/i);
    fireEvent.click(closeBtn);
    expect(
      screen.queryByText(/Vista Previa del Reporte Histórico/i),
    ).not.toBeInTheDocument();
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
