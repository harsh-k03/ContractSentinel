import { HardHat } from "lucide-react";

const STATUS_STYLES = {
  checking: "bg-sand-700 text-sand-200",
  offline: "bg-brick/20 text-red-200 border border-brick",
  gemini: "bg-moss/25 text-lime-100 border border-moss",
  "rule-based": "bg-hazard/15 text-hazard border border-hazard/60",
};

const STATUS_LABELS = {
  checking: "Connecting...",
  offline: "Backend offline",
  gemini: "Gemini AI engine",
  "rule-based": "Rule-based engine",
};

export default function Header({ status = "checking" }) {
  return (
    <header className="bg-sand-950 text-sand-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-4">

          <div className="bg-hazard text-sand-950 rounded-xl p-2.5 shadow-inner">
            <HardHat size={30} strokeWidth={2.2} />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Contract <span className="text-hazard">Sentinel</span>
            </h1>

            <p className="text-sand-300 text-sm mt-0.5">
              Reality-Grounded Procurement Analyst for Construction Projects
            </p>
          </div>

        </div>

        <span
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${STATUS_STYLES[status]}`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {STATUS_LABELS[status]}
        </span>

      </div>

      <div className="hazard-stripe h-2" />
    </header>
  );
}
