import { useEffect, useState } from "react";
import { CheckCircle2, HardHat, Loader2 } from "lucide-react";

const steps = [
  "Reading Contract...",
  "Reading Invoice...",
  "Analyzing Site Photo...",
  "Comparing Documents...",
  "Assessing Procurement Risk...",
  "Generating Final Report..."
];

export default function ProcessingOverlay({ active }) {
  if (!active) return null;

  // Remounts on every run, so the step counter always starts at zero
  return <ProcessingSteps />;
}

function ProcessingSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // The last step keeps spinning until the backend responds
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-sand-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-sand-50 rounded-3xl w-full max-w-[600px] shadow-2xl border border-sand-300 overflow-hidden">

        <div className="hazard-stripe h-2" />

        <div className="p-8 sm:p-10">

          <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-extrabold text-sand-900 mb-8">
            <HardHat className="text-hazard-dark" size={34} />
            AI Procurement Engine
          </h2>

          <div className="space-y-5">

            {steps.map((step, index) => (

              <div
                key={index}
                className="flex items-center gap-4"
              >

                {index < currentStep ? (

                  <CheckCircle2
                    className="text-moss"
                    size={24}
                  />

                ) : index === currentStep ? (

                  <Loader2
                    className="animate-spin text-hazard-dark"
                    size={24}
                  />

                ) : (

                  <div className="w-6 h-6 rounded-full border-2 border-sand-300" />

                )}

                <span
                  className={`text-lg ${
                    index <= currentStep ? "text-sand-900 font-medium" : "text-sand-400"
                  }`}
                >
                  {step}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}
