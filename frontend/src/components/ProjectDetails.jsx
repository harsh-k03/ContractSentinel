import { Building2 } from "lucide-react";

const FIELDS = [
  ["name", "Project"],
  ["contract_no", "Contract No."],
  ["contractor", "Contractor"],
  ["contract_value", "Contract Value"],
  ["amount_claimed", "Amount Claimed"],
  ["invoice_date", "Invoice Date"],
];

export default function ProjectDetails({ project }) {
  const rows = FIELDS.filter(([key]) => project?.[key]);

  if (rows.length === 0) return null;

  return (
    <div className="bg-sand-50 border border-sand-300 rounded-2xl p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-bold text-sand-900 mb-4">
        <Building2 size={20} className="text-sand-600" />
        Project Details
      </h3>

      <dl className="space-y-2 text-sm">
        {rows.map(([key, label]) => (
          <div key={key} className="grid grid-cols-[120px_1fr] gap-3">
            <dt className="text-sand-600">{label}</dt>
            <dd className="font-semibold text-sand-900 break-words">{project[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
