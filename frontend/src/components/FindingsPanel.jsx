import { ClipboardList, Camera } from "lucide-react";

export default function FindingsPanel({ findings, siteObservations }) {
  if (!findings) return null;

  return (
    <div className="mt-8 bg-sand-50 border border-sand-300 rounded-2xl p-6 shadow-sm">

      <div className="flex items-center gap-3 mb-5">

        <ClipboardList
          className="text-sand-700"
          size={28}
        />

        <h2 className="text-2xl font-bold text-sand-900">
          Audit Findings
        </h2>

      </div>

      <ol className="space-y-3">

        {findings.map((item, index) => (

          <li
            key={index}
            className="flex gap-4 bg-sand-100 border-l-4 border-sand-600 rounded-r-xl p-4 text-sand-800"
          >
            <span className="font-extrabold text-sand-600">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span>{item}</span>
          </li>

        ))}

      </ol>

      {siteObservations && (
        <div className="mt-5 flex gap-3 rounded-xl bg-sand-200/60 p-4 text-sand-800">
          <Camera size={20} className="text-sand-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold">Site photo: </span>
            {siteObservations}
          </p>
        </div>
      )}

    </div>
  );
}
