import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import GraphicsModule from "../../src/components/GraphicsModule";
import {
  renderWithMockData,
  mockSalesData,
  mockSalesColumns,
  mockTextOnlyData,
  mockTextOnlyColumns,
} from "../test-utils";

describe("Componente GraphicsModule (Recharts)", () => {
  it("debe renderizar el módulo de gráficos interactivos", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    expect(
      screen.getByText(/Módulo de Gráficos Interactivos/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total Agregado/i)).toBeInTheDocument();
    expect(screen.getByText(/Promedio por Categoría/i)).toBeInTheDocument();
    expect(screen.getByText(/Categorías Graficadas/i)).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("debe permitir alternar entre los 7 tipos de gráficos", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const types = [
      "Barras",
      "Horizontal",
      "Líneas",
      "Áreas",
      "Pastel",
      "Dona",
      "Compuesto",
    ];

    types.forEach((typeLabel) => {
      const button = screen.getByRole("button", { name: new RegExp(typeLabel, "i") });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  it("debe permitir cambiar el Eje X, la Métrica Principal y la función de agregación", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const categorySelect = screen.getByLabelText(/Eje X \(Categoría\):/i);
    const metricSelect = screen.getByLabelText(/Métrica Principal \(Y\):/i);
    const aggSelect = screen.getByLabelText(/Agregación:/i);

    fireEvent.change(categorySelect, { target: { value: "Categoria" } });
    fireEvent.change(metricSelect, { target: { value: "Ventas" } });
    fireEvent.change(aggSelect, { target: { value: "avg" } });

    expect(screen.getByText(/Total Agregado/i)).toBeInTheDocument();
  });

  it("debe permitir cambiar el límite Top N y el orden de los datos", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const limitSelect = screen.getByLabelText(/Mostrar \(Top N\):/i);
    const sortSelect = screen.getByLabelText(/Orden de Datos:/i);

    fireEvent.change(limitSelect, { target: { value: "5" } });
    fireEvent.change(sortSelect, { target: { value: "asc" } });

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("debe permitir cambiar la paleta de colores", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const indigoPaletteBtn = screen.getByTitle(/Índigo Ejecutivo/i);
    fireEvent.click(indigoPaletteBtn);

    const vibrantPaletteBtn = screen.getByTitle(/Multicolor Vibrante/i);
    fireEvent.click(vibrantPaletteBtn);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("debe permitir activar y desactivar los conmutadores de Cuadrícula y Leyenda", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const gridCheckbox = screen.getByLabelText(/Cuadrícula/i);
    const legendCheckbox = screen.getByLabelText(/Leyenda/i);

    expect(gridCheckbox).toBeChecked();
    expect(legendCheckbox).toBeChecked();

    fireEvent.click(gridCheckbox);
    expect(gridCheckbox).not.toBeChecked();

    fireEvent.click(legendCheckbox);
    expect(legendCheckbox).not.toBeChecked();
  });

  it("debe manejar datasets que contienen únicamente columnas de texto usando agregación por conteo", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockTextOnlyData,
      initialColumns: mockTextOnlyColumns,
    });

    expect(screen.getByText(/Total Agregado \(Filas\)/i)).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("debe tener botón para exportar a imagen PNG", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const exportBtn = screen.getByRole("button", { name: /Exportar PNG/i });
    expect(exportBtn).toBeInTheDocument();

    fireEvent.click(exportBtn);
  });

  it("debe permitir colapsar y expandir el panel", () => {
    renderWithMockData(<GraphicsModule />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const header = screen
      .getByText(/Módulo de Gráficos Interactivos/i)
      .closest("div");

    expect(screen.getByText(/Paleta de color:/i)).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByText(/Paleta de color:/i)).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByText(/Paleta de color:/i)).toBeInTheDocument();
  });
});
