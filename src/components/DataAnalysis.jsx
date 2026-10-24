import { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";
import {
  BarChart3,
  Calculator,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DataAnalysis() {
  const { processedData, columns } = useData();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(true);

  const numericColumns = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    return columns.filter((col) => {
      const numericCount = processedData.filter((row) => {
        const val = row[col];
        return (
          val !== null && val !== undefined && val !== "" && !isNaN(Number(val))
        );
      }).length;
      return numericCount > processedData.length * 0.5;
    });
  }, [processedData, columns]);

  const [userMetricCol, setUserMetricCol] = useState("");
  const selectedMetricCol =
    userMetricCol && numericColumns.includes(userMetricCol)
      ? userMetricCol
      : numericColumns[0] || "";

  const [userXAxis, setUserXAxis] = useState("");
  const selectedXAxis =
    userXAxis && columns.includes(userXAxis) ? userXAxis : columns[0] || "";

  const [userYAxis, setUserYAxis] = useState("");
  const selectedYAxis =
    userYAxis && numericColumns.includes(userYAxis)
      ? userYAxis
      : numericColumns[0] || "";

  const kpiStats = useMemo(() => {
    if (!processedData || !selectedMetricCol) {
      return { sum: 0, avg: 0, min: 0, max: 0, count: 0 };
    }

    const values = processedData
      .map((row) => Number(row[selectedMetricCol]))
      .filter((val) => !isNaN(val));

    if (values.length === 0) {
      return { sum: 0, avg: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      sum: sum.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      avg: avg.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      min: min.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      max: max.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      count: values.length,
    };
  }, [processedData, selectedMetricCol]);

  const chartData = useMemo(() => {
    if (!processedData || !selectedXAxis || !selectedYAxis) return [];

    const aggregated = {};
    processedData.forEach((row) => {
      const key = String(row[selectedXAxis] ?? "Sin Categoría").slice(0, 15);
      const val = Number(row[selectedYAxis]) || 0;
      aggregated[key] = (aggregated[key] || 0) + val;
    });

    return Object.entries(aggregated)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 10);
  }, [processedData, selectedXAxis, selectedYAxis]);

  if (!processedData || processedData.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-6">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-zinc-100 text-sm">
              Análisis Estadístico e Indicadores (KPIs)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Resumen métrico y visualización dinámica de datos
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
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Resumen Métrico Numérico
              </h4>

              {numericColumns.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-zinc-400">Métrica:</span>
                  <select
                    value={selectedMetricCol}
                    onChange={(e) => setUserMetricCol(e.target.value)}
                    className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {numericColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {numericColumns.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 block mb-1">
                    Suma Total
                  </span>
                  <span className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                    {kpiStats.sum}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 block mb-1">
                    Promedio
                  </span>
                  <span className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                    {kpiStats.avg}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 block mb-1">
                    Valor Mínimo
                  </span>
                  <span className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                    {kpiStats.min}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 block mb-1">
                    Valor Máximo
                  </span>
                  <span className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                    {kpiStats.max}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-zinc-500 italic bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                No se detectaron columnas numéricas continuas para calcular
                estadísticas avanzadas.
              </p>
            )}
          </div>

          <hr className="border-slate-100 dark:border-zinc-800" />

          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Visualización Gráfica (Top 10)
              </h4>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-zinc-400">Eje X:</span>
                  <select
                    value={selectedXAxis}
                    onChange={(e) => setUserXAxis(e.target.value)}
                    className="px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded focus:outline-none"
                  >
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                {numericColumns.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-zinc-400">Eje Y:</span>
                    <select
                      value={selectedYAxis}
                      onChange={(e) => setUserYAxis(e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 rounded focus:outline-none"
                    >
                      {numericColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {chartData.length > 0 && numericColumns.length > 0 ? (
              <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800 p-4 rounded-xl">
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#27272a" : "#e2e8f0"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={isDark ? "#a1a1aa" : "#64748b"}
                        fontSize={11}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke={isDark ? "#a1a1aa" : "#64748b"}
                        fontSize={11}
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#27272a" : "#fff",
                          color: isDark ? "#fff" : "#000",
                          borderRadius: "8px",
                          border: isDark ? "1px solid #27272a" : "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                        cursor={{ fill: isDark ? "#27272a" : "#e2e8f0" }}
                        itemStyle={{ color: "#34d399" }}
                      />
                      <Bar
                        dataKey="value"
                        name={selectedYAxis}
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-zinc-950/60 border border-slate-100 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-500 text-xs">
                Seleccione columnas válidas para renderizar la visualización de
                datos.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

}
