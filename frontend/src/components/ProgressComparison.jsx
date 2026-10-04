import { motion } from "framer-motion";
import { formatPercent } from "../utils/risk";

function Bar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-semibold text-sand-700">{label}</span>
        <span className="font-bold text-sand-900">{formatPercent(value)}</span>
      </div>

      <div className="h-5 rounded-md bg-sand-200 overflow-hidden border border-sand-300">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value ?? 0}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function ProgressComparison({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="bg-sand-50 border border-sand-300 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-sand-900 mb-5">
        Claimed vs Expected Progress
      </h3>

      <div className="space-y-5">
        <Bar label="Invoice claims" value={analysis.invoice_progress} color="bg-sand-700" />
        <Bar label="Expected from evidence" value={analysis.estimated_progress} color="bg-hazard" />
      </div>
    </div>
  );
}
