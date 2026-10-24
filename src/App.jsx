import { useState, useContext } from "react";
import { DataProvider, DataContext, useData } from "./context/DataContext";
import { ThemeProvider, ThemeContext, useTheme } from "./context/ThemeContext";
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
  Sun,
  RotateCcwClock,
} from "lucide-react";

export function MainContent() {
  const { rawData, fileName } = useData();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("create");

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-800 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none">
              <FileSpreadsheet className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
                Excel-to-PDF
              </h1>

              <p className="hidden max-w-md truncate text-xs text-slate-500 dark:text-zinc-400 sm:block">
                Convierte tus planillas en reportes profesionales
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="hidden items-center rounded-xl bg-slate-100 dark:bg-zinc-800/80 p-1 md:flex"
            aria-label="Navegación principal"
          >
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`
                inline-flex items-center gap-2 rounded-lg px-4 py-2
                text-sm transition-all duration-200
                ${activeTab === "create"
                  ? "bg-white dark:bg-zinc-900 font-semibold text-slate-800 dark:text-zinc-100 shadow-sm"
                  : "font-medium text-slate-500 dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-700/60 hover:text-slate-800 dark:hover:text-zinc-100"
                }
              `}
            >
              <FilePlusCorner
                className={`h-4 w-4 ${activeTab === "create"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-zinc-500"
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
                ${activeTab === "history"
                  ? "bg-white dark:bg-zinc-900 font-semibold text-slate-800 dark:text-zinc-100 shadow-sm"
                  : "font-medium text-slate-500 dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-700/60 hover:text-slate-800 dark:hover:text-zinc-100"
                }
              `}
            >
              <RotateCcwClock
                className={`h-4 w-4 ${activeTab === "history"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-zinc-500"
                  }`}
              />
              Historial
            </button>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {fileName && (
              <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 dark:border-emerald-950/80 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 lg:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="max-w-[180px] truncate text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {fileName}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              className="
          flex h-10 w-10 items-center justify-center
          rounded-xl border border-slate-200 dark:border-zinc-800
          bg-white dark:bg-zinc-900 text-slate-500 dark:text-amber-400
          transition-all duration-200
          hover:border-slate-300 dark:hover:border-zinc-700
          hover:bg-slate-50 dark:hover:bg-zinc-800
          hover:text-slate-800 dark:hover:text-amber-300
          focus:outline-none
          focus:ring-2
          focus:ring-emerald-500/30
        "
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
            <DataExplorer />
            <DataQuality />
            <DataAnalysis />
            <GraphicsModule />
            <PdfReport />
          </div>
        )}
      </section>
    </main>
  );
}

export default function App() {
  const existingDataContext = useContext(DataContext);
  const existingThemeContext = useContext(ThemeContext);

  let content = <MainContent />;

  if (!existingDataContext) {
    content = <DataProvider>{content}</DataProvider>;
  }

  if (!existingThemeContext) {
    content = <ThemeProvider>{content}</ThemeProvider>;
  }

  return content;
}

