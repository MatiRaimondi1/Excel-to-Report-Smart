import { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import {
  ShieldCheck,
  AlertTriangle,
  Trash2,
  CopyX,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function DataQuality() {
  const { rawData, processedData, setProcessedData, columns } = useData();
  const [isOpen, setIsOpen] = useState(true);

  // 1. Análisis de Calidad de Datos
  const qualityStats = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return { totalRows: 0, duplicateRows: 0, nullCells: 0, cleanScore: 100 };
    }

    const totalRows = processedData.length;
    let nullCells = 0;
    const rowStrings = new Set();
    let duplicateRows = 0;

    processedData.forEach((row) => {
      // Detección de duplicados
      const rowStr = JSON.stringify(row);
      if (rowStrings.has(rowStr)) {
        duplicateRows++;
      } else {
        rowStrings.add(rowStr);
      }

      // Detección de celdas vacías/nulas
      columns.forEach((col) => {
        const val = row[col];
        if (val === undefined || val === null || String(val).trim() === "") {
          nullCells++;
        }
      });
    });

    const totalCells = totalRows * columns.length;
    const cleanScore =
      totalCells > 0
        ? Math.max(
            0,
            Math.round(
              100 -
                ((nullCells + duplicateRows * columns.length) / totalCells) *
                  100,
            ),
          )
        : 100;

    return { totalRows, duplicateRows, nullCells, cleanScore };
  }, [processedData, columns]);

  // 2. Acciones de Limpieza
  const handleRemoveDuplicates = () => {
    const uniqueMap = new Map();
    processedData.forEach((row) => {
      const key = JSON.stringify(row);
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, row);
      }
    });
    setProcessedData(Array.from(uniqueMap.values()));
  };

  const handleTrimWhitespace = () => {
    const cleaned = processedData.map((row) => {
      const newRow = { ...row };
      columns.forEach((col) => {
        if (typeof newRow[col] === "string") {
          newRow[col] = newRow[col].trim();
        }
      });
      return newRow;
    });
    setProcessedData(cleaned);
  };

  const handleFillNulls = () => {
    const filled = processedData.map((row) => {
      const newRow = { ...row };
      columns.forEach((col) => {
        const val = newRow[col];
        if (val === undefined || val === null || String(val).trim() === "") {
          newRow[col] = "N/A";
        }
      });
      return newRow;
    });
    setProcessedData(filled);
  };

  const handleResetToRaw = () => {
    setProcessedData(rawData);
  };

  if (!processedData || processedData.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Header Desplegable */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${qualityStats.cleanScore >= 80 ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400"}`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-zinc-100 text-sm">
              Diagnóstico y Calidad de Datos
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Puntaje de salud de los datos:{" "}
              <span className="font-semibold text-slate-700 dark:text-zinc-200">{qualityStats.cleanScore}%</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span
              className={`px-2.5 py-1 rounded-full font-medium ${qualityStats.duplicateRows > 0 ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"}`}
            >
              {qualityStats.duplicateRows} duplicados
            </span>
            <span
              className={`px-2.5 py-1 rounded-full font-medium ${qualityStats.nullCells > 0 ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"}`}
            >
              {qualityStats.nullCells} celdas nulas
            </span>
          </div>

          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          )}
        </div>
      </div>

      {/* Panel de Herramientas de Limpieza */}
      {isOpen && (
        <div className="p-4 bg-white dark:bg-zinc-900 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tarjetas de Métricas de Calidad */}
          <div className="md:col-span-1 p-3 bg-slate-50 dark:bg-zinc-950/60 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-2">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Estado de Salud
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-800 dark:text-zinc-100">
                {qualityStats.cleanScore}%
              </span>
              {qualityStats.cleanScore === 100 ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {qualityStats.cleanScore === 100
                ? "Los datos se encuentran limpios y estructurados."
                : "Se detectaron inconsistencias o valores faltantes."}
            </p>
          </div>

          {/* Botones de Acción de Limpieza */}
          <div className="md:col-span-3 flex flex-wrap items-center gap-2">
            <button
              onClick={handleRemoveDuplicates}
              disabled={qualityStats.duplicateRows === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CopyX className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              Eliminar Duplicados ({qualityStats.duplicateRows})
            </button>

            <button
              onClick={handleFillNulls}
              disabled={qualityStats.nullCells === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Rellenar Vacíos ("N/A")
            </button>

            <button
              onClick={handleTrimWhitespace}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Limpiar Espacios en Blanco
            </button>

            <button
              onClick={handleResetToRaw}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Restaurar Original
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
