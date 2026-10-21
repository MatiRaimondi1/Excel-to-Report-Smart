import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import DataQuality from "../../src/components/DataQuality";
import { renderWithMockData, mockSalesData, mockSalesColumns } from "../test-utils";

describe("Componente DataQuality", () => {
  it("debe renderizar el diagnóstico y la salud global del dataset", () => {
    renderWithMockData(<DataQuality />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    expect(
      screen.getByText(/Diagnóstico y Calidad de Datos/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Puntaje de salud de los datos:/i)).toBeInTheDocument();
    expect(screen.getByText("Estado de Salud")).toBeInTheDocument();
    expect(
      screen.getByText(/Los datos se encuentran limpios y estructurados/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/0 duplicados/i)).toBeInTheDocument();
    expect(screen.getByText(/0 celdas nulas/i)).toBeInTheDocument();
  });

  it("debe detectar celdas vacías y duplicados en datasets con inconsistencias", () => {
    const dataWithFlaws = [
      { ID: 1, Producto: "Laptop", Ventas: 100 },
      { ID: 1, Producto: "Laptop", Ventas: 100 },
      { ID: 2, Producto: "", Ventas: null },
    ];
    const columnsWithFlaws = ["ID", "Producto", "Ventas"];

    renderWithMockData(<DataQuality />, {
      initialData: dataWithFlaws,
      initialColumns: columnsWithFlaws,
    });

    expect(screen.getByText(/1 duplicados/i)).toBeInTheDocument();
    expect(screen.getByText(/2 celdas nulas/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Se detectaron inconsistencias o valores faltantes/i),
    ).toBeInTheDocument();

    const removeDupBtn = screen.getByRole("button", {
      name: /Eliminar Duplicados \(1\)/i,
    });
    expect(removeDupBtn).not.toBeDisabled();

    const fillNullsBtn = screen.getByRole("button", {
      name: /Rellenar Vacíos/i,
    });
    expect(fillNullsBtn).not.toBeDisabled();
  });

  it("debe ejecutar la limpieza de duplicados al hacer clic en 'Eliminar Duplicados'", () => {
    const dataWithFlaws = [
      { ID: 1, Producto: "Laptop", Ventas: 100 },
      { ID: 1, Producto: "Laptop", Ventas: 100 },
      { ID: 2, Producto: "Mouse", Ventas: 50 },
    ];
    const columns = ["ID", "Producto", "Ventas"];

    renderWithMockData(<DataQuality />, {
      initialData: dataWithFlaws,
      initialColumns: columns,
    });

    const removeDupBtn = screen.getByRole("button", {
      name: /Eliminar Duplicados \(1\)/i,
    });
    fireEvent.click(removeDupBtn);

    expect(screen.getByText(/0 duplicados/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Eliminar Duplicados \(0\)/i }),
    ).toBeDisabled();
  });

  it("debe ejecutar el rellenado de nulos al hacer clic en 'Rellenar Vacíos'", () => {
    const dataWithNulls = [
      { ID: 1, Producto: "Laptop", Ventas: 100 },
      { ID: 2, Producto: "", Ventas: null },
    ];
    const columns = ["ID", "Producto", "Ventas"];

    renderWithMockData(<DataQuality />, {
      initialData: dataWithNulls,
      initialColumns: columns,
    });

    const fillNullsBtn = screen.getByRole("button", {
      name: /Rellenar Vacíos/i,
    });
    fireEvent.click(fillNullsBtn);

    expect(screen.getByText(/0 celdas nulas/i)).toBeInTheDocument();
  });

  it("debe permitir limpiar espacios en blanco y restaurar original", () => {
    const dataWithSpaces = [
      { ID: 1, Producto: "   Teclado   ", Ventas: 100 },
    ];
    const columns = ["ID", "Producto", "Ventas"];

    renderWithMockData(<DataQuality />, {
      initialData: dataWithSpaces,
      initialColumns: columns,
    });

    const trimBtn = screen.getByRole("button", {
      name: /Limpiar Espacios en Blanco/i,
    });
    fireEvent.click(trimBtn);

    const restoreBtn = screen.getByRole("button", {
      name: /Restaurar Original/i,
    });
    fireEvent.click(restoreBtn);

    expect(restoreBtn).toBeInTheDocument();
  });

  it("debe permitir colapsar y expandir el panel al hacer clic en el encabezado", () => {
    renderWithMockData(<DataQuality />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const header = screen.getByText(/Diagnóstico y Calidad de Datos/i).closest("div");
    expect(screen.getByText("Estado de Salud")).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByText("Estado de Salud")).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByText("Estado de Salud")).toBeInTheDocument();
  });

  it("no debe renderizar nada si processedData está vacío o es nulo", () => {
    const { container } = renderWithMockData(<DataQuality />, {
      initialData: [],
      initialColumns: [],
    });

    expect(container.firstChild).toBeNull();
  });
});
