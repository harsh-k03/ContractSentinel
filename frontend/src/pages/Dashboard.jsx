import { useEffect, useState } from "react";
import {
  AlertOctagon,
  Camera,
  FileText,
  Gauge,
  Percent,
  Receipt,
  Ruler,
  TrendingUp,
} from "lucide-react";

import Header from "../components/Header";
import UploadCard from "../components/UploadCard";
import StatsCard from "../components/StatsCard";
import AnalyzeButton from "../components/AnalyzeButton";
import FindingsPanel from "../components/FindingsPanel";
import ProcessingOverlay from "../components/ProcessingOverlay";
import ProcurementNotice from "../components/ProcurementNotice";
import DownloadReportButton from "../components/DownloadReportButton";
import RiskBadge from "../components/RiskBadge";
import EngineNotice from "../components/EngineNotice";
import ProgressComparison from "../components/ProgressComparison";
import ProjectDetails from "../components/ProjectDetails";

import api, { getErrorMessage } from "../services/api";
import { formatDifference, formatPercent } from "../utils/risk";

// Keep the processing animation on screen long enough to be readable
const MIN_PROCESSING_MS = 1500;

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");

  const [contract, setContract] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [photo, setPhoto] = useState(null);

  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    api
      .get("/health", { timeout: 5000 })
      .then((response) => setBackendStatus(response.data.engine))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const allSelected = Boolean(contract && invoice && photo);

  const handleAnalyze = async () => {
    if (!allSelected) {
      setError("Please upload the contract, invoice and site photo.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("contract", contract);
      formData.append("invoice", invoice);
      formData.append("photo", photo);

      const [response] = await Promise.all([
        api.post("/analyze", formData),
        new Promise((resolve) => setTimeout(resolve, MIN_PROCESSING_MS)),
      ]);

      setAnalysis(response.data);
      setBackendStatus(response.data.engine === "gemini" ? "gemini" : "rule-based");

      setTimeout(() => {
        document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);

      setError(getErrorMessage(err));

      if (!err?.response) setBackendStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setContract(null);
    setInvoice(null);
    setPhoto(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <ProcessingOverlay active={loading} />

      <div className="min-h-screen">
        <Header status={backendStatus} />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">

          {/* Hero Section */}

          <section className="mb-10 max-w-3xl">

            <p className="text-sand-600 font-bold uppercase tracking-widest text-xs">
              Site Audit Workspace
            </p>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-sand-900 mt-2">
              Verify contractor claims before you pay
            </h2>

            <p className="text-sand-700 mt-3 leading-7">
              Upload the construction contract, the contractor's running bill
              and a recent site photo. Contract Sentinel compares claimed
              progress against the contract schedule and site evidence, flags
              procurement risk and prepares a report for the Engineer-in-Charge.
            </p>

          </section>

          {/* Upload Section */}

          <h2 className="text-2xl font-bold text-sand-900 mb-5">
            Upload Project Documents
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <UploadCard
              step={1}
              title="Contract"
              description="Construction contract agreement"
              hint="PDF only"
              accept=".pdf,application/pdf"
              icon={FileText}
              file={contract}
              onFileSelect={setContract}
            />

            <UploadCard
              step={2}
              title="Invoice"
              description="Contractor invoice / running bill"
              hint="PDF, JPG or PNG"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              icon={Receipt}
              file={invoice}
              onFileSelect={setInvoice}
            />

            <UploadCard
              step={3}
              title="Site Photo"
              description="Latest construction site image"
              hint="JPG, PNG or WEBP"
              accept=".jpg,.jpeg,.png,.webp"
              icon={Camera}
              file={photo}
              onFileSelect={setPhoto}
            />

          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-xl border-2 border-brick/50 bg-brick/10 px-4 py-3 text-brick font-medium"
            >
              <AlertOctagon size={20} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="mt-8">

            <AnalyzeButton
              loading={loading}
              disabled={!allSelected}
              onAnalyze={handleAnalyze}
            />

          </div>

          {/* Dashboard */}

          <section id="dashboard" className="mt-16 scroll-mt-6">

            <div className="flex items-center gap-3 mb-6">
              <span className="h-8 w-2 rounded bg-hazard" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-sand-900">
                Procurement Intelligence Dashboard
              </h2>
            </div>

            <EngineNotice analysis={analysis} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">

              <StatsCard
                title="Invoice Progress"
                value={analysis ? formatPercent(analysis.invoice_progress) : "--"}
                color="text-sand-800"
                icon={Receipt}
                subtitle="Claimed by contractor"
              />

              <StatsCard
                title="Expected"
                value={analysis ? formatPercent(analysis.estimated_progress) : "--"}
                color="text-moss"
                icon={Ruler}
                subtitle="From schedule & site evidence"
              />

              <StatsCard
                title="Difference"
                value={analysis ? formatDifference(analysis.difference) : "--"}
                color="text-hazard-dark"
                icon={TrendingUp}
                subtitle="Claimed minus expected"
              />

              <StatsCard
                title="Confidence"
                value={analysis?.confidence != null ? `${analysis.confidence}%` : "--"}
                color="text-sand-600"
                icon={Percent}
                subtitle={analysis ? `${analysis.engine === "gemini" ? "Gemini" : "Rule-based"} engine` : "Analysis certainty"}
              />

              <StatsCard
                title="Risk Level"
                icon={Gauge}
                subtitle="Procurement exposure"
              >
                {analysis ? (
                  <RiskBadge risk={analysis.risk} />
                ) : (
                  <span className="text-4xl font-extrabold text-sand-400">--</span>
                )}
              </StatsCard>

            </div>

            {analysis && (
              <div className="mt-8 grid lg:grid-cols-2 gap-6">
                <ProgressComparison analysis={analysis} />
                <ProjectDetails project={analysis.project} />
              </div>
            )}

            <FindingsPanel
              findings={analysis?.findings}
              siteObservations={analysis?.site_observations}
            />

            <ProcurementNotice analysis={analysis} />

            <DownloadReportButton analysis={analysis} onReset={handleReset} />

            {!analysis && (
              <p className="mt-8 rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50/60 p-8 text-center text-sand-600">
                Results will appear here after the documents are analysed.
              </p>
            )}

          </section>

        </main>

        <footer className="mt-10 bg-sand-950 text-sand-400 text-sm">
          <div className="hazard-stripe h-1.5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
            Contract Sentinel &middot; AI procurement intelligence for construction projects
          </div>
        </footer>

      </div>
    </>
  );
}
