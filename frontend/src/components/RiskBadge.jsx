export default function RiskBadge({ risk }) {

  if (!risk) return null;

  const styles = {
    HIGH: "bg-red-500/20 text-red-400 border-red-500",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
    LOW: "bg-green-500/20 text-green-400 border-green-500",
  };

  return (
    <span
      className={`px-4 py-1 rounded-full border font-bold text-sm ${
        styles[risk] || styles.HIGH
      }`}
    >
      {risk}
    </span>
  );
}