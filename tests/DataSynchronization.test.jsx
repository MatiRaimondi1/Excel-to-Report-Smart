import { describe, it, expect } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import DataExplorer from "../src/components/DataExplorer";
import PdfReport from "../src/components/PdfReport";
import GraphicsModule from "../src/components/GraphicsModule";
import ReportHistory from "../src/components/ReportHistory";
import { renderWithMockData, mockSalesData, mockSalesColumns } from "./test-utils";

function TestSyncApp() {
  return (
    <div>
      <DataExplorer />
      <GraphicsModule />
      <PdfReport />
      <ReportHistory />
    </div>
  );
}

describe("Sincronización en Tiempo Real: DataExplorer -> PdfReport y GraphicsModule", () => {
  it("debe actualizar los registros y KPIs en PdfReport al filtrar por búsqueda en DataExplorer", () => {
    renderWithMockData(<TestSyncApp />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
      initialFileName: "ventas_global.xlsx",
    });

    const pdfArea = document.getElementById("pdf-printable-area");
    expect(pdfArea).toBeInTheDocument();
    expect(within(pdfArea).getByText("Laptop Pro")).toBeInTheDocument();
    expect(within(pdfArea).getByText("Monitor 4K")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar en todos los datos.../i);
    fireEvent.change(searchInput, { target: { value: "Silla" } });

    // PdfReport debe actualizarse inmediatamente mostrando solo la fila filtrada
    expect(within(pdfArea).getByText("Silla Ergonómica")).toBeInTheDocument();
    expect(within(pdfArea).queryByText("Laptop Pro")).not.toBeInTheDocument();
    expect(within(pdfArea).queryByText("Monitor 4K")).not.toBeInTheDocument();

    // KPI de total filas procesadas en PdfReport debe ser 1
    const kpiElements = within(pdfArea).getAllByText("1");
    expect(kpiElements.length).toBeGreaterThanOrEqual(1);
  });

  it("debe actualizar el orden de los registros en la tabla del PDF al ordenar una columna en DataExplorer", () => {
    renderWithMockData(<TestSyncApp />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const pdfArea = document.getElementById("pdf-printable-area");
    const searchInput = screen.getByPlaceholderText(/Buscar en todos los datos.../i);
    const dataExplorerCard = searchInput.closest(".overflow-hidden");
    const dataExplorerTable = dataExplorerCard.querySelector("table");

    const productoHeader = within(dataExplorerTable).getByRole("columnheader", {
      name: /Producto/i,
    });

    // Clic para ordenar ascendente
    fireEvent.click(productoHeader);

    const pdfRowsAsc = within(pdfArea).getAllByRole("row");
    // Fila 0 es thead, Fila 1 es primer registro
    expect(pdfRowsAsc[1]).toHaveTextContent("Escritorio Elevable");

    // Clic para ordenar descendente
    fireEvent.click(productoHeader);

    const pdfRowsDesc = within(pdfArea).getAllByRole("row");
    expect(pdfRowsDesc[1]).toHaveTextContent("Teclado Mecánico");
  });

  it("debe restaurar los datos completos en PdfReport y GraphicsModule al limpiar los filtros", () => {
    renderWithMockData(<TestSyncApp />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const searchInput = screen.getByPlaceholderText(/Buscar en todos los datos.../i);
    fireEvent.change(searchInput, { target: { value: "Teclado" } });

    const pdfArea = document.getElementById("pdf-printable-area");
    expect(within(pdfArea).getByText("Teclado Mecánico")).toBeInTheDocument();
    expect(within(pdfArea).queryByText("Laptop Pro")).not.toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: /Limpiar/i });
    fireEvent.click(clearBtn);

    expect(within(pdfArea).getByText("Laptop Pro")).toBeInTheDocument();
    expect(within(pdfArea).getByText("Teclado Mecánico")).toBeInTheDocument();
    expect(within(pdfArea).getByText("Monitor 4K")).toBeInTheDocument();
  });

  it("debe exportar un PDF con los datos filtrados y permitir volver a descargarlo desde el historial", () => {
    renderWithMockData(<TestSyncApp />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
      initialFileName: "ventas_tienda.xlsx",
    });

    // 1. Filtrar en DataExplorer por 'Mobiliario'
    const colSelect = screen.getByDisplayValue(/Filtrar por columna.../i);
    fireEvent.change(colSelect, { target: { value: "Categoria" } });

    const specificFilterInput = screen.getByPlaceholderText(/Filtrar Categoria.../i);
    fireEvent.change(specificFilterInput, { target: { value: "Mobiliario" } });

    // 2. Exportar a PDF
    const exportBtn = screen.getByRole("button", { name: /Exportar a PDF/i });
    fireEvent.click(exportBtn);

    expect(window.print).toHaveBeenCalledTimes(1);

    // 3. Verificar que en el historial aparezca el reporte con las filas filtradas (2 filas: Silla y Escritorio)
    const historyHeading = screen.getByText(/Historial de Reportes Generados/i);
    const historyCard = historyHeading.closest(".rounded-xl");
    expect(within(historyCard).getByText(/• 2 filas/i)).toBeInTheDocument();

    // 4. Volver a descargar el PDF desde el historial
    const redownloadButtons = within(historyCard).getAllByRole("button", { name: /Volver a descargar/i });
    fireEvent.click(redownloadButtons[0]);

    expect(window.print).toHaveBeenCalledTimes(2);

    const printableArea = document.getElementById("pdf-printable-area");
    expect(printableArea).toHaveTextContent("Silla Ergonómica");
    expect(printableArea).toHaveTextContent("Escritorio Elevable");
  });
});
