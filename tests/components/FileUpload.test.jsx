import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUpload from "../../src/components/FileUpload";
import { renderWithMockData } from "../test-utils";

describe("Componente FileUpload", () => {
  it("debe renderizar el área de carga de archivos correctamente", () => {
    renderWithMockData(<FileUpload />, { initialData: null });

    expect(
      screen.getByRole("heading", { name: /Crear un nuevo reporte/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Arrastra tu archivo Excel aquí/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Seleccionar archivo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Formatos compatibles: .XLSX y .XLS/i),
    ).toBeInTheDocument();
  });

  it("debe permitir seleccionar un archivo mediante el input file oculto", async () => {
    const user = userEvent.setup();
    renderWithMockData(<FileUpload />, { initialData: null });

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    const fakeFile = new File(["dummy content"], "test_datos.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await user.upload(fileInput, fakeFile);

    expect(fileInput.files).toHaveLength(1);
    expect(fileInput.files[0].name).toBe("test_datos.xlsx");
  });

  it("debe cambiar de estilo durante el evento drag over y drag leave", () => {
    renderWithMockData(<FileUpload />, { initialData: null });

    const dropZone = screen.getByRole("button", {
      name: /Subir archivo Excel/i,
    });

    fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [] },
    });

    expect(screen.getByText(/Suelta el archivo aquí/i)).toBeInTheDocument();

    fireEvent.dragLeave(dropZone);

    expect(
      screen.getByText(/Arrastra tu archivo Excel aquí/i),
    ).toBeInTheDocument();
  });

  it("debe procesar archivo al hacer drop", () => {
    renderWithMockData(<FileUpload />, { initialData: null });

    const dropZone = screen.getByRole("button", {
      name: /Subir archivo Excel/i,
    });

    const fakeFile = new File(["dummy"], "datos.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [fakeFile],
      },
    });

    expect(
      screen.getByText(/Arrastra tu archivo Excel aquí/i),
    ).toBeInTheDocument();
  });

  it("debe mostrar el estado de carga (loader) cuando isLoading es true", () => {
    renderWithMockData(<FileUpload />, {
      initialData: null,
      initialLoading: true,
    });

    expect(screen.getByText(/Procesando tu archivo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Estamos analizando los datos del Excel/i),
    ).toBeInTheDocument();
  });

  it("debe mostrar la alerta de error cuando existe un error en el contexto", () => {
    const errorMsg = "Por favor, cargue un archivo válido con formato .xlsx o .xls.";
    renderWithMockData(<FileUpload />, {
      initialData: null,
      initialError: errorMsg,
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/No pudimos procesar el archivo/i),
    ).toBeInTheDocument();
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it("debe activar el input al presionar la tecla Enter o Espacio", () => {
    renderWithMockData(<FileUpload />, { initialData: null });

    const dropZone = screen.getByRole("button", {
      name: /Subir archivo Excel/i,
    });
    const fileInput = document.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput, "click");

    fireEvent.keyDown(dropZone, { key: "Enter" });
    expect(clickSpy).toHaveBeenCalled();

    fireEvent.keyDown(dropZone, { key: " " });
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });
});
