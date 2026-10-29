/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useMemo } from "react";
import * as XLSX from "xlsx";

export const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData debe ser utilizado dentro de un DataProvider");
  }
  return context;
};

export function DataProvider({ children }) {
  const [rawData, setRawData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de Búsqueda, Filtro y Ordenamiento para DataExplorer
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

  // Datos filtrados y ordenados sincronizados globalmente
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

  const [reportHistory, setReportHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem("pdf_converter_history");
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error("Error al cargar historial:", e);
      return [];
    }
  });

  const saveToHistory = (reportMetadata) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      fileName: fileName || "Archivo Desconocido",
      title: reportMetadata.title || "Reporte de Datos",
      theme: reportMetadata.theme || "indigo",
      rowCount: reportMetadata.rowCount || (reportMetadata.data ? reportMetadata.data.length : 0),
      colCount: reportMetadata.columns ? reportMetadata.columns.length : (columns?.length || 0),
      columns: reportMetadata.columns || columns || [],
      data: reportMetadata.data || [],
      showKPIs: reportMetadata.showKPIs ?? true,
      showChart: reportMetadata.showChart ?? true,
      chartData: reportMetadata.chartData || [],
      metricCol: reportMetadata.metricCol || "",
      categoryCol: reportMetadata.categoryCol || "",
      date: reportMetadata.date || new Date().toLocaleDateString(),
    };

    setReportHistory((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem("pdf_converter_history", JSON.stringify(updated));
      } catch (e) {
        console.warn("Error al guardar historial completo, guardando versión compacta:", e);
        try {
          const compact = updated.map((item) => ({
            ...item,
            data: (item.data || []).slice(0, 50),
          }));
          localStorage.setItem("pdf_converter_history", JSON.stringify(compact));
        } catch (e2) {
          console.error("Error persistiendo historial compacto:", e2);
        }
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setReportHistory([]);
    localStorage.removeItem("pdf_converter_history");
  };

  const deleteHistoryItem = (id) => {
    setReportHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("pdf_converter_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Error al actualizar historial:", e);
      }
      return updated;
    });
  };

  const processFile = async (file) => {
    if (!file) return;

    const validExtensions = [".xlsx", ".xls"];
    const isExtensionValid = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );

    if (!isExtensionValid) {
      setError("Por favor, cargue un archivo válido con formato .xlsx o .xls.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target.result;
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonArray = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          if (!jsonArray || jsonArray.length === 0) {
            setError(
              "El archivo Excel está vacío o no contiene filas con datos válidos.",
            );
            setIsLoading(false);
            return;
          }

          const detectedColumns = Object.keys(jsonArray[0]);

          setFileName(file.name);
          setRawData(jsonArray);
          setProcessedData(jsonArray);
          setColumns(detectedColumns);
          resetFilters();
          setIsLoading(false);
        } catch (err) {
          console.error("Error al parsear Excel:", err);
          setError("Ocurrió un error al procesar el archivo Excel.");
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Error de lectura del archivo local.");
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error en processFile:", err);
      setError("Ocurrió un error inesperado al cargar el archivo.");
      setIsLoading(false);
    }
  };

  const resetData = () => {
    setRawData(null);
    setProcessedData(null);
    setFileName("");
    setColumns([]);
    setError(null);
    resetFilters();
  };

  const value = {
    rawData,
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
    columns,
    isLoading,
    error,
    processFile,
    resetData,
    reportHistory,
    saveToHistory,
    clearHistory,
    deleteHistoryItem,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
