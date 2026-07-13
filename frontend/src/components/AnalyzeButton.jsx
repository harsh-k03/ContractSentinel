import { Sparkles, LoaderCircle } from "lucide-react";

export default function AnalyzeButton({ onAnalyze, loading }) {

  return (

    <button

      onClick={onAnalyze}

      disabled={loading}

      className={`
        w-full
        rounded-2xl
        py-4
        font-bold
        text-lg
        flex
        items-center
        justify-center
        gap-3
        transition-all
        duration-300
        shadow-lg
        hover:scale-[1.02]
        active:scale-[0.98]
        ${
          loading
            ? "bg-cyan-700 cursor-not-allowed"
            : "bg-cyan-500 hover:bg-cyan-400 hover:shadow-cyan-500/40 cursor-pointer"
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

          Analyze with AI

        </>

      )}

    </button>

  );

}