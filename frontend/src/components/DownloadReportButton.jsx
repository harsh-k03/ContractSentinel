import { Download } from "lucide-react";
import { downloadReport } from "../services/reportService";

export default function DownloadReportButton({ analysis }) {

  if (!analysis) return null;

  return (

    <div className="mt-8 flex justify-end">

      <button
        onClick={() => downloadReport(analysis)}
        className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl font-semibold transition"
      >

        <Download size={18} />

        Download AI Report

      </button>

    </div>

  );

}