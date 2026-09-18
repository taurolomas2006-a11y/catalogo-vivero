/**
 * Convierte texto CSV a objetos sin depender de librerías externas.
 * Soporta comillas, comillas escapadas (""), comas y saltos de línea dentro
 * de valores entre comillas. Los encabezados y valores se recortan.
 *
 * @param {string} csvText
 * @returns {Array<Record<string, string>>}
 */
export function parseCsv(csvText) {
  if (typeof csvText !== "string" || csvText.trim() === "") {
    return [];
  }

  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  const finishField = () => {
    row.push(field.trim());
    field = "";
  };

  const finishRow = () => {
    finishField();

    // Evita que líneas completamente vacías se conviertan en registros.
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }

    row = [];
  };

  // Elimina el BOM que Google Sheets u otras herramientas pueden agregar.
  const text = csvText.replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (insideQuotes) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        insideQuotes = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.trim() === "") {
      // Ignora espacios antes de una comilla inicial.
      field = "";
      insideQuotes = true;
    } else if (character === ",") {
      finishField();
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      finishRow();
    } else {
      field += character;
    }
  }

  // Añade la última fila cuando el archivo no termina en un salto de línea.
  if (field !== "" || row.length > 0) {
    finishRow();
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((values) =>
    headers.reduce((record, header, index) => {
      if (header) {
        record[header] = (values[index] ?? "").trim();
      }
      return record;
    }, {}),
  );
}

/**
 * Convierte precios escritos como número o moneda a un valor numérico.
 * Admite formatos habituales de Argentina (4.500,50) y formatos con punto
 * decimal (4500.50). Un precio vacío, negativo o inválido queda como null.
 *
 * @param {string} priceValue
 * @returns {number | null}
 */
function parsePrice(priceValue) {
  const value = String(priceValue ?? "").trim();

  if (!value) {
    return null;
  }

  const numericValue = value.replace(/[^0-9,.-]/g, "");
  if (!/\d/.test(numericValue)) {
    return null;
  }
  const lastComma = numericValue.lastIndexOf(",");
  const lastDot = numericValue.lastIndexOf(".");
  let normalized = numericValue;

  if (lastComma !== -1 && lastDot !== -1) {
    // El último separador es el decimal; el otro se usa para miles.
    if (lastComma > lastDot) {
      normalized = numericValue.replaceAll(".", "").replace(",", ".");
    } else {
      normalized = numericValue.replaceAll(",", "");
    }
  } else if (lastComma !== -1 || lastDot !== -1) {
    const separator = lastComma !== -1 ? "," : ".";
    const decimals = numericValue.length - numericValue.lastIndexOf(separator) - 1;
    const repeatedSeparator = numericValue.indexOf(separator) !== numericValue.lastIndexOf(separator);

    // Tres dígitos tras el separador (o grupos repetidos) representan miles.
    normalized =
      decimals === 3 || repeatedSeparator
        ? numericValue.replaceAll(separator, "")
        : numericValue.replace(separator, ".");
  }

  const price = Number(normalized);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

/**
 * Normaliza los registros esperados por el catálogo.
 * Las filas sin Nombre se descartan. Stock puede ser un número, "available"
 * cuando la hoja contiene "*", o null cuando está vacío/no es válido.
 * Precio queda en null cuando está vacío o no es válido.
 *
 * @param {Array<Record<string, string>>} rows
 */
export function toPlantInventory(rows) {
  return rows.reduce((plants, row, index) => {
    const name = (row.Nombre ?? "").trim();

    if (!name) {
      return plants;
    }

    const stockValue = (row.Stock ?? "").trim();
    const parsedStock = Number(stockValue);
    const stock =
      stockValue === "*"
        ? "available"
        : stockValue === ""
          ? null
        : Number.isFinite(parsedStock) && parsedStock >= 0
          ? Math.trunc(parsedStock)
          : null;

    plants.push({
      id: `${name.toLocaleLowerCase().replaceAll(" ", "-")}-${index}`,
      name,
      category: (row.Categoria ?? "").trim() || "Sin categoría",
      stock,
      price: parsePrice(row.Precio),
      // Acepta el encabezado esperado y la variante Imagen.URL detectada en
      // la hoja actual, para que una diferencia de formato no rompa la foto.
      imageUrl: (row.Imagen_URL ?? row["Imagen.URL"] ?? row["Imagen-URL"] ?? "").trim(),
    });

    return plants;
  }, []);
}
