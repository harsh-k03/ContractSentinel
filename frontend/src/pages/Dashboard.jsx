import { useState } from "react";

import Header from "../components/Header";
import UploadCard from "../components/UploadCard";
import StatsCard from "../components/StatsCard";
import AnalyzeButton from "../components/AnalyzeButton";
import FindingsPanel from "../components/FindingsPanel";
import ProcessingOverlay from "../components/ProcessingOverlay";
import ProcurementNotice from "../components/ProcurementNotice";
import DownloadReportButton from "../components/DownloadReportButton";
import RiskBadge from "../components/RiskBadge";

import api from "../services/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [contract, setContract] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [photo, setPhoto] = useState(null);

  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!contract || !invoice || !photo) {
      alert("Please upload Contract, Invoice and Site Photo.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("contract", contract);
      formData.append("invoice", invoice);
      formData.append("photo", photo);

      // Keeps the AI animation visible
      await new Promise((resolve) => setTimeout(resolve, 4500));

      const response = await api.post("/analyze", formData);

      setAnalysis(response.data);
    } catch (error) {
      console.error(error);

      alert("Backend Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProcessingOverlay active={loading} />

      <div className="min-h-screen bg-slate-950">
        <Header />

        <div className="max-w-7xl mx-auto px-8 py-10">

          {/* Hero Section */}

          <div className="mb-10">

            <h1 className="text-4xl font-bold text-white">
              Contract Sentinel
            </h1>

            <p className="text-slate-400 mt-3 max-w-3xl leading-7">
              AI-powered procurement intelligence platform for detecting
              discrepancies between construction contracts, contractor invoices,
              and on-site project progress.
            </p>

          </div>

          {/* Upload Section */}

          <h2 className="text-2xl font-bold text-white mb-6">
            Upload Project Documents
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <UploadCard
              title="Contract"
              description="Upload construction contract"
              accept=".pdf,.doc,.docx"
              file={contract}
              onFileSelect={setContract}
            />

            <UploadCard
              title="Invoice"
              description="Upload contractor invoice"
              accept=".pdf,.jpg,.jpeg,.png"
              file={invoice}
              onFileSelect={setInvoice}
            />

            <UploadCard
              title="Site Photo"
              description="Upload latest construction image"
              accept="image/*"
              file={photo}
              onFileSelect={setPhoto}
            />

          </div>

          <div className="mt-10">

            <AnalyzeButton
              loading={loading}
              onAnalyze={handleAnalyze}
            />

          </div>

          {/* Dashboard */}

          <div className="mt-16">

            <h2 className="text-3xl font-bold text-white mb-8">
              Procurement Intelligence Dashboard
            </h2>

            <div className="grid md:grid-cols-5 gap-6">

              <StatsCard
                title="Invoice Progress"
                value={analysis ? `${analysis.invoice_progress}%` : "--"}
                color="text-cyan-400"
              />

              <StatsCard
                title="AI Estimated"
                value={analysis ? `${analysis.estimated_progress}%` : "--"}
                color="text-green-400"
              />

              <StatsCard
                title="Difference"
                value={analysis ? `${analysis.difference}%` : "--"}
                color="text-yellow-400"
              />
              <StatsCard
                title="AI Confidence"
                value={analysis ? "96%" : "--"}
                color="text-purple-400"
              />

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-cyan-500 transition-all duration-300">

                <p className="text-slate-400 text-sm uppercase tracking-wide">
                  Risk Level
                </p>

                <div className="mt-5">

                  {analysis ? (
                    <RiskBadge risk={analysis.risk} />
                  ) : (
                    <span className="text-slate-500 font-semibold">
                      --
                    </span>
                  )}

                </div>

              </div>

            </div>

            <FindingsPanel findings={analysis?.findings} />

            <ProcurementNotice analysis={analysis} />

            <DownloadReportButton analysis={analysis} />

          </div>

        </div>

      </div>
    </>
  );
}