export default function SearchAndFilters({
  categories,
  query,
  selectedCategory,
  resultCount,
  onQueryChange,
  onCategoryChange,
  onClearFilters,
}) {
  const filtersAreActive = query !== "" || selectedCategory !== "Todas";
  const plantsLabel = resultCount === 1 ? "planta" : "plantas";

  return (
    <section
      className="rounded-3xl border border-leaf-100 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-6"
      aria-labelledby="filters-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 id="filters-title" className="sr-only">
            Búsqueda y filtros
          </h2>
          <label
            className="mb-2 block text-sm font-semibold text-slate-800"
            htmlFor="plant-search"
          >
            Buscar por nombre
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-leaf-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
            </svg>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-leaf-600 focus:ring-4 focus:ring-leaf-100"
              id="plant-search"
              name="plant-search"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Ej. lavanda, monstera…"
              type="search"
              value={query}
            />
          </div>
        </div>

        <p
          className="shrink-0 text-sm font-medium text-slate-600"
          aria-live="polite"
        >
          Mostrando <span className="font-bold text-leaf-800">{resultCount}</span>{" "}
          {plantsLabel}
        </p>
      </div>

      <fieldset className="mt-5 border-0 p-0">
        <legend className="mb-2 text-sm font-semibold text-slate-800">
          Categorías
        </legend>
        <div className="flex flex-wrap gap-2" aria-label="Filtrar por categoría">
          {["Todas", ...categories].map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <button
                aria-pressed={isSelected}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700 ${
                  isSelected
                    ? "bg-leaf-700 text-white shadow-sm"
                    : "bg-leaf-50 text-leaf-900 hover:bg-leaf-100"
                }`}
                key={category}
                onClick={() => onCategoryChange(category)}
                type="button"
              >
                {category}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        className="mt-5 text-sm font-semibold text-leaf-800 underline decoration-leaf-400 decoration-2 underline-offset-4 transition hover:text-leaf-950 disabled:cursor-not-allowed disabled:text-slate-400 disabled:decoration-slate-300"
        disabled={!filtersAreActive}
        onClick={onClearFilters}
        type="button"
      >
        Limpiar filtros
      </button>
    </section>
  );
}
