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
  const { processedData, columns, fileName, saveToHistory } = useData();
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

  // Detección de columnas para el gráfico del PDF
  const numericColumns = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    return columns.filter((col) => {
      const count = processedData.filter((row) => {
        const val = row[col];
        return val !== null && val !== undefined && val !== "" && !isNaN(Number(val));
      }).length;
      return count > processedData.length * 0.4;
    });
  }, [processedData, columns]);

  const pdfCategoryCol = columns[0] || "";
  const pdfMetricCol = numericColumns[0] || "";

  const pdfChartData = useMemo(() => {
    if (!processedData || !pdfCategoryCol) return [];
    const grouped = {};
    processedData.forEach((row) => {
      const cat = String(row[pdfCategoryCol] ?? "Sin Categoría").slice(0, 16);
      const val = pdfMetricCol ? Number(row[pdfMetricCol]) || 0 : 1;
      grouped[cat] = (grouped[cat] || 0) + val;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [processedData, pdfCategoryCol, pdfMetricCol]);

  if (!processedData || processedData.length === 0) return null;

  // Cálculo de KPIs rápidos para el PDF
  const totalRows = processedData.length;
  const totalCols = columns.length;

  const handlePrint = () => {
    // Guardar metadata en el historial local
    saveToHistory({
      title: reportTitle,
      theme: templateTheme,
      rowCount: Math.min(maxRowsPrint, processedData.length),
    });

    // Disparar ventana de impresión/Guardar PDF del navegador
    window.print();
  };

  const themeColors = {
    indigo: {
      primary: "bg-indigo-600",
      text: "text-indigo-600",
      border: "border-indigo-600",
      badge: "bg-indigo-50 text-indigo-700",
      chartColor: "#4f46e5",
    },
    emerald: {
      primary: "bg-emerald-600",
      text: "text-emerald-600",
      border: "border-emerald-600",
      badge: "bg-emerald-50 text-emerald-700",
      chartColor: "#059669",
    },
    slate: {
      primary: "bg-slate-800",
      text: "text-slate-800",
      border: "border-slate-800",
      badge: "bg-slate-100 text-slate-700",
      chartColor: "#334155",
    },
  };

  const currentTheme = themeColors[templateTheme];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* CSS para ocultar todo lo que no sea el reporte al imprimir */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pdf-printable-area, #pdf-printable-area * {
            visibility: visible;
          }
          #pdf-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Desplegable */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors no-print"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              Configuración y Vista Previa de Reporte PDF
            </h3>
            <p className="text-xs text-slate-500">
              Personaliza la plantilla y exporta el documento final listo para
              distribución
            </p>
          </div>
        </div>

        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Panel de Personalización (No imprimible) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 no-print">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-600" />
              Opciones de Personalización
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label htmlFor="report-title-input" className="block text-slate-600 font-medium mb-1">
                  Título del Reporte
                </label>
                <input
                  id="report-title-input"
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="report-theme-select" className="block text-slate-600 font-medium mb-1">
                  Tema / Estilo Visual
                </label>
                <select
                  id="report-theme-select"
                  value={templateTheme}
                  onChange={(e) => setTemplateTheme(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="indigo">Corporativo (Índigo)</option>
                  <option value="emerald">Financiero (Esmeralda)</option>
                  <option value="slate">Formal (Pizarra)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Máx. Filas en PDF
                </label>
                <select
                  value={maxRowsPrint}
                  onChange={(e) => setMaxRowsPrint(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-200/70 text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showKPIs}
                  onChange={(e) => setShowKPIs(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Incluir Tarjetas de KPIs</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showChart}
                  onChange={(e) => setShowChart(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  Incluir Gráfico en PDF
                </span>
              </label>
            </div>
          </div>

          {/* Vista Previa de la Documentación Imprimible */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-100/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3 no-print">
              <Eye className="w-4 h-4" />
              Vista Previa del Documento Final:
            </div>

            {/* Hoja Virtual / Contenido del PDF */}
            <div
              id="pdf-printable-area"
              ref={printRef}
              className="bg-white p-8 border border-slate-200 rounded-lg shadow-sm space-y-6 max-w-4xl mx-auto text-slate-800"
            >
              {/* Encabezado del PDF */}
              <div
                className={`border-b-2 ${currentTheme.border} pb-4 flex justify-between items-start`}
              >
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {reportTitle}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Origen:{" "}
                    <span className="font-medium text-slate-700">
                      {fileName}
                    </span>{" "}
                    | Generado automáticamente
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Fecha de emisión:</p>
                  <p className="font-medium text-slate-600">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Indicadores en el PDF */}
              {showKPIs && (
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`p-3 rounded-lg border border-slate-100 ${currentTheme.badge}`}
                  >
                    <span className="text-xs font-medium block">
                      Total Filas Procesadas
                    </span>
                    <span className="text-lg font-bold">{totalRows}</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg border border-slate-100 ${currentTheme.badge}`}
                  >
                    <span className="text-xs font-medium block">
                      Columnas Presentes
                    </span>
                    <span className="text-lg font-bold">{totalCols}</span>
                  </div>
                  <div
                    className={`p-3 rounded-lg border border-slate-100 ${currentTheme.badge}`}
                  >
                    <span className="text-xs font-medium block">
                      Muestra Exportada
                    </span>
                    <span className="text-lg font-bold">
                      {Math.min(maxRowsPrint, totalRows)} de {totalRows}
                    </span>
                  </div>
                </div>
              )}

              {/* Gráfico Visual en el PDF */}
              {showChart && pdfChartData.length > 0 && (
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/40">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                    Resumen Gráfico ({pdfMetricCol || "Distribución"} por {pdfCategoryCol})
                  </h3>
                  <div className="w-full h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pdfChartData}
                        margin={{ top: 8, right: 10, left: -10, bottom: 25 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
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
                          fill={currentTheme.chartColor || "#4f46e5"}
                          radius={[3, 3, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tabla de Contenido del PDF */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Detalle de Registros
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`${currentTheme.primary} text-white`}>
                        <th className="p-2 border border-slate-300">#</th>
                        {columns.map((col) => (
                          <th
                            key={col}
                            className="p-2 border border-slate-300 font-semibold"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.slice(0, maxRowsPrint).map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                        >
                          <td className="p-2 border border-slate-200 text-slate-400 font-mono text-center">
                            {idx + 1}
                          </td>
                          {columns.map((col) => (
                            <td
                              key={col}
                              className="p-2 border border-slate-200 text-slate-700"
                            >
                              {row[col] !== undefined && row[col] !== null
                                ? String(row[col])
                                : "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pie de Página del PDF */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-400">
                <span>
                  Excel-to-PDF Smart Converter — Documento de ejecución local
                  sin conexión
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
