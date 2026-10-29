import { useState, useRef, useMemo } from "react";
import { useData } from "../context/DataContext";
import {
  Printer,
  Eye,
  Settings2,
  FileText,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function PdfReport() {
  const {
    processedData,
    filteredData,
    sortConfig,
    columns,
    fileName,
    saveToHistory,
  } = useData();
  const [isOpen, setIsOpen] = useState(true);

  // Opciones de Personalización de Plantilla
  const [reportTitle, setReportTitle] = useState(
    "Reporte Operativo y Ejecutivo",
  );
  const [templateTheme, setTemplateTheme] = useState("emerald"); // 'indigo', 'emerald', 'slate'
  const [showKPIs, setShowKPIs] = useState(true);
  const [showChart, setShowChart] = useState(true);
  const [maxRowsPrint, setMaxRowsPrint] = useState(50); // Límite de filas en el PDF para brevedad
  const printRef = useRef();

  // Los datos activos en el PDF se actualizan en tiempo real al filtrar u ordenar desde DataExplorer
  const currentData = useMemo(() => {
    return filteredData !== null && filteredData !== undefined
      ? filteredData
      : processedData || [];
  }, [filteredData, processedData]);

  // Detección de columnas para el gráfico del PDF
  const numericColumns = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    return columns.filter((col) => {
      const count = currentData.filter((row) => {
        const val = row[col];
        return val !== null && val !== undefined && val !== "" && !isNaN(Number(val));
      }).length;
      return count > currentData.length * 0.4;
    });
  }, [currentData, columns]);

  const pdfCategoryCol = columns[0] || "";
  const pdfMetricCol = numericColumns[0] || "";

  const pdfChartData = useMemo(() => {
    if (!currentData || currentData.length === 0 || !pdfCategoryCol) return [];
    const grouped = {};
    currentData.forEach((row) => {
      const cat = String(row[pdfCategoryCol] ?? "Sin Categoría").slice(0, 16);
      const val = pdfMetricCol ? Number(row[pdfMetricCol]) || 0 : 1;
      grouped[cat] = (grouped[cat] || 0) + val;
    });

    let items = Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

    // Si hay ordenamiento activo desde DataExplorer, sincronizar el orden del gráfico
    if (sortConfig?.key === pdfCategoryCol) {
      items.sort((a, b) =>
        sortConfig.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
    } else if (sortConfig?.key === pdfMetricCol) {
      items.sort((a, b) =>
        sortConfig.direction === "asc" ? a.value - b.value : b.value - a.value,
      );
    } else {
      items.sort((a, b) => b.value - a.value);
    }

    return items.slice(0, 8);
  }, [currentData, pdfCategoryCol, pdfMetricCol, sortConfig]);

  if (!processedData || processedData.length === 0) return null;

  // Cálculo de KPIs rápidos para el PDF basados en los datos actuales
  const totalRows = currentData.length;
  const totalCols = columns.length;
  const isFiltered = filteredData !== null && filteredData !== undefined;

  const handlePrint = () => {
    // Guardar metadata y snapshot de datos en el historial local
    saveToHistory({
      title: reportTitle,
      theme: templateTheme,
      rowCount: Math.min(maxRowsPrint, totalRows),
      colCount: totalCols,
      columns: columns,
      data: currentData.slice(0, maxRowsPrint),
      showKPIs,
      showChart,
      chartData: pdfChartData,
      metricCol: pdfMetricCol,
      categoryCol: pdfCategoryCol,
      date: new Date().toLocaleDateString(),
    });

    // Disparar ventana de impresión/Guardar PDF del navegador
    window.print();
  };

  const themeColors = {
    indigo: {
      primary: "bg-indigo-600",
      primaryBg: "#4f46e5",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-600 dark:border-indigo-500",
      borderColor: "#4f46e5",
      badge: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300",
      badgeBg: "#eef2ff",
      badgeText: "#3730a3",
      badgeBorder: "#c7d2fe",
      chartColor: "#4f46e5",
    },
    emerald: {
      primary: "bg-emerald-600",
      primaryBg: "#059669",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-600 dark:border-emerald-500",
      borderColor: "#059669",
      badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
      badgeBg: "#ecfdf5",
      badgeText: "#065f46",
      badgeBorder: "#a7f3d0",
      chartColor: "#059669",
    },
    slate: {
      primary: "bg-slate-800 dark:bg-zinc-800",
      primaryBg: "#1e293b",
      text: "text-slate-800 dark:text-zinc-200",
      border: "border-slate-800 dark:border-zinc-700",
      borderColor: "#1e293b",
      badge: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300",
      badgeBg: "#f1f5f9",
      badgeText: "#1e293b",
      badgeBorder: "#cbd5e1",
      chartColor: "#334155",
    },
  };

  const currentTheme = themeColors[templateTheme];

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* CSS para forzar impresión exacta de colores y backgrounds en el PDF */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 12mm 15mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #pdf-printable-area, #pdf-printable-area * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          #pdf-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Desplegable */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-colors no-print"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 dark:text-zinc-100 text-sm">
                Configuración y Vista Previa de Reporte PDF
              </h3>
              {isFiltered && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  <Filter className="w-3 h-3" />
                  Sincronizado con filtro ({totalRows} filas)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Personaliza la plantilla y exporta el documento final listo para distribución
            </p>
          </div>
        </div>

        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
        )}
      </div>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Panel de Personalización (No imprimible) */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-4 no-print">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Opciones de Personalización
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label htmlFor="report-title-input" className="block text-slate-600 dark:text-zinc-300 font-medium mb-1">
                  Título del Reporte
                </label>
                <input
                  id="report-title-input"
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="report-theme-select" className="block text-slate-600 dark:text-zinc-300 font-medium mb-1">
                  Tema / Estilo Visual
                </label>
                <select
                  id="report-theme-select"
                  value={templateTheme}
                  onChange={(e) => setTemplateTheme(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="indigo">Corporativo (Índigo)</option>
                  <option value="emerald">Financiero (Esmeralda)</option>
                  <option value="slate">Formal (Pizarra)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-300 font-medium mb-1">
                  Máx. Filas en PDF
                </label>
                <select
                  value={maxRowsPrint}
                  onChange={(e) => setMaxRowsPrint(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={20}>Top 20 Registros</option>
                  <option value={50}>Top 50 Registros</option>
                  <option value={100}>Top 100 Registros</option>
                  <option value={totalRows}>Todos ({totalRows})</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handlePrint}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-xs"
                >
                  <Printer className="w-4 h-4" />
                  Exportar a PDF
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-200/70 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showKPIs}
                  onChange={(e) => setShowKPIs(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Incluir Tarjetas de KPIs</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showChart}
                  onChange={(e) => setShowChart(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Incluir Gráfico en PDF
                </span>
              </label>
            </div>
          </div>

          {/* Vista Previa de la Documentación Imprimible */}
          <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-100/50 dark:bg-zinc-950/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-3 no-print">
              <Eye className="w-4 h-4" />
              Vista Previa del Documento Final:
            </div>

            {/* Hoja Virtual / Contenido del PDF */}
            <div
              id="pdf-printable-area"
              ref={printRef}
              className="bg-white p-8 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm space-y-6 max-w-4xl mx-auto text-slate-900"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            >
              {/* Encabezado del PDF */}
              <div
                style={{ borderBottom: `3px solid ${currentTheme.borderColor}` }}
                className="pb-4 flex justify-between items-start"
              >
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {reportTitle}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Origen:{" "}
                    <span className="font-semibold text-slate-700">
                      {fileName}
                    </span>{" "}
                    | Generado automáticamente
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Fecha de emisión:</p>
                  <p className="font-semibold text-slate-700">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Indicadores en el PDF */}
              {showKPIs && (
                <div className="grid grid-cols-3 gap-4">
                  <div
                    style={{
                      backgroundColor: currentTheme.badgeBg,
                      borderColor: currentTheme.badgeBorder,
                      color: currentTheme.badgeText,
                    }}
                    className="p-3.5 rounded-xl border shadow-xs"
                  >
                    <span
                      style={{ color: currentTheme.badgeText }}
                      className="text-xs font-semibold block uppercase tracking-wider"
                    >
                      Total Filas Procesadas
                    </span>
                    <span
                      style={{ color: currentTheme.badgeText }}
                      className="text-xl font-bold block mt-1"
                    >
                      {totalRows}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: currentTheme.badgeBg,
                      borderColor: currentTheme.badgeBorder,
                      color: currentTheme.badgeText,
                    }}
                    className="p-3.5 rounded-xl border shadow-xs"
                  >
                    <span
                      style={{ color: currentTheme.badgeText }}
                      className="text-xs font-semibold block uppercase tracking-wider"
                    >
                      Columnas Presentes
                    </span>
                    <span
                      style={{ color: currentTheme.badgeText }}
                      className="text-xl font-bold block mt-1"
                    >
                      {totalCols}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: currentTheme.badgeBg,
                      borderColor: currentTheme.badgeBorder,
                      color: currentTheme.badgeText,
                    }}
                    className="p-3.5 rounded-xl border shadow-xs"
                  >
                    <span
                      style={{ color: currentTheme.badgeText }}
                      className="text-xs font-semibold block uppercase tracking-wider"
                    >
                      Muestra Exportada
                    </span>
                    <span
                      style={{ color: currentTheme.badgeText }}
                      className="text-xl font-bold block mt-1"
                    >
                      {Math.min(maxRowsPrint, totalRows)} de {totalRows}
                    </span>
                  </div>
                </div>
              )}

              {/* Gráfico Visual en el PDF */}
              {showChart && pdfChartData.length > 0 && (
                <div
                  style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
                  className="border rounded-xl p-4"
                >
                  <h3
                    style={{ color: "#334155" }}
                    className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-4 h-4 text-slate-600" />
                    Resumen Gráfico ({pdfMetricCol || "Distribución"} por {pdfCategoryCol})
                  </h3>
                  <div className="w-full h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={170}>
                      <BarChart
                        data={pdfChartData}
                        margin={{ top: 8, right: 10, left: -10, bottom: 25 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#cbd5e1"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={9}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={9}
                          tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                          }
                        />
                        <Bar
                          dataKey="value"
                          fill={currentTheme.chartColor}
                          radius={[3, 3, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tabla de Contenido del PDF */}
              <div>
                <h3
                  style={{ color: "#475569" }}
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                >
                  Detalle de Registros
                </h3>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead style={{ backgroundColor: currentTheme.primaryBg, color: "#ffffff" }}>
                      <tr
                        style={{ backgroundColor: currentTheme.primaryBg, color: "#ffffff" }}
                        className={`${currentTheme.primary} text-white`}
                      >
                        <th
                          style={{
                            backgroundColor: currentTheme.primaryBg,
                            color: "#ffffff",
                            borderColor: currentTheme.primaryBg,
                          }}
                          className="p-2 border font-semibold text-center w-12"
                        >
                          #
                        </th>
                        {columns.map((col) => (
                          <th
                            key={col}
                            style={{
                              backgroundColor: currentTheme.primaryBg,
                              color: "#ffffff",
                              borderColor: currentTheme.primaryBg,
                            }}
                            className="p-2 border font-semibold"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.slice(0, maxRowsPrint).map((row, idx) => (
                          <tr
                            key={idx}
                            style={{
                              backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f1f5f9",
                            }}
                            className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                          >
                            <td
                              style={{ borderColor: "#cbd5e1", color: "#64748b" }}
                              className="p-2 border font-mono text-center"
                            >
                              {idx + 1}
                            </td>
                            {columns.map((col) => (
                              <td
                                key={col}
                                style={{ borderColor: "#cbd5e1", color: "#1e293b" }}
                                className="p-2 border font-medium"
                              >
                                {row[col] !== undefined && row[col] !== null
                                  ? String(row[col])
                                  : "-"}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length + 1}
                            className="p-4 text-center text-slate-400"
                          >
                            No hay registros que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pie de Página del PDF */}
              <div
                style={{ borderTopColor: "#e2e8f0" }}
                className="border-t pt-4 flex justify-between items-center text-[10px] text-slate-400"
              >
                <span>
                  Excel-to-PDF Smart Converter — Documento de ejecución local sin conexión
                </span>
                <span>Página 1</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
