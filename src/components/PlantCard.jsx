import { useEffect, useState } from "react";

function getStockStatus(stock) {
  if (stock === "available") {
    return {
      label: "Stock disponible",
      className: "bg-leaf-50 text-leaf-800 ring-leaf-200",
    };
  }

  if (stock === null) {
    return {
      label: "Stock no disponible",
      className: "bg-slate-50 text-slate-600 ring-slate-200",
    };
  }

  if (stock === 0) {
    return {
      label: "Agotado · 0 unidades",
      className: "bg-red-50 text-red-700 ring-red-200",
    };
  }

  if (stock <= 5) {
    return {
      label: `Últimas unidades · Stock: ${stock} ${stock === 1 ? "unidad" : "unidades"}`,
      className: "bg-amber-50 text-amber-800 ring-amber-200",
    };
  }

  return {
    label: `Stock: ${stock} ${stock === 1 ? "unidad" : "unidades"}`,
    className: "bg-leaf-50 text-leaf-800 ring-leaf-200",
  };
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(price);
}

export default function PlantCard({ plant }) {
  const [imageFailed, setImageFailed] = useState(false);
  const stockStatus = getStockStatus(plant.stock);
  const hasPrice = Number.isFinite(plant.price) && plant.price >= 0;
  // El navegador admite tanto URL HTTP(S) como data:image/...; no se transforma
  // la fuente para conservar compatibilidad con ambos formatos.
  const imageSource = typeof plant.imageUrl === "string" ? plant.imageUrl.trim() : "";
  const showImage = imageSource && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [plant.imageUrl]);

  return (
    <article className="group overflow-hidden rounded-3xl border border-leaf-100 bg-white shadow-sm transition duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
      <div className="aspect-[4/3] overflow-hidden bg-leaf-50">
        {showImage ? (
          <img
            alt={`Foto de ${plant.name}`}
            className="size-full object-cover transition duration-500 motion-safe:group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={imageSource}
          />
        ) : (
          <div
            aria-label={`Imagen no disponible de ${plant.name}`}
            className="flex size-full flex-col items-center justify-center bg-[radial-gradient(circle_at_25%_25%,#dff2df_0,transparent_28%),radial-gradient(circle_at_75%_80%,#c4e3c4_0,transparent_32%),#edf5e9] px-6 text-center"
            role="img"
          >
            <svg
              aria-hidden="true"
              className="size-14 text-leaf-700"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M12 21V9" />
              <path d="M12 13c-5 0-7-3.2-7-7 4.7 0 7 2.3 7 7Z" />
              <path d="M12 17c0-5 2.3-7 7-7 0 3.8-2 7-7 7Z" />
            </svg>
            <span className="mt-3 text-sm font-medium text-leaf-900">
              Imagen no disponible
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-sm font-medium text-leaf-700">{plant.category}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          {plant.name}
        </h2>
        {hasPrice ? (
          <p className="mt-3 text-lg font-black text-slate-900">
            <span className="sr-only">Precio: </span>
            {formatPrice(plant.price)}
          </p>
        ) : null}
        <p
          aria-label={`Disponibilidad: ${stockStatus.label}`}
          className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-bold ring-1 ring-inset ${stockStatus.className}`}
        >
          {stockStatus.label}
        </p>
      </div>
    </article>
  );
}
