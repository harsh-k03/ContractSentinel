import { useState } from "react";
import { Download, LoaderCircle, RotateCcw } from "lucide-react";

export default function DownloadReportButton({ analysis, onReset }) {

  const [busy, setBusy] = useState(false);

  if (!analysis) return null;

  const handleDownload = async () => {
    setBusy(true);
    try {
      // jsPDF is loaded only when a report is requested
      const { downloadReport } = await import("../services/reportService");
      downloadReport(analysis);
    } finally {
      setBusy(false);
    }
  };

  return (

    <div className="mt-8 flex flex-wrap justify-end gap-3">

      <button
        onClick={onReset}
        className="flex items-center gap-2 border-2 border-sand-600 text-sand-800 hover:bg-sand-200 px-6 py-3 rounded-xl font-semibold transition"
      >
        <RotateCcw size={18} />
        New Analysis
      </button>

      <button
        onClick={handleDownload}
        disabled={busy}
        className="flex items-center gap-2 bg-sand-800 hover:bg-sand-900 text-sand-50 px-6 py-3 rounded-xl font-semibold shadow-md transition disabled:opacity-60"
      >

        {busy ? <LoaderCircle size={18} className="animate-spin" /> : <Download size={18} />}

        Download PDF Report

      </button>

    </div>

  );

}
