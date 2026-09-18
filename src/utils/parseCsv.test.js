import { describe, expect, it } from "vitest";
import { parseCsv, toPlantInventory } from "./parseCsv";

describe("toPlantInventory", () => {
  it("incorpora Precio y admite el encabezado Imagen-URL publicado", () => {
    const rows = parseCsv(
      "Nombre,Categoria,Stock,Precio,Imagen-URL\nalegrias,florales,1,4.500,https://example.com/alegrias.jpg",
    );

    expect(toPlantInventory(rows)).toEqual([
      expect.objectContaining({
        imageUrl: "https://example.com/alegrias.jpg",
        name: "alegrias",
        price: 4500,
      }),
    ]);
  });

  it("normaliza precios con decimales y omite precios inválidos", () => {
    const inventory = toPlantInventory([
      { Nombre: "Lavanda", Precio: "$ 4.500,50" },
      { Nombre: "Menta", Precio: "sin precio" },
    ]);

    expect(inventory.map((plant) => plant.price)).toEqual([4500.5, null]);
  });
});
