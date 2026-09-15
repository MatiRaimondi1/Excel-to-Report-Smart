import React from "react";
import { DataProvider, useData } from "./context/DataContext";
import FileUpload from "./components/FileUpload";
import DataExplorer from "./components/DataExplorer";
import {
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";

function MainContent() {
  const { rawData, fileName, resetData } = useData();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Excel-to-PDF Smart Converter
              </h1>
              <p className="text-xs text-slate-500">
                {fileName
                  ? `Archivo: ${fileName}`
                  : "Transforma planillas Excel en reportes profesionales en PDF"}
              </p>
            </div>
          </div>

          {rawData && (
            <button
              onClick={resetData}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Cargar otro archivo
            </button>
          )}
        </div>
      </header>

      {/* Dynamic Content */}
      <section className="flex-1 max-w-7xl w-full mx-auto p-6">
        {!rawData ? (
          <div className="flex flex-col justify-center items-center min-h-[60vh]">
            <FileUpload />
          </div>
        ) : (
          <div className="space-y-6">
            <DataExplorer />
          </div>
        )}
      </section>
    </main>
  );
}

export default function App() {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
}
