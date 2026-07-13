import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const steps = [
  "Reading Contract...",
  "Reading Invoice...",
  "Analyzing Site Photo...",
  "Comparing Documents...",
  "Assessing Procurement Risk...",
  "Generating Final Report..."
];

export default function ProcessingOverlay({ active }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center">

      <div className="bg-slate-900 rounded-3xl p-10 w-[650px] shadow-2xl border border-slate-700">

        <h2 className="text-3xl font-bold text-cyan-400 mb-8">
          🧠 AI Procurement Engine
        </h2>

        <div className="space-y-5">

          {steps.map((step, index) => (

            <div
              key={index}
              className="flex items-center gap-4"
            >

              {index < currentStep ? (

                <CheckCircle2
                  className="text-green-400"
                  size={24}
                />

              ) : index === currentStep ? (

                <Loader2
                  className="animate-spin text-cyan-400"
                  size={24}
                />

              ) : (

                <div className="w-6" />

              )}

              <span className="text-white text-lg">
                {step}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}