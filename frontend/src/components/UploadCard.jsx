import { Upload, CheckCircle2 } from "lucide-react";

export default function UploadCard({
  title,
  description,
  accept,
  file,
  onFileSelect,
}) {
  return (
    <label className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 transition-all duration-300 cursor-pointer block">

      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files[0])}
      />

      <Upload
        className="text-cyan-400 mb-5"
        size={36}
      />

      <h3 className="text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="text-slate-400 mt-2">
        {description}
      </p>

      <div className="mt-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black py-3 text-center font-semibold">

        {file ? (
          <div className="flex justify-center items-center gap-2">

            <CheckCircle2 size={18} />

            <span className="truncate px-2">
              {file.name}
            </span>

          </div>
        ) : (
          "Choose File"
        )}

      </div>

    </label>
  );
}