/* eslint-disable react-refresh/only-export-components */
import { render } from "@testing-library/react";
import { useState, useMemo } from "react";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumnFilter, setSelectedColumnFilter] = useState("");
  const [columnFilterValue, setColumnFilterValue] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedColumnFilter("");
    setColumnFilterValue("");
    setSortConfig({ key: null, direction: "asc" });
  };

  const filteredData = useMemo(() => {
    if (!processedData) return null;

    const hasFilterOrSort = Boolean(
      searchTerm || (selectedColumnFilter && columnFilterValue) || sortConfig.key
    );

    if (!hasFilterOrSort) return null;

    let result = processedData.filter((row) => {
      const matchesSearch = searchTerm
        ? Object.values(row).some((val) =>
            String(val ?? "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        : true;

      let matchesColumn = true;
      if (selectedColumnFilter && columnFilterValue) {
        const cellValue = String(row[selectedColumnFilter] ?? "").toLowerCase();
        matchesColumn = cellValue.includes(columnFilterValue.toLowerCase());
      }

      return matchesSearch && matchesColumn;
    });

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const valA = a[sortConfig.key] ?? "";
        const valB = b[sortConfig.key] ?? "";

        const numA = Number(valA);
        const numB = Number(valB);

        if (!isNaN(numA) && !isNaN(numB) && valA !== "" && valB !== "") {
          return sortConfig.direction === "asc" ? numA - numB : numB - numA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
        if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [processedData, searchTerm, selectedColumnFilter, columnFilterValue, sortConfig]);

  const saveToHistory = (metadata) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      fileName: fileName || "Archivo",
      title: metadata.title || "Reporte",
      theme: metadata.theme || "indigo",
      rowCount: metadata.rowCount || (metadata.data ? metadata.data.length : 0),
      colCount: metadata.columns ? metadata.columns.length : (columns?.length || 0),
      columns: metadata.columns || columns || [],
      data: metadata.data || [],
      showKPIs: metadata.showKPIs ?? true,
      showChart: metadata.showChart ?? true,
      chartData: metadata.chartData || [],
      metricCol: metadata.metricCol || "",
      categoryCol: metadata.categoryCol || "",
      date: metadata.date || new Date().toLocaleDateString(),
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
    resetFilters();
  };
  const processFile = () => { };

  return (
    <DataContext.Provider
      value={{
        rawData,
        setRawData,
        processedData,
        setProcessedData,
        filteredData,
        searchTerm,
        setSearchTerm,
        selectedColumnFilter,
        setSelectedColumnFilter,
        columnFilterValue,
        setColumnFilterValue,
        sortConfig,
        setSortConfig,
        resetFilters,
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
