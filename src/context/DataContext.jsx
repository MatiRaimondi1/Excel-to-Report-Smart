import React, { createContext, useState, useContext, useEffect } from "react";
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

  const [reportHistory, setReportHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("pdf_converter_history");
    if (savedHistory) {
      try {
        setReportHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error al cargar historial:", e);
      }
    }
  }, []);

  const saveToHistory = (reportMetadata) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      fileName: fileName || "Archivo Desconocido",
      title: reportMetadata.title || "Reporte de Datos",
      theme: reportMetadata.theme || "indigo",
      rowCount: reportMetadata.rowCount || 0,
      colCount: columns.length || 0,
    };

    const updated = [newEntry, ...reportHistory];
    setReportHistory(updated);
    localStorage.setItem("pdf_converter_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setReportHistory([]);
    localStorage.removeItem("pdf_converter_history");
  };

  const deleteHistoryItem = (id) => {
    const updated = reportHistory.filter((item) => item.id !== id);
    setReportHistory(updated);
    localStorage.setItem("pdf_converter_history", JSON.stringify(updated));
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
  };

  const value = {
    rawData,
    processedData,
    setProcessedData,
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
