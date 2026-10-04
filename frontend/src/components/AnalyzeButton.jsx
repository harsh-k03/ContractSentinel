import { Sparkles, LoaderCircle } from "lucide-react";

export default function AnalyzeButton({ onAnalyze, loading, disabled }) {

  const inactive = loading || disabled;

  return (

    <button

      onClick={onAnalyze}

      disabled={inactive}

      className={`
        w-full
        rounded-2xl
        py-4
        font-extrabold
        text-lg
        flex
        items-center
        justify-center
        gap-3
        transition-all
        duration-300
        shadow-md
        ${
          inactive
            ? "bg-sand-300 text-sand-600 cursor-not-allowed"
            : "bg-hazard text-sand-950 hover:bg-hazard-dark hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        }
      `}
    >

      {loading ? (

        <>

          <LoaderCircle
            className="animate-spin"
            size={22}
          />

          Analyzing Construction Documents...

        </>

      ) : (

        <>

          <Sparkles size={22} />

          {disabled ? "Upload all three documents to analyze" : "Analyze with AI"}

        </>

      )}

    </button>

  );

}
