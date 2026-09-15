import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Table as TableIcon,
} from "lucide-react";

export default function DataExplorer() {
  const { rawData, processedData, setProcessedData, columns } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedColumnFilter, setSelectedColumnFilter] = useState("");
  const [columnFilterValue, setColumnFilterValue] = useState("");

  const filteredData = useMemo(() => {
    if (!rawData) return [];

    return rawData.filter((row) => {
      const matchesSearch = Object.values(row).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );

      let matchesColumn = true;
      if (selectedColumnFilter && columnFilterValue) {
        const cellValue = String(row[selectedColumnFilter] ?? "").toLowerCase();
        matchesColumn = cellValue.includes(columnFilterValue.toLowerCase());
      }

      return matchesSearch && matchesColumn;
    });
  }, [rawData, searchTerm, selectedColumnFilter, columnFilterValue]);

  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData];
    if (!sortConfig.key) return dataToSort;

    return dataToSort.sort((a, b) => {
      const valA = a[sortConfig.key] ?? "";
      const valB = b[sortConfig.key] ?? "";

      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB) && valA !== "" && valB !== "") {
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
      if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  React.useEffect(() => {
    setProcessedData(sortedData);
  }, [sortedData, setProcessedData]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (columnKey) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedColumnFilter("");
    setColumnFilterValue("");
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Toolbar / Filters */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar en todos los datos..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedColumnFilter}
            onChange={(e) => {
              setSelectedColumnFilter(e.target.value);
              setColumnFilterValue("");
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Filtrar por columna...</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          {selectedColumnFilter && (
            <input
              type="text"
              value={columnFilterValue}
              onChange={(e) => {
                setColumnFilterValue(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Filtrar ${selectedColumnFilter}...`}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          {(searchTerm || selectedColumnFilter || sortConfig.key) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-200/60 hover:bg-slate-200 rounded-lg transition-colors"
              title="Limpiar filtros"
            >
              <FilterX className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="text-xs uppercase bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-12 text-center">#</th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 font-semibold cursor-pointer hover:bg-slate-200/70 transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{col}</span>
                    {sortConfig.key === col ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-slate-400 font-mono text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="px-4 py-2.5 whitespace-nowrap text-slate-700"
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
                  className="py-12 text-center text-slate-400"
                >
                  <TableIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No se encontraron resultados para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginator */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>registros por página</span>
        </div>

        <div>
          Mostrando{" "}
          <span className="font-semibold text-slate-700">
            {sortedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{" "}
          a{" "}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * itemsPerPage, sortedData.length)}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-slate-700">
            {sortedData.length}
          </span>{" "}
          registros
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2">
            Página{" "}
            <span className="font-semibold text-slate-700">{currentPage}</span>{" "}
            de{" "}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
