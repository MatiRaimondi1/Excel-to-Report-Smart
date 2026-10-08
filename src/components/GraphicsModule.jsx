import { useState, useMemo, useRef } from "react";
import { useData } from "../context/DataContext";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Palette,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Paletas de colores predefinidas
const COLOR_PALETTES = {
  emerald: {
    name: "Esmeralda",
    primary: "#059669",
    secondary: "#10b981",
    colors: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#047857"],
  },
  indigo: {
    name: "Índigo Ejecutivo",
    primary: "#4f46e5",
    secondary: "#818cf8",
    colors: ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#3730a3"],
  },
  ocean: {
    name: "Océano Cyan",
    primary: "#0284c7",
    secondary: "#38bdf8",
    colors: ["#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#0369a1"],
  },
  sunset: {
    name: "Atardecer Cálido",
    primary: "#ea580c",
    secondary: "#f59e0b",
    colors: ["#ea580c", "#f97316", "#f59e0b", "#fbbf24", "#ef4444", "#c2410c"],
  },
  vibrant: {
    name: "Multicolor Vibrante",
    primary: "#059669",
    secondary: "#4f46e5",
    colors: [
      "#059669",
      "#4f46e5",
      "#0284c7",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#14b8a6",
      "#f97316",
      "#64748b",
      "#84cc16",
    ],
  },
};

// Componente CustomTooltip declarado fuera de render para cumplir con React Hooks
function CustomChartTooltip({
  active,
  payload,
  label,
  totalSum,
  metricCol,
  secondaryMetricCol,
  activePalette,
}) {
  if (active && payload && payload.length) {
    const dataItem = payload[0].payload;
    const primaryVal = payload[0].value;
    const percent =
      totalSum > 0 ? ((primaryVal / totalSum) * 100).toFixed(1) : null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs space-y-1 z-50">
        <p className="font-semibold text-slate-100 max-w-[220px] truncate">
          {dataItem.name || label}
        </p>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                backgroundColor: payload[0].color || activePalette.primary,
              }}
            />
            {metricCol || "Conteo"}:
          </span>
          <span className="font-mono font-bold text-emerald-400">
            {Number(primaryVal).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {payload[1] && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{
                  backgroundColor: payload[1].color || activePalette.secondary,
                }}
              />
              {secondaryMetricCol}:
            </span>
            <span className="font-mono font-bold text-indigo-300">
              {Number(payload[1].value).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {percent && (
          <div className="text-[11px] text-slate-400 pt-0.5 flex justify-between">
            <span>Proporción:</span>
            <span className="text-slate-300 font-medium">{percent}%</span>
          </div>
        )}

        <div className="text-[10px] text-slate-500 pt-0.5">
          Filas agrupadas: {dataItem.itemsCount}
        </div>
      </div>
    );
  }
  return null;
}

export default function GraphicsModule() {
  const { processedData, columns, fileName } = useData();
  const [isOpen, setIsOpen] = useState(true);
  const chartContainerRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Columnas numéricas identificadas
  const numericColumns = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    return columns.filter((col) => {
      const numericCount = processedData.filter((row) => {
        const val = row[col];
        return (
          val !== null &&
          val !== undefined &&
          val !== "" &&
          !isNaN(Number(val)) &&
          typeof val !== "boolean"
        );
      }).length;
      return numericCount > processedData.length * 0.4;
    });
  }, [processedData, columns]);

  // Estados de configuración de visualización
  const [chartType, setChartType] = useState("bar"); // 'bar', 'bar-horizontal', 'line', 'area', 'pie', 'donut', 'composed'
  const [userCategoryCol, setUserCategoryCol] = useState("");
  const categoryCol =
    userCategoryCol && columns.includes(userCategoryCol)
      ? userCategoryCol
      : columns[0] || "";

  const [userMetricCol, setUserMetricCol] = useState("");
  const metricCol =
    userMetricCol && numericColumns.includes(userMetricCol)
      ? userMetricCol
      : numericColumns[0] || "";

  const [userSecondaryMetricCol, setUserSecondaryMetricCol] = useState("");
  const secondaryMetricCol =
    userSecondaryMetricCol &&
    numericColumns.includes(userSecondaryMetricCol) &&
    userSecondaryMetricCol !== metricCol
      ? userSecondaryMetricCol
      : "";

  const [rawAggregation, setRawAggregation] = useState("sum"); // 'sum', 'avg', 'count', 'max', 'min'
  const aggregation = numericColumns.length === 0 ? "count" : rawAggregation;

  const [limit, setLimit] = useState(10); // 5, 10, 15, 20, 0 (todos)
  const [sortBy, setSortBy] = useState("desc"); // 'desc', 'asc', 'none'
  const [selectedPalette, setSelectedPalette] = useState("emerald");
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // Cálculo y agregación de datos para Recharts
  const aggregatedData = useMemo(() => {
    if (!processedData || processedData.length === 0 || !categoryCol) return [];

    const grouped = new Map();

    processedData.forEach((row) => {
      const rawCategory = row[categoryCol];
      const categoryKey =
        rawCategory !== null && rawCategory !== undefined && rawCategory !== ""
          ? String(rawCategory).trim()
          : "(Vacío)";

      const val1 = metricCol ? Number(row[metricCol]) : 0;
      const val2 = secondaryMetricCol ? Number(row[secondaryMetricCol]) : 0;

      if (!grouped.has(categoryKey)) {
        grouped.set(categoryKey, {
          name: categoryKey,
          items: 0,
          sum1: 0,
          values1: [],
          sum2: 0,
          values2: [],
        });
      }

      const entry = grouped.get(categoryKey);
      entry.items += 1;

      if (!isNaN(val1)) {
        entry.sum1 += val1;
        entry.values1.push(val1);
      }
      if (!isNaN(val2) && secondaryMetricCol) {
        entry.sum2 += val2;
        entry.values2.push(val2);
      }
    });

    let result = Array.from(grouped.values()).map((entry) => {
      let finalVal1 = 0;
      let finalVal2 = 0;

      if (aggregation === "count") {
        finalVal1 = entry.items;
        finalVal2 = entry.items;
      } else if (aggregation === "sum") {
        finalVal1 = entry.sum1;
        finalVal2 = entry.sum2;
      } else if (aggregation === "avg") {
        finalVal1 = entry.values1.length ? entry.sum1 / entry.values1.length : 0;
        finalVal2 = entry.values2.length ? entry.sum2 / entry.values2.length : 0;
      } else if (aggregation === "max") {
        finalVal1 = entry.values1.length ? Math.max(...entry.values1) : 0;
        finalVal2 = entry.values2.length ? Math.max(...entry.values2) : 0;
      } else if (aggregation === "min") {
        finalVal1 = entry.values1.length ? Math.min(...entry.values1) : 0;
        finalVal2 = entry.values2.length ? Math.min(...entry.values2) : 0;
      }

      const item = {
        name: entry.name,
        displayName:
          entry.name.length > 20 ? entry.name.slice(0, 18) + "..." : entry.name,
        value: Number(finalVal1.toFixed(2)),
        itemsCount: entry.items,
      };

      if (secondaryMetricCol) {
        item.value2 = Number(finalVal2.toFixed(2));
      }

      return item;
    });

    // Ordenamiento
    if (sortBy === "desc") {
      result.sort((a, b) => b.value - a.value);
    } else if (sortBy === "asc") {
      result.sort((a, b) => a.value - b.value);
    }

    // Límite Top N
    if (limit > 0 && result.length > limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [
    processedData,
    categoryCol,
    metricCol,
    secondaryMetricCol,
    aggregation,
    sortBy,
    limit,
  ]);

  // Resumen estadístico del gráfico activo
  const chartSummary = useMemo(() => {
    if (aggregatedData.length === 0) {
      return { total: 0, avg: 0, topCategory: "N/A", topValue: 0, count: 0 };
    }

    const total = aggregatedData.reduce((acc, curr) => acc + curr.value, 0);
    const avg = total / aggregatedData.length;
    const topItem = [...aggregatedData].sort((a, b) => b.value - a.value)[0];

    return {
      total: Number(total.toFixed(2)),
      avg: Number(avg.toFixed(2)),
      topCategory: topItem ? topItem.name : "N/A",
      topValue: topItem ? topItem.value : 0,
      topPercent:
        total > 0 && topItem
          ? ((topItem.value / total) * 100).toFixed(1)
          : "0.0",
      count: aggregatedData.length,
    };
  }, [aggregatedData]);

  // Colores activos
  const activePalette = COLOR_PALETTES[selectedPalette] || COLOR_PALETTES.emerald;

  // Exportar gráfico como imagen PNG usando Canvas
  const handleDownloadChart = () => {
    if (!chartContainerRef.current) return;
    setIsExporting(true);

    try {
      const svgElement = chartContainerRef.current.querySelector("svg");
      if (!svgElement) {
        setIsExporting(false);
        return;
      }

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const bbox = svgElement.getBoundingClientRect();
        const width = bbox.width || 800;
        const height = bbox.height || 450;
        const scale = 2; // Mayor resolución

        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.scale(scale, scale);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(image, 0, 0, width, height);

          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `grafico-${fileName ? fileName.replace(/\.[^/.]+$/, "") : "analisis"}-${chartType}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 3000);
        }
        URLObj.revokeObjectURL(blobURL);
        setIsExporting(false);
      };

      image.onerror = () => {
        URLObj.revokeObjectURL(blobURL);
        setIsExporting(false);
      };

      image.src = blobURL;
    } catch (e) {
      console.error("Error al exportar gráfico:", e);
      setIsExporting(false);
    }
  };

  const renderTooltip = (props) => (
    <CustomChartTooltip
      {...props}
      totalSum={chartSummary.total}
      metricCol={metricCol}
      secondaryMetricCol={secondaryMetricCol}
      activePalette={activePalette}
    />
  );

  if (!processedData || processedData.length === 0) return null;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Header Desplegable */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm">
                Módulo de Gráficos Interactivos
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Visualización dinámica, métricas comparativas y exportación de
              diagramas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Panel de Controles / Toolbar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
              {/* Selector de Tipo de Gráfico con Botones */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Tipo:
                </span>
                {[
                  { id: "bar", label: "Barras", icon: BarChart3 },
                  { id: "bar-horizontal", label: "Horizontal", icon: BarChart3 },
                  { id: "line", label: "Líneas", icon: LineChartIcon },
                  { id: "area", label: "Áreas", icon: Sparkles },
                  { id: "pie", label: "Pastel", icon: PieChartIcon },
                  { id: "donut", label: "Dona", icon: PieChartIcon },
                  { id: "composed", label: "Compuesto", icon: TrendingUp },
                ].map((type) => {
                  const Icon = type.icon;
                  const isActive = chartType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setChartType(type.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200 font-semibold"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* Botón de Exportación rápida */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadChart}
                  disabled={isExporting || aggregatedData.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-50 transition-colors"
                  title="Descargar este gráfico en formato de imagen PNG de alta calidad"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">
                        ¡Descargado!
                      </span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Exportar PNG</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selectores de dimensiones y métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {/* Eje X / Categoría */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 truncate">
                  Eje X (Categoría):
                </label>
                <select
                  value={categoryCol}
                  onChange={(e) => setUserCategoryCol(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Métrica Principal */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 truncate">
                  Métrica Principal (Y):
                </label>
                <select
                  value={metricCol}
                  onChange={(e) => setUserMetricCol(e.target.value)}
                  disabled={aggregation === "count"}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {numericColumns.length > 0 ? (
                    numericColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))
                  ) : (
                    <option value="">(Sin columnas numéricas)</option>
                  )}
                </select>
              </div>

              {/* Función de Agregación */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 truncate">
                  Agregación:
                </label>
                <select
                  value={aggregation}
                  onChange={(e) => setRawAggregation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="sum">Suma total</option>
                  <option value="avg">Promedio</option>
                  <option value="count">Conteo de filas</option>
                  <option value="max">Valor Máximo</option>
                  <option value="min">Valor Mínimo</option>
                </select>
              </div>

              {/* Segunda Métrica Comparativa (Opcional) */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 truncate">
                  Métrica 2 (Opcional):
                </label>
                <select
                  value={secondaryMetricCol}
                  onChange={(e) => setUserSecondaryMetricCol(e.target.value)}
                  disabled={
                    aggregation === "count" ||
                    chartType === "pie" ||
                    chartType === "donut"
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">(Ninguna)</option>
                  {numericColumns
                    .filter((col) => col !== metricCol)
                    .map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                </select>
              </div>

              {/* Límite Top N */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 truncate">
                  Mostrar (Top N):
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={5}>Top 5 elementos</option>
                  <option value={10}>Top 10 elementos</option>
                  <option value={15}>Top 15 elementos</option>
                  <option value={20}>Top 20 elementos</option>
                  <option value={0}>Todos los elementos</option>
                </select>
              </div>

              {/* Ordenamiento */}
              <div>
                <label className="block text-slate-600 font-medium mb-1 truncate">
                  Orden de Datos:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="desc">Mayor a menor</option>
                  <option value="asc">Menor a mayor</option>
                  <option value="none">Orden original</option>
                </select>
              </div>
            </div>

            {/* Ajustes visuales: Paleta y Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200/70 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  Paleta de color:
                </span>
                <div className="flex items-center gap-1.5">
                  {Object.entries(COLOR_PALETTES).map(([key, pal]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPalette(key)}
                      title={pal.name}
                      className={`h-6 px-2 rounded-md flex items-center gap-1.5 transition-all text-[11px] ${
                        selectedPalette === key
                          ? "bg-white border-2 border-slate-800 font-semibold shadow-xs"
                          : "bg-white/80 border border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: pal.primary }}
                      />
                      <span className="hidden sm:inline">{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Cuadrícula</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Leyenda</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tarjetas KPI de Resumen del Gráfico */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
              <span className="text-slate-500 font-medium block mb-1">
                Total Agregado ({aggregation === "count" ? "Filas" : metricCol || "Métrica"})
              </span>
              <span className="text-lg font-bold text-slate-800">
                {chartSummary.total.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
              <span className="text-slate-500 font-medium block mb-1">
                Promedio por Categoría
              </span>
              <span className="text-lg font-bold text-slate-800">
                {chartSummary.avg.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <span className="text-emerald-700 font-medium block mb-1 truncate">
                Líder: {chartSummary.topCategory}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-emerald-900">
                  {chartSummary.topValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">
                  ({chartSummary.topPercent}%)
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
              <span className="text-slate-500 font-medium block mb-1">
                Categorías Graficadas
              </span>
              <span className="text-lg font-bold text-slate-800">
                {chartSummary.count}
              </span>
            </div>
          </div>

          {/* Área de Visualización Gráfica Recharts */}
          <div
            ref={chartContainerRef}
            className="w-full bg-slate-50/40 border border-slate-200/80 rounded-xl p-4 sm:p-6"
          >
            {aggregatedData.length > 0 ? (
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {/* Renderizado condicional según tipo de gráfico */}
                  {chartType === "bar" && (
                    <BarChart
                      data={aggregatedData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      {showGrid && (
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                      )}
                      <XAxis
                        dataKey="displayName"
                        stroke="#64748b"
                        fontSize={11}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                        }
                      />
                      <Tooltip content={renderTooltip} />
                      {showLegend && <Legend verticalAlign="top" height={36} />}
                      <Bar
                        dataKey="value"
                        name={metricCol || "Total"}
                        fill={activePalette.primary}
                        radius={[6, 6, 0, 0]}
                        animationDuration={600}
                      >
                        {selectedPalette === "vibrant" &&
                          aggregatedData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                activePalette.colors[
                                  index % activePalette.colors.length
                                ]
                              }
                            />
                          ))}
                      </Bar>
                      {secondaryMetricCol && (
                        <Bar
                          dataKey="value2"
                          name={secondaryMetricCol}
                          fill={activePalette.secondary}
                          radius={[6, 6, 0, 0]}
                          animationDuration={600}
                        />
                      )}
                    </BarChart>
                  )}

                  {chartType === "bar-horizontal" && (
                    <BarChart
                      layout="vertical"
                      data={aggregatedData}
                      margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                    >
                      {showGrid && (
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          horizontal={false}
                        />
                      )}
                      <XAxis
                        type="number"
                        stroke="#64748b"
                        fontSize={11}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                        }
                      />
                      <YAxis
                        dataKey="displayName"
                        type="category"
                        stroke="#64748b"
                        fontSize={11}
                        width={90}
                      />
                      <Tooltip content={renderTooltip} />
                      {showLegend && <Legend verticalAlign="top" height={36} />}
                      <Bar
                        dataKey="value"
                        name={metricCol || "Total"}
                        fill={activePalette.primary}
                        radius={[0, 6, 6, 0]}
                        animationDuration={600}
                      >
                        {selectedPalette === "vibrant" &&
                          aggregatedData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                activePalette.colors[
                                  index % activePalette.colors.length
                                ]
                              }
                            />
                          ))}
                      </Bar>
                      {secondaryMetricCol && (
                        <Bar
                          dataKey="value2"
                          name={secondaryMetricCol}
                          fill={activePalette.secondary}
                          radius={[0, 6, 6, 0]}
                          animationDuration={600}
                        />
                      )}
                    </BarChart>
                  )}

                  {chartType === "line" && (
                    <LineChart
                      data={aggregatedData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      {showGrid && (
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                      )}
                      <XAxis
                        dataKey="displayName"
                        stroke="#64748b"
                        fontSize={11}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                        }
                      />
                      <Tooltip content={renderTooltip} />
                      {showLegend && <Legend verticalAlign="top" height={36} />}
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={metricCol || "Tendencia"}
                        stroke={activePalette.primary}
                        strokeWidth={3}
                        dot={{ r: 4, fill: activePalette.primary }}
                        activeDot={{ r: 7 }}
                        animationDuration={700}
                      />
                      {secondaryMetricCol && (
                        <Line
                          type="monotone"
                          dataKey="value2"
                          name={secondaryMetricCol}
                          stroke={activePalette.secondary}
                          strokeWidth={2.5}
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: activePalette.secondary }}
                          animationDuration={700}
                        />
                      )}
                    </LineChart>
                  )}

                  {chartType === "area" && (
                    <AreaChart
                      data={aggregatedData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <defs>
                        <linearGradient
                          id="areaColorGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={activePalette.primary}
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor={activePalette.primary}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      {showGrid && (
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                      )}
                      <XAxis
                        dataKey="displayName"
                        stroke="#64748b"
                        fontSize={11}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                        }
                      />
                      <Tooltip content={renderTooltip} />
                      {showLegend && <Legend verticalAlign="top" height={36} />}
                      <Area
                        type="monotone"
                        dataKey="value"
                        name={metricCol || "Área"}
                        stroke={activePalette.primary}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#areaColorGrad)"
                        animationDuration={700}
                      />
                    </AreaChart>
                  )}

                  {(chartType === "pie" || chartType === "donut") && (
                    <PieChart>
                      <Tooltip content={renderTooltip} />
                      {showLegend && (
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                        />
                      )}
                      <Pie
                        data={aggregatedData}
                        dataKey="value"
                        nameKey="displayName"
                        cx="50%"
                        cy="50%"
                        innerRadius={chartType === "donut" ? 70 : 0}
                        outerRadius={120}
                        paddingAngle={chartType === "donut" ? 3 : 1}
                        animationDuration={700}
                      >
                        {aggregatedData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              activePalette.colors[
                                index % activePalette.colors.length
                              ]
                            }
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  )}

                  {chartType === "composed" && (
                    <ComposedChart
                      data={aggregatedData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      {showGrid && (
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          vertical={false}
                        />
                      )}
                      <XAxis
                        dataKey="displayName"
                        stroke="#64748b"
                        fontSize={11}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                        }
                      />
                      <Tooltip content={renderTooltip} />
                      {showLegend && <Legend verticalAlign="top" height={36} />}
                      <Bar
                        dataKey="value"
                        name={metricCol || "Barras"}
                        fill={activePalette.primary}
                        radius={[6, 6, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey={secondaryMetricCol ? "value2" : "value"}
                        name={
                          secondaryMetricCol
                            ? secondaryMetricCol
                            : "Tendencia Promedio"
                        }
                        stroke={
                          secondaryMetricCol
                            ? activePalette.secondary
                            : "#f59e0b"
                        }
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 text-xs">
                <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
                <p className="font-medium text-slate-500">
                  No se pudieron generar datos para esta combinación
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Verifique que la columna seleccionada tenga registros válidos o
                  seleccione "Conteo de filas".
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
