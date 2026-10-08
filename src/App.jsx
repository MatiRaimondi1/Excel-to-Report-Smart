import { useState } from "react";
import { DataProvider, useData } from "./context/DataContext";
import FileUpload from "./components/FileUpload";
import DataExplorer from "./components/DataExplorer";
import DataQuality from "./components/DataQuality";
import DataAnalysis from "./components/DataAnalysis";
import GraphicsModule from "./components/GraphicsModule";
import PdfReport from "./components/PdfReport";
import ReportHistory from "./components/ReportHistory";
import {
  FilePlusCorner,
  FileSpreadsheet,
  Moon,
  RotateCcwClock,
} from "lucide-react";

function MainContent() {
  const { rawData, fileName } = useData();
  const [activeTab, setActiveTab] = useState("create");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-200">
              <FileSpreadsheet className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-bold tracking-tight text-slate-900 sm:text-base">
                Excel-to-PDF
              </h1>

              <p className="hidden max-w-md truncate text-xs text-slate-500 sm:block">
                Convierte tus planillas en reportes profesionales
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="hidden items-center rounded-xl bg-slate-100 p-1 md:flex"
            aria-label="Navegación principal"
          >
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`
                inline-flex items-center gap-2 rounded-lg px-4 py-2
                text-sm transition-all duration-200
                ${
                  activeTab === "create"
                    ? "bg-white font-semibold text-slate-800 shadow-sm"
                    : "font-medium text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }
              `}
            >
              <FilePlusCorner
                className={`h-4 w-4 ${
                  activeTab === "create"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              />
              Crear reporte
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`
                inline-flex items-center gap-2 rounded-lg px-4 py-2
                text-sm transition-all duration-200
                ${
                  activeTab === "history"
                    ? "bg-white font-semibold text-slate-800 shadow-sm"
                    : "font-medium text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }
              `}
            >
              <RotateCcwClock
                className={`h-4 w-4 ${
                  activeTab === "history"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              />
              Historial
            </button>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {fileName && (
              <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 lg:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="max-w-[180px] truncate text-xs font-medium text-emerald-700">
                  {fileName}
                </span>
              </div>
            )}

            <button
              type="button"
              aria-label="Cambiar tema"
              className="
          flex h-10 w-10 items-center justify-center
          rounded-xl border border-slate-200
          bg-white text-slate-500
          transition-all duration-200
          hover:border-slate-300
          hover:bg-slate-50
          hover:text-slate-800
          focus:outline-none
          focus:ring-2
          focus:ring-emerald-500/30
        "
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Content */}
      <section className="flex-1 mx-auto w-full max-w-7xl p-6">
        {activeTab === "history" ? (
          <div className="space-y-6">
            <ReportHistory />
          </div>
        ) : !rawData ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <FileUpload />
          </div>
        ) : (
          <div className="space-y-6">
            <DataQuality />
            <DataAnalysis />
            <GraphicsModule />
            <PdfReport />
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
