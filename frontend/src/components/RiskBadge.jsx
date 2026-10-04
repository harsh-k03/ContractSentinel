import { riskStyle } from "../utils/risk";

export default function RiskBadge({ risk }) {

  if (!risk) return null;

  return (
    <span
      className={`inline-block px-4 py-1 rounded-full border-2 font-extrabold text-sm tracking-wide ${riskStyle(risk).badge}`}
    >
      {risk}
    </span>
  );
}
