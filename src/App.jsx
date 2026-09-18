import { useCallback, useEffect, useMemo, useState } from "react";
import PlantCard from "./components/PlantCard";
import SearchAndFilters from "./components/SearchAndFilters";
import { parseCsv, toPlantInventory } from "./utils/parseCsv";

// Reemplaza este valor por la URL pública CSV de la hoja de Google Sheets.
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6HJxuxL-EGPZ4pcGXbi0l2kDVT51oCpIdKHKUrDCehMdbNoP7zznVdigkIU9cO7Po8BCJs6wbKBkh/pub?output=csv";
const INVENTORY_REFRESH_INTERVAL = 60_000;

export default function App() {
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);

  const loadInventory = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      if (SHEET_CSV_URL === "" || !SHEET_CSV_URL.trim()) {
        throw new Error(
          "Falta configurar la URL pública del CSV en src/App.jsx.",
        );
      }

      // Evita que el navegador reutilice una respuesta CSV desactualizada.
      // Google Sheets tolera este parámetro adicional y conserva los demás,
      // incluido `gid` si la URL apunta a una pestaña concreta.
      const requestUrl = new URL(SHEET_CSV_URL);
      requestUrl.searchParams.set("_updatedAt", Date.now().toString());

      const response = await fetch(requestUrl.toString(), {
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error(`No se pudo cargar el inventario (HTTP ${response.status}).`);
      }

      const csvText = await response.text();
      const inventory = toPlantInventory(parseCsv(csvText));
      setPlants(inventory);
    } catch (loadError) {
      if (loadError.name !== "AbortError") {
        setPlants([]);
        setError(
          loadError.message ||
            "Ocurrió un problema al cargar el inventario. Intenta nuevamente.",
        );
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadInventory(controller.signal);
    const refreshInterval = window.setInterval(() => {
      loadInventory(controller.signal);
    }, INVENTORY_REFRESH_INTERVAL);

    return () => {
      window.clearInterval(refreshInterval);
      controller.abort();
    };
  }, [loadInventory]);

  const categories = useMemo(
    () => [...new Set(plants.map((plant) => plant.category))].sort((a, b) => a.localeCompare(b)),
    [plants],
  );

  useEffect(() => {
    if (selectedCategory !== "Todas" && !categories.includes(selectedCategory)) {
      setSelectedCategory("Todas");
    }
  }, [categories, selectedCategory]);

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return plants.filter((plant) => {
      const matchesSearch = plant.name.toLocaleLowerCase().includes(normalizedQuery);
      const matchesCategory =
        selectedCategory === "Todas" || plant.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [plants, query, selectedCategory]);

  const handleRetry = () => loadInventory();

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("Todas");
  };

  return (
    <div className="min-h-screen bg-cream-50 text-slate-900">
      <header className="border-b border-leaf-100 bg-leaf-950 text-white">
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6 sm:py-12 lg:px-8">
          <div>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Vivero Julita
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-leaf-100 sm:text-lg">
              Plantas disponibles para llenar tus espacios de verde.
            </p>
          </div>

          <div className="relative shrink-0">
            <button
              aria-controls="contact-menu"
              aria-expanded={isContactMenuOpen}
              className="inline-flex items-center gap-2 rounded-xl border border-leaf-400/60 bg-leaf-800 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:border-leaf-200 hover:bg-leaf-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-200"
              onClick={() => setIsContactMenuOpen((isOpen) => !isOpen)}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.9L3 20l1.4-4A8.1 8.1 0 0 1 3 11.5a8.5 8.5 0 0 1 9-8.5 8.5 8.5 0 0 1 9 8.5Z" />
                <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
              </svg>
              <span>Consultas y encargos</span>
            </button>

            {isContactMenuOpen ? (
              <div
                className="absolute right-0 top-full z-10 mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-leaf-100 bg-white p-4 text-slate-900 shadow-xl"
                id="contact-menu"
              >
                <p className="text-sm font-bold text-leaf-900">Escribinos por WhatsApp</p>
                <p className="mt-1 text-sm text-slate-600">
                  Consultá disponibilidad o hacé tu encargo.
                </p>
                <div className="mt-3 grid gap-2">
                  <a
                    className="rounded-xl border border-leaf-100 px-3 py-2.5 text-sm font-bold text-leaf-800 transition hover:border-leaf-300 hover:bg-leaf-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
                    href="https://wa.me/5493585066944"
                    rel="noreferrer"
                    target="_blank"
                  >
                    WhatsApp: 3585066944
                  </a>
                  <a
                    className="rounded-xl border border-leaf-100 px-3 py-2.5 text-sm font-bold text-leaf-800 transition hover:border-leaf-300 hover:bg-leaf-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
                    href="https://wa.me/5493585765628"
                    rel="noreferrer"
                    target="_blank"
                  >
                    WhatsApp: 3585765628
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <SearchAndFilters
          categories={categories}
          onCategoryChange={setSelectedCategory}
          onClearFilters={clearFilters}
          onQueryChange={setQuery}
          query={query}
          resultCount={filteredPlants.length}
          selectedCategory={selectedCategory}
        />

        <section className="mt-8" aria-labelledby="inventory-title">
          <h2 id="inventory-title" className="sr-only">
            Plantas disponibles
          </h2>

          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-leaf-100 bg-white px-6 text-center">
              <span
                aria-hidden="true"
                className="size-10 animate-spin rounded-full border-4 border-leaf-100 border-t-leaf-700"
              />
              <p aria-live="polite" className="mt-4 font-semibold text-slate-700">
                Cargando el inventario del vivero…
              </p>
            </div>
          ) : error ? (
            <div
              className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center"
              role="alert"
            >
              <h3 className="text-lg font-bold text-red-900">
                No pudimos cargar el inventario
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-red-800">{error}</p>
              <button
                className="mt-5 rounded-xl bg-red-700 px-4 py-2.5 font-bold text-white transition hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
                onClick={handleRetry}
                type="button"
              >
                Reintentar
              </button>
            </div>
          ) : plants.length === 0 ? (
            <div className="rounded-3xl border border-leaf-100 bg-white p-8 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                El inventario está vacío
              </h3>
              <p className="mt-2 text-slate-600">
                Cuando haya plantas con un Nombre en la hoja, aparecerán aquí.
              </p>
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="rounded-3xl border border-leaf-100 bg-white p-8 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                No encontramos plantas con esos filtros
              </h3>
              <p className="mt-2 text-slate-600">
                Prueba con otro nombre o restablece la búsqueda.
              </p>
              <button
                className="mt-5 rounded-xl bg-leaf-700 px-4 py-2.5 font-bold text-white transition hover:bg-leaf-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-800"
                onClick={clearFilters}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPlants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
