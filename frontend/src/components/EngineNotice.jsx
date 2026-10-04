import { Info, Sparkles } from "lucide-react";

export default function EngineNotice({ analysis }) {
  if (!analysis) return null;

  const isAi = analysis.engine === "gemini";
  const notes = analysis.notes || [];

  if (isAi && notes.length === 0) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-sand-800">
        <Sparkles size={20} className="text-moss shrink-0" />
        <p>
          Analysed by <strong>Gemini</strong> ({analysis.model}) using the contract, invoice and site photo.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 flex gap-3 rounded-xl border border-hazard/60 bg-hazard/10 px-4 py-3 text-sand-800">
      <Info size={20} className="text-hazard-dark shrink-0 mt-0.5" />
      <div className="space-y-1">
        {notes.map((note, index) => (
          <p key={index}>{note}</p>
        ))}
      </div>
    </div>
  );
}
