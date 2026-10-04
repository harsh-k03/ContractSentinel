export const RISK_STYLES = {
  HIGH: {
    badge: "bg-brick/15 text-brick border-brick",
    panel: "border-brick/50 bg-brick/5",
    text: "text-brick",
    rgb: [180, 68, 46],
  },
  MEDIUM: {
    badge: "bg-hazard/20 text-hazard-dark border-hazard-dark",
    panel: "border-hazard/60 bg-hazard/5",
    text: "text-hazard-dark",
    rgb: [201, 138, 0],
  },
  LOW: {
    badge: "bg-moss/15 text-moss border-moss",
    panel: "border-moss/50 bg-moss/5",
    text: "text-moss",
    rgb: [95, 122, 58],
  },
  UNKNOWN: {
    badge: "bg-sand-200 text-sand-700 border-sand-500",
    panel: "border-sand-400 bg-sand-50",
    text: "text-sand-700",
    rgb: [122, 90, 58],
  },
};

export function riskStyle(risk) {
  return RISK_STYLES[risk] || RISK_STYLES.UNKNOWN;
}

export function formatPercent(value) {
  if (value === null || value === undefined) return "--";
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}%`;
}

export function formatDifference(value) {
  if (value === null || value === undefined) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatPercent(value)}`;
}
