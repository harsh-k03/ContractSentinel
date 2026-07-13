import { AlertTriangle } from "lucide-react";

export default function ProcurementNotice({ analysis }) {

  if (!analysis) return null;

  return (

    <div className="mt-10 rounded-2xl border border-red-500/40 bg-red-950/20 p-8">

      <div className="flex items-center gap-3 mb-6">

        <AlertTriangle
          className="text-red-400"
          size={34}
        />

        <div>

          <h2 className="text-2xl font-bold text-red-300">
            AI Procurement Recommendation
          </h2>

          <p className="text-slate-400">
            Generated automatically by Contract Sentinel
          </p>

        </div>

      </div>

      <div className="space-y-5 text-white">

        <div className="flex justify-between">

          <span className="text-slate-400">
            Invoice Progress
          </span>

          <span className="font-semibold">
            {analysis.invoice_progress}%
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            AI Estimated Progress
          </span>

          <span className="font-semibold">
            {analysis.estimated_progress}%
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            Difference
          </span>

          <span className="font-semibold text-yellow-400">
            {analysis.difference}%
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            Risk Level
          </span>

          <span className="font-bold text-red-400">
            {analysis.risk}
          </span>

        </div>

        <hr className="border-slate-700" />

        <div>

          <h3 className="text-lg font-semibold mb-3">
            Recommendation
          </h3>

          <p className="text-slate-300 leading-7">

            Invoice claims significantly higher work completion than
            estimated from the submitted project evidence.

            Release of milestone payment should be withheld until
            engineer verification confirms construction progress.

          </p>

        </div>

      </div>

    </div>

  );

}