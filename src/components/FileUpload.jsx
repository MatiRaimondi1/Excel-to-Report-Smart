import React, { useState, useRef } from "react";
import { useData } from "../context/DataContext";
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";

export default function FileUpload() {
  const { processFile, isLoading, error } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[260px] ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50 shadow-sm"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-slate-600">
              Procesando archivo Excel...
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
              <FileSpreadsheet className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Arrastra y suelta tu archivo Excel aquí
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              O haz clic para seleccionar un archivo (.xlsx, .xls) desde tu
              equipo
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <Upload className="w-4 h-4" />
              Seleccionar Archivo
            </span>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
