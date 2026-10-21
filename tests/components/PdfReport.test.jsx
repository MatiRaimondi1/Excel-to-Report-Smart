import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import PdfReport from "../../src/components/PdfReport";
import { renderWithMockData, mockSalesData, mockSalesColumns } from "../test-utils";

describe("Componente PdfReport", () => {
  it("debe renderizar el panel de opciones y la vista previa del reporte PDF", () => {
    renderWithMockData(<PdfReport />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
      initialFileName: "ventas_anuales.xlsx",
    });

    expect(
      screen.getByText(/Configuración y Vista Previa de Reporte PDF/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Opciones de Personalización/i)).toBeInTheDocument();
    expect(screen.getByText(/Vista Previa del Documento Final:/i)).toBeInTheDocument();
    expect(screen.getByText(/ventas_anuales.xlsx/i)).toBeInTheDocument();
  });

  it("debe actualizar el título del reporte en tiempo real al editar el input", () => {
    renderWithMockData(<PdfReport />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const titleInput = screen.getByDisplayValue(/Reporte Operativo y Ejecutivo/i);
    fireEvent.change(titleInput, { target: { value: "Informe Trimestral Q1" } });

    expect(
      screen.getByRole("heading", { name: "Informe Trimestral Q1" }),
    ).toBeInTheDocument();
  });

  it("debe permitir cambiar el tema visual del reporte", () => {
    renderWithMockData(<PdfReport />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const themeSelect = screen.getByLabelText(/Tema \/ Estilo Visual/i);
    fireEvent.change(themeSelect, { target: { value: "indigo" } });
    expect(themeSelect.value).toBe("indigo");

    fireEvent.change(themeSelect, { target: { value: "emerald" } });
    expect(themeSelect.value).toBe("emerald");
  });

  it("debe permitir alternar la visibilidad de los KPIs y del gráfico dentro del PDF", () => {
    renderWithMockData(<PdfReport />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const kpiCheckbox = screen.getByLabelText(/Incluir Tarjetas de KPIs/i);
    const chartCheckbox = screen.getByLabelText(/Incluir Gráfico en PDF/i);

    expect(kpiCheckbox).toBeChecked();
    expect(chartCheckbox).toBeChecked();
    expect(screen.getByText(/Total Filas Procesadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Resumen Gráfico/i)).toBeInTheDocument();

    fireEvent.click(kpiCheckbox);
    expect(kpiCheckbox).not.toBeChecked();
    expect(screen.queryByText(/Total Filas Procesadas/i)).not.toBeInTheDocument();

    fireEvent.click(chartCheckbox);
    expect(chartCheckbox).not.toBeChecked();
    expect(screen.queryByText(/Resumen Gráfico/i)).not.toBeInTheDocument();
  });

  it("debe disparar window.print al hacer clic en 'Exportar a PDF'", () => {
    renderWithMockData(<PdfReport />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const printButton = screen.getByRole("button", {
      name: /Exportar a PDF/i,
    });

    fireEvent.click(printButton);

    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("debe permitir colapsar y expandir el panel de configuración", () => {
    renderWithMockData(<PdfReport />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const header = screen
      .getByText(/Configuración y Vista Previa de Reporte PDF/i)
      .closest("div");

    expect(screen.getByText(/Opciones de Personalización/i)).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByText(/Opciones de Personalización/i)).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByText(/Opciones de Personalización/i)).toBeInTheDocument();
  });
});
