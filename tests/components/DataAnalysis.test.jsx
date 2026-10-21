import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import DataAnalysis from "../../src/components/DataAnalysis";
import {
  renderWithMockData,
  mockSalesData,
  mockSalesColumns,
  mockTextOnlyData,
  mockTextOnlyColumns,
} from "../test-utils";

describe("Componente DataAnalysis", () => {
  it("debe calcular y mostrar los KPIs numéricos correctamente", () => {
    renderWithMockData(<DataAnalysis />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    expect(
      screen.getByText(/Análisis Estadístico e Indicadores \(KPIs\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Resumen Métrico Numérico/i)).toBeInTheDocument();
    expect(screen.getByText(/Suma Total/i)).toBeInTheDocument();
    expect(screen.getByText(/Promedio/i)).toBeInTheDocument();
    expect(screen.getByText(/Valor Mínimo/i)).toBeInTheDocument();
    expect(screen.getByText(/Valor Máximo/i)).toBeInTheDocument();
    expect(screen.getByText(/Visualización Gráfica/i)).toBeInTheDocument();
  });

  it("debe permitir cambiar la métrica seleccionada y recalcular las estadísticas", () => {
    renderWithMockData(<DataAnalysis />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const metricSelects = screen.getAllByRole("combobox");
    const metricSelect = metricSelects[0];

    fireEvent.change(metricSelect, { target: { value: "Ventas" } });

    expect(screen.getByText(/3[.,]680/)).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText(/1[.,]500/)).toBeInTheDocument();
  });

  it("debe renderizar el gráfico Recharts en la vista previa", () => {
    renderWithMockData(<DataAnalysis />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const responsiveContainer = screen.getByTestId("responsive-container");
    expect(responsiveContainer).toBeInTheDocument();
  });

  it("debe manejar adecuadamente datasets sin columnas numéricas", () => {
    renderWithMockData(<DataAnalysis />, {
      initialData: mockTextOnlyData,
      initialColumns: mockTextOnlyColumns,
    });

    expect(
      screen.getByText(
        /No se detectaron columnas numéricas continuas para calcular estadísticas avanzadas/i,
      ),
    ).toBeInTheDocument();
  });

  it("debe colapsar y expandir la sección de análisis", () => {
    renderWithMockData(<DataAnalysis />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const header = screen
      .getByText(/Análisis Estadístico e Indicadores \(KPIs\)/i)
      .closest("div");

    expect(screen.getByText(/Resumen Métrico Numérico/i)).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByText(/Resumen Métrico Numérico/i)).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByText(/Resumen Métrico Numérico/i)).toBeInTheDocument();
  });
});
