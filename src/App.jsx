import React from "react";
import { DataProvider, useData } from "./context/DataContext";
import FileUpload from "./components/FileUpload";
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

function MainContent() {
  const { rawData, fileName, columns, resetData } = useData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* App Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Excel-to-PDF Smart Converter
              </h1>
              <p className="text-xs text-slate-500">
                Transformación y reportes locales
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Procesamiento 100% Local</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!rawData ? (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-800">
                Carga tu archivo Excel
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Selecciona o arrastra una hoja de cálculo para analizar su
                contenido y generar reportes en PDF.
              </p>
            </div>

            {/* Drag and Drop */}
            <FileUpload />
          </div>
        ) : (
          /* Provisory Panel */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-start justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-emerald-900">
                    ¡Archivo procesado con éxito!
                  </h3>
                  <p className="text-sm text-emerald-700 mt-1">
                    El archivo <span className="font-semibold">{fileName}</span>{" "}
                    ha sido leído correctamente.
                  </p>
                </div>
              </div>

              <button
                onClick={resetData}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Cargar otro archivo
              </button>
            </div>

            {/* Loaded Data Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
                Resumen de Estructura
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 block">
                    Total de Filas
                  </span>
                  <span className="text-2xl font-bold text-slate-800">
                    {rawData.length}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 block">
                    Total de Columnas
                  </span>
                  <span className="text-2xl font-bold text-slate-800">
                    {columns.length}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="text-xs font-semibold text-slate-600 mb-2">
                  Columnas Detectadas:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {columns.map((col, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
}
