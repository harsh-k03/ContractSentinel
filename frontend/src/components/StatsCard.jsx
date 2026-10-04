import { motion } from "framer-motion";

export default function StatsCard({ title, value, color, icon: Icon, subtitle, children }) {
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
      }}
      className="bg-sand-50 border border-sand-300 border-t-4 border-t-sand-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-t-hazard transition-colors duration-300"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sand-600 text-xs font-bold uppercase tracking-wider">
          {title}
        </p>

        {Icon && <Icon size={18} className="text-sand-500" />}
      </div>

      {children ? (
        <div className="mt-4 min-h-10 flex items-center">{children}</div>
      ) : (
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
          className={`text-4xl font-extrabold mt-3 ${color}`}
        >
          {value}
        </motion.h2>
      )}

      {subtitle && (
        <p className="text-sand-500 text-xs mt-2">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
