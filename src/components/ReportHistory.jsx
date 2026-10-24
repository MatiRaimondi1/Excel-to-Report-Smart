import { useState } from "react";
import { useData } from "../context/DataContext";
import {
  History,
  Trash2,
  Calendar,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ReportHistory() {
  const { reportHistory, clearHistory, deleteHistoryItem } = useData();
  const [isOpen, setIsOpen] = useState(true);

  if (!reportHistory || reportHistory.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center shadow-sm mb-6">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
          <History className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-zinc-100 text-sm">
          Historial de Reportes Generados
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          No hay reportes en el historial
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-6 no-print">
      {/* Header Desplegable */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-zinc-100 text-sm">
              Historial de Reportes Generados
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {reportHistory.length}{" "}
              {reportHistory.length === 1
                ? "reporte exportado"
                : "reportes exportados"}{" "}
              en este dispositivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full">
            {reportHistory.length}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">
              Registro Local de Exportaciones
            </span>
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar Historial
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <h4 className="font-semibold text-slate-800 dark:text-zinc-200 text-xs truncate max-w-[200px]">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Archivo:{" "}
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {item.fileName}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-zinc-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.timestamp}
                    </span>
                    <span>• {item.rowCount} filas</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Eliminar del historial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
