import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as XLSX from "xlsx";
import { DataProvider, useData } from "../../src/context/DataContext";

describe("DataContext y DataProvider", () => {
  it("debe lanzar un error si useData se utiliza fuera de un DataProvider", () => {
    expect(() => {
      renderHook(() => useData());
    }).toThrow("useData debe ser utilizado dentro de un DataProvider");
  });

  it("debe proveer valores iniciales vacíos por defecto", () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    expect(result.current.rawData).toBeNull();
    expect(result.current.processedData).toBeNull();
    expect(result.current.fileName).toBe("");
    expect(result.current.columns).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.reportHistory).toEqual([]);
  });

  it("debe rechazar archivos con extensiones no soportadas", async () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    const invalidFile = new File(["contenido"], "reporte.txt", {
      type: "text/plain",
    });

    await act(async () => {
      await result.current.processFile(invalidFile);
    });

    expect(result.current.error).toMatch(
      /Por favor, cargue un archivo válido con formato \.xlsx o \.xls\./i,
    );
    expect(result.current.rawData).toBeNull();
  });

  it("debe procesar un archivo Excel válido correctamente usando XLSX", async () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    const ws = XLSX.utils.json_to_sheet([
      { Producto: "Mouse", Precio: 25 },
      { Producto: "Teclado", Precio: 75 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    const validExcelFile = new File([wbBuffer], "productos.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await act(async () => {
      await result.current.processFile(validExcelFile);
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.error).toBeNull();
    expect(result.current.fileName).toBe("productos.xlsx");
    expect(result.current.columns).toEqual(["Producto", "Precio"]);
    expect(result.current.rawData).toHaveLength(2);
    expect(result.current.rawData[0].Producto).toBe("Mouse");
  });

  it("debe reiniciar el estado con resetData", async () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    act(() => {
      result.current.resetData();
    });

    expect(result.current.rawData).toBeNull();
    expect(result.current.fileName).toBe("");
    expect(result.current.columns).toEqual([]);
  });

  it("debe persistir el historial en localStorage y permitir eliminar y limpiar", () => {
    const { result } = renderHook(() => useData(), {
      wrapper: DataProvider,
    });

    act(() => {
      result.current.saveToHistory({
        title: "Reporte de Ventas",
        theme: "indigo",
        rowCount: 100,
      });
    });

    expect(result.current.reportHistory).toHaveLength(1);
    expect(result.current.reportHistory[0].title).toBe("Reporte de Ventas");

    const savedId = result.current.reportHistory[0].id;

    act(() => {
      result.current.deleteHistoryItem(savedId);
    });

    expect(result.current.reportHistory).toHaveLength(0);

    act(() => {
      result.current.saveToHistory({ title: "Reporte 2" });
      result.current.saveToHistory({ title: "Reporte 3" });
    });

    expect(result.current.reportHistory).toHaveLength(2);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.reportHistory).toHaveLength(0);
  });
});
