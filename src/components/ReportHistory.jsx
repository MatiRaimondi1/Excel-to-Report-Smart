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
  const [isOpen, setIsOpen] = useState(false);

  if (!reportHistory || reportHistory.length === 0) return null;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6 no-print">
      {/* Header Desplegable */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              Historial de Reportes Generados
            </h3>
            <p className="text-xs text-slate-500">
              {reportHistory.length}{" "}
              {reportHistory.length === 1
                ? "reporte exportado"
                : "reportes exportados"}{" "}
              en este dispositivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {reportHistory.length}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">
              Registro Local de Exportaciones
            </span>
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar Historial
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <h4 className="font-semibold text-slate-800 text-xs truncate max-w-[200px]">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Archivo:{" "}
                    <span className="font-medium text-slate-700">
                      {item.fileName}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.timestamp}
                    </span>
                    <span>• {item.rowCount} filas</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
