import { useId, useRef, useState } from "react";

const BYTES_PER_MB = 1024 * 1024;
const JPEG_MIME_TYPES = new Set(["image/jpeg", "image/jpg"]);
const JPEG_EXTENSION = /\.jpe?g$/i;

/**
 * Convierte un JPG local en una data URL sin realizar ninguna subida a servidor.
 */
export default function ImageUploader({
  id,
  label = "Subir imagen JPG",
  maxSizeInMB = 5,
  onChange,
  onError,
}) {
  const generatedId = useId();
  const inputId = id ?? `image-upload-${generatedId}`;
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isReading, setIsReading] = useState(false);

  const reportError = (message) => {
    setError(message);
    onError?.(message);
  };

  const clearSelection = () => {
    setPreview("");
    setFileName("");
    setError("");
    setIsReading(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange?.(null, null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isJpeg = JPEG_MIME_TYPES.has(file.type.toLowerCase()) && JPEG_EXTENSION.test(file.name);
    if (!isJpeg) {
      reportError("Selecciona una imagen JPG o JPEG.");
      event.target.value = "";
      return;
    }

    if (file.size > maxSizeInMB * BYTES_PER_MB) {
      reportError(`La imagen supera el límite de ${maxSizeInMB} MB.`);
      event.target.value = "";
      return;
    }

    setError("");
    setIsReading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";

      if (!dataUrl.startsWith("data:image/jpeg")) {
        reportError("No se pudo procesar la imagen JPG.");
        setIsReading(false);
        return;
      }

      setPreview(dataUrl);
      setFileName(file.name);
      setIsReading(false);
      onChange?.(dataUrl, file.name);
    };
    reader.onerror = () => {
      setIsReading(false);
      reportError("No se pudo leer la imagen. Intenta con otro archivo JPG.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <section aria-label="Selector de imagen local" className="rounded-2xl border border-leaf-100 bg-white p-4">
      <label className="block text-sm font-semibold text-slate-800" htmlFor={inputId}>
        {label}
      </label>
      <p className="mt-1 text-sm text-slate-600">Solo JPG o JPEG, hasta {maxSizeInMB} MB.</p>

      <input
        accept="image/jpeg,image/jpg"
        aria-describedby={`${inputId}-help ${error ? `${inputId}-error` : ""}`.trim()}
        className="mt-3 block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-leaf-100 file:px-3 file:py-1.5 file:font-semibold file:text-leaf-900 hover:file:bg-leaf-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
        id={inputId}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
      <span className="sr-only" id={`${inputId}-help`}>
        Selecciona un archivo JPG o JPEG de hasta {maxSizeInMB} megabytes.
      </span>

      {isReading && (
        <p aria-live="polite" className="mt-3 text-sm font-medium text-leaf-800">
          Procesando imagen…
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm font-medium text-red-700" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-leaf-50 p-3">
          <img alt={`Vista previa: ${fileName}`} className="size-20 rounded-lg object-cover" src={preview} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{fileName}</p>
            <button
              className="mt-2 rounded-lg px-2 py-1 text-sm font-semibold text-leaf-800 underline decoration-leaf-400 underline-offset-2 hover:text-leaf-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
              onClick={clearSelection}
              type="button"
            >
              Quitar imagen
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
