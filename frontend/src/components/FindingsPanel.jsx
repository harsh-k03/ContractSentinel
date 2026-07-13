import { AlertTriangle } from "lucide-react";

export default function FindingsPanel({ findings }) {
  if (!findings) return null;

  return (
    <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex items-center gap-3 mb-5">

        <AlertTriangle
          className="text-yellow-400"
          size={28}
        />

        <h2 className="text-2xl font-bold text-white">
          AI Findings
        </h2>

      </div>

      <div className="space-y-3">

        {findings.map((item, index) => (

          <div
            key={index}
            className="bg-slate-800 rounded-xl p-4 text-slate-200"
          >
            ✅ {item}
          </div>

        ))}

      </div>

    </div>
  );
}