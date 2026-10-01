import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import {
  BarChart3,
  Calculator,
  TrendingUp,
  Hash,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function DataAnalysis() {
  const { processedData, columns } = useData();
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

  const [selectedMetricCol, setSelectedMetricCol] = useState(
    numericColumns[0] || "",
  );
  const [selectedXAxis, setSelectedXAxis] = useState(columns[0] || "");
  const [selectedYAxis, setSelectedYAxis] = useState(numericColumns[0] || "");
  const [chartType, setChartType] = useState("bar");

  React.useEffect(() => {
    if (numericColumns.length > 0) {
      if (!selectedMetricCol) setSelectedMetricCol(numericColumns[0]);
      if (!selectedYAxis) setSelectedYAxis(numericColumns[0]);
    }
    if (columns.length > 0 && !selectedXAxis) {
      setSelectedXAxis(columns[0]);
    }
  }, [numericColumns, columns]);

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

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  if (!processedData || processedData.length === 0) return null;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              Análisis Estadístico e Indicadores (KPIs)
            </h3>
            <p className="text-xs text-slate-500">
              Resumen métrico y visualización dinámica de datos
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
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Resumen Métrico Numérico
              </h4>

              {numericColumns.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Métrica:</span>
                  <select
                    value={selectedMetricCol}
                    onChange={(e) => setSelectedMetricCol(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    Suma Total
                  </span>
                  <span className="text-xl font-bold text-slate-800">
                    {kpiStats.sum}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    Promedio
                  </span>
                  <span className="text-xl font-bold text-slate-800">
                    {kpiStats.avg}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    Valor Mínimo
                  </span>
                  <span className="text-xl font-bold text-slate-800">
                    {kpiStats.min}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 block mb-1">
                    Valor Máximo
                  </span>
                  <span className="text-xl font-bold text-slate-800">
                    {kpiStats.max}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                No se detectaron columnas numéricas continuas para calcular
                estadísticas avanzadas.
              </p>
            )}
          </div>

          <hr className="border-slate-100" />

          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                Visualización Gráfica (Top 10)
              </h4>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Eje X:</span>
                  <select
                    value={selectedXAxis}
                    onChange={(e) => setSelectedXAxis(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
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
                    <span className="text-slate-500">Eje Y:</span>
                    <select
                      value={selectedYAxis}
                      onChange={(e) => setSelectedYAxis(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
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
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl">
                <div className="space-y-3">
                  {chartData.map((item, idx) => {
                    const percentage = Math.max(
                      5,
                      Math.round((item.value / maxChartValue) * 100),
                    );
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-700 truncate max-w-[200px]">
                            {item.name}
                          </span>
                          <span className="text-emerald-600 font-semibold">
                            {item.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs">
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
