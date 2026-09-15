import React, { createContext, useState, useContext } from "react";
import * as XLSX from "xlsx";

export const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData debe ser utilizado dentro de un DataProvider");
  }
  return context;
};

// DataProvider component that manages the state and logic for processing Excel files and providing the data to its children components.
export function DataProvider({ children }) {
  const [rawData, setRawData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Process an Excel file and extract its data into structured JSON format.
   * @param {File} file - The Excel file to be processed.
   */
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
          console.error("Error al parsear la hoja Excel:", err);
          setError(
            "Ocurrió un error al procesar la estructura del archivo Excel.",
          );
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

  /**
   * Reset the data state to its initial values, clearing any loaded data and errors.
   */
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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
