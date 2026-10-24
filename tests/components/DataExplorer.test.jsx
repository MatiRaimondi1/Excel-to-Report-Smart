import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import DataExplorer from "../../src/components/DataExplorer";
import { renderWithMockData, mockSalesData, mockSalesColumns } from "../test-utils";

describe("Componente DataExplorer", () => {
  it("debe renderizar la tabla con las columnas y registros correspondientes", () => {
    renderWithMockData(<DataExplorer />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    expect(screen.getByPlaceholderText(/Buscar en todos los datos.../i)).toBeInTheDocument();
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("Monitor 4K")).toBeInTheDocument();
    expect(screen.getByText("Teclado Mecánico")).toBeInTheDocument();
    expect(screen.getByText(/Mostrando/i)).toBeInTheDocument();
  });

  it("debe filtrar registros mediante la barra de búsqueda global", () => {
    renderWithMockData(<DataExplorer />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const searchInput = screen.getByPlaceholderText(/Buscar en todos los datos.../i);

    fireEvent.change(searchInput, { target: { value: "Silla" } });

    expect(screen.getByText("Silla Ergonómica")).toBeInTheDocument();
    expect(screen.queryByText("Laptop Pro")).not.toBeInTheDocument();
    expect(screen.queryByText("Monitor 4K")).not.toBeInTheDocument();
  });

  it("debe permitir filtrar por una columna específica", () => {
    renderWithMockData(<DataExplorer />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const colSelect = screen.getByDisplayValue(/Filtrar por columna.../i);
    fireEvent.change(colSelect, { target: { value: "Categoria" } });

    const specificFilterInput = screen.getByPlaceholderText(/Filtrar Categoria.../i);
    expect(specificFilterInput).toBeInTheDocument();

    fireEvent.change(specificFilterInput, { target: { value: "Mobiliario" } });

    expect(screen.getByText("Silla Ergonómica")).toBeInTheDocument();
    expect(screen.getByText("Escritorio Elevable")).toBeInTheDocument();
    expect(screen.queryByText("Laptop Pro")).not.toBeInTheDocument();
  });

  it("debe ordenar registros al hacer clic en el encabezado de una columna", () => {
    renderWithMockData(<DataExplorer />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const productoHeader = screen.getByRole("columnheader", {
      name: /Producto/i,
    });

    fireEvent.click(productoHeader);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Escritorio Elevable");
    fireEvent.click(productoHeader);
    const rowsDesc = screen.getAllByRole("row");
    expect(rowsDesc[1]).toHaveTextContent("Teclado Mecánico");
  });

  it("debe permitir limpiar filtros con el botón Limpiar", () => {
    renderWithMockData(<DataExplorer />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const searchInput = screen.getByPlaceholderText(/Buscar en todos los datos.../i);
    fireEvent.change(searchInput, { target: { value: "Laptop" } });

    const clearButton = screen.getByRole("button", { name: /Limpiar/i });
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(searchInput.value).toBe("");
    expect(screen.getByText("Monitor 4K")).toBeInTheDocument();
    expect(screen.getByText("Teclado Mecánico")).toBeInTheDocument();
  });

  it("debe mostrar mensaje de sin resultados si no hay coincidencias", () => {
    renderWithMockData(<DataExplorer />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const searchInput = screen.getByPlaceholderText(/Buscar en todos los datos.../i);
    fireEvent.change(searchInput, { target: { value: "Terminator 3000" } });

    expect(
      screen.getByText(/No se encontraron resultados para los filtros aplicados/i),
    ).toBeInTheDocument();
  });

  it("debe manejar la paginación correctamente navegando entre páginas", () => {
    const multiPageData = Array.from({ length: 25 }, (_, i) => ({
      ID: i + 1,
      Producto: `Item ${i + 1}`,
      Categoria: "General",
      Ventas: (i + 1) * 10,
    }));
    const multiPageCols = ["ID", "Producto", "Categoria", "Ventas"];

    renderWithMockData(<DataExplorer />, {
      initialData: multiPageData,
      initialColumns: multiPageCols,
    });

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 10")).toBeInTheDocument();
    expect(screen.queryByText("Item 11")).not.toBeInTheDocument();
    expect(screen.getByText(/^Página/i).parentElement).toHaveTextContent("Página 1 de 3");

    const paginationButtons = screen.getAllByRole("button");
    const prevPageBtn = paginationButtons[paginationButtons.length - 2];
    const nextPageBtn = paginationButtons[paginationButtons.length - 1];

    expect(prevPageBtn).toBeDisabled();
    expect(nextPageBtn).not.toBeDisabled();

    fireEvent.click(nextPageBtn);

    expect(screen.getByText("Item 11")).toBeInTheDocument();
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    expect(screen.getByText(/^Página/i).parentElement).toHaveTextContent("Página 2 de 3");
    expect(prevPageBtn).not.toBeDisabled();

    fireEvent.click(prevPageBtn);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText(/^Página/i).parentElement).toHaveTextContent("Página 1 de 3");
  });

  it("debe permitir cambiar la cantidad de registros por página", () => {
    const multiPageData = Array.from({ length: 30 }, (_, i) => ({
      ID: i + 1,
      Producto: `Producto ${i + 1}`,
      Categoria: "Varios",
      Ventas: 100,
    }));
    const multiPageCols = ["ID", "Producto", "Categoria", "Ventas"];

    renderWithMockData(<DataExplorer />, {
      initialData: multiPageData,
      initialColumns: multiPageCols,
    });

    const itemsSelect = screen.getByDisplayValue("10");
    fireEvent.change(itemsSelect, { target: { value: "25" } });

    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.getByText("Producto 25")).toBeInTheDocument();
    expect(screen.queryByText("Producto 26")).not.toBeInTheDocument();
    expect(screen.getByText(/^Página/i).parentElement).toHaveTextContent("Página 1 de 2");
  });

  it("debe colapsar y expandir la sección del explorador de datos al hacer clic en el encabezado", () => {
    renderWithMockData(<DataExplorer />, {
      initialData: mockSalesData,
      initialColumns: mockSalesColumns,
    });

    const header = screen.getByText(/Explorador de Datos/i).closest("div");

    expect(screen.getByPlaceholderText(/Buscar en todos los datos.../i)).toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.queryByPlaceholderText(/Buscar en todos los datos.../i)).not.toBeInTheDocument();

    fireEvent.click(header);
    expect(screen.getByPlaceholderText(/Buscar en todos los datos.../i)).toBeInTheDocument();
  });
});
