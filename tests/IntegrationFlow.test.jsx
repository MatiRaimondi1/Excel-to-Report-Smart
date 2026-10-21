import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import App from "../src/App";
import { renderWithRealProvider } from "./test-utils";
import * as XLSX from "xlsx";

describe("Flujo Funcional de Integración (End-to-End)", () => {
  it(
    "debe ejecutar el ciclo de vida completo: carga de archivo, análisis, gráficos, exportación y consulta en historial",
    async () => {
      renderWithRealProvider(<App />);

      expect(screen.getByText("Excel-to-PDF")).toBeInTheDocument();
      expect(screen.getByText("Crear un nuevo reporte")).toBeInTheDocument();
      expect(screen.getByText(/Arrastra tu archivo Excel aquí/i)).toBeInTheDocument();

      const ws = XLSX.utils.json_to_sheet([
        { Producto: "Monitor UltraWide", Categoria: "Hardware", Ventas: 1200, Stock: 15 },
        { Producto: "Teclado Inalámbrico", Categoria: "Accesorios", Ventas: 150, Stock: 40 },
        { Producto: "Auriculares Noise-Canceling", Categoria: "Audio", Ventas: 350, Stock: 20 },
        { Producto: "Monitor UltraWide", Categoria: "Hardware", Ventas: 1200, Stock: 15 },
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Datos");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const testFile = new File([buffer], "reporte_anual_2026.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await vi.waitFor(() => {
        expect(screen.getAllByText("reporte_anual_2026.xlsx").length).toBeGreaterThanOrEqual(1);
      }, { timeout: 3000 });

      expect(screen.getByText(/Diagnóstico y Calidad de Datos/i)).toBeInTheDocument();
      expect(screen.getByText(/Análisis Estadístico e Indicadores \(KPIs\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Módulo de Gráficos Interactivos/i)).toBeInTheDocument();
      expect(screen.getByText(/Configuración y Vista Previa de Reporte PDF/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Buscar en todos los datos.../i)).toBeInTheDocument();

      expect(screen.getByText(/1 duplicados/i)).toBeInTheDocument();
      const removeDupBtn = screen.getByRole("button", {
        name: /Eliminar Duplicados \(1\)/i,
      });
      fireEvent.click(removeDupBtn);

      expect(screen.getByText(/0 duplicados/i)).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Buscar en todos los datos.../i);
      const dataExplorerCard = searchInput.closest(".overflow-hidden");
      const dataTable = dataExplorerCard.querySelector("table");

      fireEvent.change(searchInput, { target: { value: "Auriculares" } });
      expect(within(dataTable).getByText("Auriculares Noise-Canceling")).toBeInTheDocument();
      expect(within(dataTable).queryByText("Teclado Inalámbrico")).not.toBeInTheDocument();

      const clearSearchBtn = within(dataExplorerCard).getByRole("button", { name: /Limpiar/i });
      fireEvent.click(clearSearchBtn);
      expect(within(dataTable).getByText("Teclado Inalámbrico")).toBeInTheDocument();
      const titleInput = screen.getByLabelText(/Título del Reporte/i);
      fireEvent.change(titleInput, { target: { value: "Informe Ejecutivo Anual 2026" } });

      const exportBtn = screen.getByRole("button", { name: /Exportar a PDF/i });
      fireEvent.click(exportBtn);

      expect(window.print).toHaveBeenCalled();
      const historyNavBtn = screen.getByRole("button", { name: /Historial/i });
      fireEvent.click(historyNavBtn);

      expect(screen.getByText("Informe Ejecutivo Anual 2026")).toBeInTheDocument();
      expect(screen.getAllByText(/reporte_anual_2026\.xlsx/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/filas/i)).toHaveTextContent(/3 filas/);

      const deleteBtn = screen.getByTitle(/Eliminar del historial/i);
      fireEvent.click(deleteBtn);

      expect(screen.getByText(/No hay reportes en el historial/i)).toBeInTheDocument();

      const createNavBtn = screen.getByRole("button", { name: /Crear reporte/i });
      fireEvent.click(createNavBtn);

      expect(screen.getByText(/Diagnóstico y Calidad de Datos/i)).toBeInTheDocument();
    }, 15000);
});
