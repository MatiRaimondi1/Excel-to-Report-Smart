import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../../src/App";
import { MockDataProvider, mockSalesData, mockSalesColumns } from "../test-utils";

describe("Aplicación Principal (App)", () => {
  it("debe renderizar la pantalla inicial con FileUpload cuando no hay datos cargados", () => {
    render(<App />);

    expect(screen.getByText("Excel-to-PDF")).toBeInTheDocument();
    expect(
      screen.getByText("Convierte tus planillas en reportes profesionales"),
    ).toBeInTheDocument();
    expect(screen.getByText("Crear un nuevo reporte")).toBeInTheDocument();
    expect(screen.getByText("Arrastra tu archivo Excel aquí")).toBeInTheDocument();
  });

  it("debe permitir navegar entre la pestaña de crear reporte y la pestaña de historial", () => {
    render(<App />);

    const historyTabBtn = screen.getByRole("button", { name: /Historial/i });
    fireEvent.click(historyTabBtn);

    expect(
      screen.getByText(/Historial de Reportes Generados/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No hay reportes en el historial/i),
    ).toBeInTheDocument();

    const createTabBtn = screen.getByRole("button", { name: /Crear reporte/i });
    fireEvent.click(createTabBtn);

    expect(screen.getByText("Arrastra tu archivo Excel aquí")).toBeInTheDocument();
  });

  it("debe renderizar todos los módulos funcionales cuando los datos están cargados", () => {
    render(
      <MockDataProvider
        initialData={mockSalesData}
        initialColumns={mockSalesColumns}
        initialFileName="ventas_globales.xlsx"
      >
        <App />
      </MockDataProvider>,
    );

    expect(screen.getAllByText("ventas_globales.xlsx").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Diagnóstico y Calidad de Datos/i)).toBeInTheDocument();
    expect(screen.getByText(/Análisis Estadístico e Indicadores \(KPIs\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Módulo de Gráficos Interactivos/i)).toBeInTheDocument();
    expect(screen.getByText(/Configuración y Vista Previa de Reporte PDF/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar en todos los datos.../i)).toBeInTheDocument();
  });
});
