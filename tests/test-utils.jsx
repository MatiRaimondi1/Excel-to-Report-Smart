/* eslint-disable react-refresh/only-export-components */
import { render } from "@testing-library/react";
import { useState } from "react";
import { DataProvider, DataContext } from "../src/context/DataContext"

export const mockSalesData = [
  {
    ID: 1,
    Producto: "Laptop Pro",
    Categoria: "Electrónica",
    Ventas: 1500,
    Cantidad: 5,
    Fecha: "2026-01-15",
  },
  {
    ID: 2,
    Producto: "Monitor 4K",
    Categoria: "Electrónica",
    Ventas: 800,
    Cantidad: 8,
    Fecha: "2026-01-16",
  },
  {
    ID: 3,
    Producto: "Teclado Mecánico",
    Categoria: "Accesorios",
    Ventas: 120,
    Cantidad: 15,
    Fecha: "2026-01-17",
  },
  {
    ID: 4,
    Producto: "Mouse Inalámbrico",
    Categoria: "Accesorios",
    Ventas: 60,
    Cantidad: 25,
    Fecha: "2026-01-18",
  },
  {
    ID: 5,
    Producto: "Silla Ergonómica",
    Categoria: "Mobiliario",
    Ventas: 450,
    Cantidad: 4,
    Fecha: "2026-01-19",
  },
  {
    ID: 6,
    Producto: "Escritorio Elevable",
    Categoria: "Mobiliario",
    Ventas: 750,
    Cantidad: 3,
    Fecha: "2026-01-20",
  },
];

export const mockSalesColumns = [
  "ID",
  "Producto",
  "Categoria",
  "Ventas",
  "Cantidad",
  "Fecha",
];

export const mockTextOnlyData = [
  { Cliente: "Ana", Estado: "Completado", Canal: "Web" },
  { Cliente: "Carlos", Estado: "Pendiente", Canal: "Tienda" },
  { Cliente: "Beatriz", Estado: "Completado", Canal: "Web" },
  { Cliente: "Diana", Estado: "Cancelado", Canal: "App" },
];

export const mockTextOnlyColumns = ["Cliente", "Estado", "Canal"];

export function MockDataProvider({
  children,
  initialData = mockSalesData,
  initialColumns = mockSalesColumns,
  initialFileName = "ventas_2026.xlsx",
  initialHistory = [],
  initialError = null,
  initialLoading = false,
}) {
  const [rawData, setRawData] = useState(initialData);
  const [processedData, setProcessedData] = useState(initialData);
  const [fileName, setFileName] = useState(initialFileName);
  const [columns, setColumns] = useState(initialColumns);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);
  const [reportHistory, setReportHistory] = useState(initialHistory);

  const saveToHistory = (metadata) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      fileName: fileName || "Archivo",
      title: metadata.title || "Reporte",
      theme: metadata.theme || "indigo",
      rowCount: metadata.rowCount || 0,
      colCount: columns.length || 0,
    };
    setReportHistory((prev) => [entry, ...prev]);
  };

  const clearHistory = () => setReportHistory([]);
  const deleteHistoryItem = (id) =>
    setReportHistory((prev) => prev.filter((item) => item.id !== id));
  const resetData = () => {
    setRawData(null);
    setProcessedData(null);
    setFileName("");
    setColumns([]);
    setError(null);
  };
  const processFile = () => { };

  return (
    <DataContext.Provider
      value={{
        rawData,
        setRawData,
        processedData,
        setProcessedData,
        fileName,
        setFileName,
        columns,
        setColumns,
        isLoading,
        setIsLoading,
        error,
        setError,
        processFile,
        resetData,
        reportHistory,
        saveToHistory,
        clearHistory,
        deleteHistoryItem,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function renderWithMockData(ui, mockProps = {}) {
  return render(<MockDataProvider {...mockProps}>{ui}</MockDataProvider>);
}

export function renderWithRealProvider(ui) {
  return render(<DataProvider>{ui}</DataProvider>);
}
