import { useEffect, useState } from "react";
import { CheckCircle2, Upload, X } from "lucide-react";

export default function UploadCard({
  step,
  title,
  description,
  hint,
  accept,
  icon: Icon = Upload,
  file,
  onFileSelect,
}) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  const isImage = Boolean(file?.type?.startsWith("image/"));

  useEffect(() => {
    if (!isImage) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    return () => reader.abort();
  }, [file, isImage]);

  const shownPreview = isImage ? preview : null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative block cursor-pointer rounded-2xl border-2 bg-sand-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        dragging
          ? "border-hazard border-solid bg-hazard/10"
          : file
            ? "border-moss/60 border-solid"
            : "border-sand-300 border-dashed hover:border-sand-500"
      }`}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
          e.target.value = "";
        }}
      />

      <span className="absolute top-4 right-4 rounded-md bg-sand-200 px-2 py-0.5 text-xs font-bold text-sand-700">
        STEP {step}
      </span>

      {shownPreview ? (
        <img
          src={shownPreview}
          alt="Site photo preview"
          className="mt-7 mb-5 h-24 w-full rounded-xl object-cover border border-sand-300"
        />
      ) : (
        <div className="mb-5 inline-flex rounded-xl bg-sand-200 p-3 text-sand-700">
          <Icon size={30} />
        </div>
      )}

      <h3 className="text-xl font-bold text-sand-900">
        {title}
      </h3>

      <p className="text-sand-600 mt-1">
        {description}
      </p>

      <p className="text-sand-500 text-xs mt-1">
        {hint}
      </p>

      {file ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-moss/10 border border-moss/40 px-3 py-2.5 text-moss font-semibold">
          <CheckCircle2 size={18} className="shrink-0" />

          <span className="truncate flex-1 text-sm">
            {file.name}
          </span>

          <button
            type="button"
            aria-label={`Remove ${title}`}
            onClick={(e) => {
              e.preventDefault();
              onFileSelect(null);
            }}
            className="rounded-md p-1 text-sand-600 hover:bg-sand-200 hover:text-brick"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-sand-800 hover:bg-sand-700 text-sand-50 py-3 text-center font-semibold transition">
          Choose or drop file
        </div>
      )}
    </label>
  );
}
