import { motion } from "framer-motion";

export default function StatsCard({ title, value, color }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
      }}
      whileHover={{
        y: -5,
        scale: 1.03,
      }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-cyan-500 transition-all duration-300"
    >
      <p className="text-slate-400 text-sm uppercase tracking-wide">
        {title}
      </p>

      <motion.h2
        key={value}
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.35,
        }}
        className={`text-4xl font-bold mt-4 ${color}`}
      >
        {value}
      </motion.h2>
    </motion.div>
  );
}