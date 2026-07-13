import { useState } from "react";

import Header from "../components/Header";
import UploadCard from "../components/UploadCard";
import StatsCard from "../components/StatsCard";
import AnalyzeButton from "../components/AnalyzeButton";
import FindingsPanel from "../components/FindingsPanel";

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

    <div className="min-h-screen bg-slate-950">

      <Header />

      <div className="max-w-7xl mx-auto px-8 py-10">

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

        <div className="mt-14">

          <h2 className="text-3xl font-bold text-white mb-8">

            Procurement Intelligence Dashboard

          </h2>

          <div className="grid md:grid-cols-4 gap-6">

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
              title="Risk"
              value={analysis ? analysis.risk : "--"}
              color="text-red-500"
            />

          </div>

          <FindingsPanel findings={analysis?.findings} />

        </div>

      </div>

    </div>

  );

}