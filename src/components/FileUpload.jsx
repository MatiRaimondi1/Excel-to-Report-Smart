import { useRef, useState } from "react";
import { useData } from "../context/DataContext";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";

export default function FileUpload() {
  const { processFile, isLoading, error } = useData();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoading) {
      setIsDragging(true);
    }
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

    if (isLoading) return;

    const files = e.dataTransfer.files;

    if (files?.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;

    if (files?.length > 0) {
      processFile(files[0]);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !isLoading) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
            <PlusCircle className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Crear un nuevo reporte
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Carga un archivo Excel para comenzar a generar tu reporte.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Card */}
      <div
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-disabled={isLoading}
        aria-label="Subir archivo Excel"
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`
          group relative overflow-hidden rounded-2xl border
          bg-white dark:bg-zinc-900 p-6 shadow-sm
          transition-all duration-300
          sm:p-10
          ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-lg shadow-emerald-100/60 dark:shadow-none"
              : "border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-zinc-700 hover:shadow-md"
          }
          ${isLoading ? "cursor-wait" : "cursor-pointer"}
        `}
      >
        {/* Decorative background */}
        <div
          className={`
            pointer-events-none absolute -right-20 -top-20 h-48 w-48
            rounded-full bg-emerald-100/40 dark:bg-emerald-900/10 blur-3xl
            transition-opacity duration-300
            ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
          disabled={isLoading}
        />

        <div className="relative flex min-h-[300px] flex-col items-center justify-center text-center">
          {isLoading ? (
            <>
              {/* Loading */}
              <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-zinc-800">
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white dark:border-zinc-900 bg-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-100">
                Procesando tu archivo
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-zinc-400">
                Estamos analizando los datos del Excel. Esto puede tardar unos
                segundos.
              </p>

              <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-500" />
              </div>
            </>
          ) : (
            <>
              {/* Icon */}
              <div
                className={`
                  mb-6 flex h-20 w-20 items-center justify-center
                  rounded-2xl transition-all duration-300
                  ${
                    isDragging
                      ? "scale-110 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                      : "bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-100 dark:group-hover:bg-zinc-700"
                  }
                `}
              >
                <FileSpreadsheet className="h-10 w-10" />
              </div>

              {/* Text */}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                {isDragging
                  ? "Suelta el archivo aquí"
                  : "Arrastra tu archivo Excel aquí"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-zinc-400">
                También puedes hacer clic para buscarlo en tu equipo.
              </p>

              {/* Button */}
              <div
                className="
                  mt-6 inline-flex items-center gap-2 rounded-xl
                  bg-emerald-600 px-5 py-2.5
                  text-sm font-semibold text-white
                  shadow-sm shadow-emerald-200 dark:shadow-none
                  transition-all duration-200
                  group-hover:bg-emerald-700 dark:group-hover:bg-emerald-500
                  group-hover:shadow-md
                "
              >
                <Upload className="h-4 w-4" />
                Seleccionar archivo
              </div>

              {/* Supported formats */}
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                Formatos compatibles: .XLSX y .XLS
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="
            mt-4 flex items-start gap-3 rounded-xl
            border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30
            px-4 py-3.5 text-sm text-rose-700 dark:text-rose-400
            shadow-sm
          "
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/50">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>

          <div>
            <p className="font-semibold">No pudimos procesar el archivo</p>
            <p className="mt-0.5 text-rose-600/90 dark:text-rose-300">{error}</p>
          </div>
        </div>
      )}
    </section>
  );
}
