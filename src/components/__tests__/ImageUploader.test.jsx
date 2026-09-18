import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ImageUploader from "../ImageUploader";

describe("ImageUploader", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("convierte un JPG en data URL y lo entrega al componente padre", () => {
    class MockFileReader {
      readAsDataURL() {
        this.result = "data:image/jpeg;base64,cHJldmlldw==";
        this.onload();
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);
    const onChange = vi.fn();
    render(<ImageUploader onChange={onChange} />);

    const file = new File(["contenido jpg"], "planta.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("Subir imagen JPG"), {
      target: { files: [file] },
    });

    expect(onChange).toHaveBeenCalledWith("data:image/jpeg;base64,cHJldmlldw==", "planta.jpg");
    expect(screen.getByRole("img", { name: "Vista previa: planta.jpg" })).toBeInTheDocument();
  });

  it("rechaza un archivo que no sea JPG", () => {
    render(<ImageUploader />);
    const png = new File(["png"], "planta.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText("Subir imagen JPG"), {
      target: { files: [png] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Selecciona una imagen JPG o JPEG.");
  });
});
