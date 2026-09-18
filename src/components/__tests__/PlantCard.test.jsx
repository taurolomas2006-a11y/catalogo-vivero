import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PlantCard from "../PlantCard";

describe("PlantCard", () => {
  it("renderiza una imagen entregada como data URL", () => {
    const imageUrl = "data:image/jpeg;base64,cHJldmlldw==";

    render(
      <PlantCard
        plant={{
          category: "Interior",
          id: "monstera-1",
          imageUrl,
          name: "Monstera",
          price: 4500,
          stock: 10,
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "Foto de Monstera" })).toHaveAttribute("src", imageUrl);
  });

  it("muestra el precio en pesos argentinos cuando está disponible", () => {
    render(
      <PlantCard
        plant={{
          category: "Interior",
          id: "monstera-1",
          imageUrl: "",
          name: "Monstera",
          price: 4500.5,
          stock: 10,
        }}
      />,
    );

    expect(screen.getByText(/4\.500,5/)).toBeInTheDocument();
  });

  it.each([
    ["available", "Stock disponible"],
    [null, "Stock no disponible"],
    [4, "Últimas unidades · Stock: 4 unidades"],
  ])("muestra el estado de stock %s", (stock, expectedLabel) => {
    render(
      <PlantCard
        plant={{
          category: "Interior",
          id: "monstera-1",
          imageUrl: "",
          name: "Monstera",
          price: null,
          stock,
        }}
      />,
    );

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
