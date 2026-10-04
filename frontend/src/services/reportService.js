import { jsPDF } from "jspdf";
import { riskStyle } from "../utils/risk";

// Page geometry (A4, millimetres)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_SPACE = 22;
const LINE_HEIGHT = 5.6;

// Sand / construction palette
const BROWN = [42, 31, 23];
const SAND_DARK = [92, 68, 48];
const SAND_MID = [151, 113, 72];
const SAND_LIGHT = [244, 236, 221];
const SAND_LINE = [219, 196, 159];
const HAZARD = [242, 169, 0];
const TEXT = [45, 35, 28];
const MUTED = [110, 95, 80];

/**
 * The built-in PDF fonts only cover Latin-1, so characters such as the
 * rupee sign, smart quotes or emoji would print as garbage.
 */
export function pdfSafe(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/₹/g, "Rs. ")
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/…/g, "...")
    .replace(/[•·]/g, "-")
    .replace(/≈/g, "~")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

function percent(value) {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}%`;
}

function signedPercent(value) {
  if (value === null || value === undefined) return "N/A";
  return `${value > 0 ? "+" : ""}${percent(value)}`;
}

export function buildReport(analysis) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const risk = riskStyle(analysis.risk);
  const recommendation = analysis.recommendation || {};
  const generatedAt = new Date();

  let y = 0;

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------

  const setText = (color, size, style = "normal") => {
    doc.setTextColor(...color);
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
  };

  const ensureSpace = (needed) => {
    if (y + needed > PAGE_HEIGHT - FOOTER_SPACE) {
      // The page header changes the font, so restore the caller's styling
      const font = doc.getFont();
      const size = doc.getFontSize();
      const color = doc.getTextColor();

      doc.addPage();
      drawPageHeader(false);

      doc.setFont(font.fontName, font.fontStyle);
      doc.setFontSize(size);
      doc.setTextColor(color);
    }
  };

  const wrap = (text, width) => doc.splitTextToSize(pdfSafe(text), width);

  // Draw pre-wrapped lines with the same spacing used to advance y
  const drawLines = (lines, x) => {
    lines.forEach((line, index) => doc.text(line, x, y + index * LINE_HEIGHT));
  };

  const paragraph = (text, { x = MARGIN, width = CONTENT_WIDTH, size = 11, color = TEXT, style = "normal" } = {}) => {
    setText(color, size, style);
    const lines = wrap(text, width);
    lines.forEach((line) => {
      ensureSpace(LINE_HEIGHT);
      doc.text(line, x, y);
      y += LINE_HEIGHT;
    });
  };

  const sectionTitle = (title) => {
    // Keep the title together with at least a few lines of its content
    ensureSpace(32);
    y += 4;
    doc.setFillColor(...HAZARD);
    doc.rect(MARGIN, y - 4.5, 2.2, 6, "F");
    setText(BROWN, 14, "bold");
    doc.text(title, MARGIN + 5, y);
    y += 3;
    doc.setDrawColor(...SAND_LINE);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 7;
  };

  function drawHazardStripe(top, height) {
    doc.setFillColor(...BROWN);
    doc.rect(0, top, PAGE_WIDTH, height, "F");
    doc.setFillColor(...HAZARD);
    for (let x = -height; x < PAGE_WIDTH + height; x += 8) {
      doc.triangle(x, top + height, x + height, top, x + height + 4, top, "F");
      doc.triangle(x, top + height, x + 4, top + height, x + height + 4, top, "F");
    }
  }

  function drawPageHeader(first) {
    if (first) {
      doc.setFillColor(...BROWN);
      doc.rect(0, 0, PAGE_WIDTH, 34, "F");
      drawHazardStripe(34, 3);

      setText([255, 255, 255], 22, "bold");
      doc.text("Contract", MARGIN, 18);
      doc.setTextColor(...HAZARD);
      doc.text("Sentinel", MARGIN + doc.getTextWidth("Contract "), 18);

      setText(SAND_LINE, 11);
      doc.text("Construction Procurement Audit Report", MARGIN, 26);

      setText(SAND_LINE, 9);
      doc.text(generatedAt.toLocaleDateString(), PAGE_WIDTH - MARGIN, 18, { align: "right" });
      y = 50;
    } else {
      doc.setFillColor(...BROWN);
      doc.rect(0, 0, PAGE_WIDTH, 12, "F");
      drawHazardStripe(12, 1.5);
      setText(SAND_LINE, 9, "bold");
      doc.text("Contract Sentinel - Procurement Audit Report", MARGIN, 8);
      y = 26;
    }
  }

  // ------------------------------------------------------------
  // Page 1 header and decision banner
  // ------------------------------------------------------------

  drawPageHeader(true);

  doc.setFillColor(...risk.rgb);
  doc.roundedRect(MARGIN, y - 6, CONTENT_WIDTH, 20, 2, 2, "F");
  setText([255, 255, 255], 9, "bold");
  doc.text("RECOMMENDED ACTION", MARGIN + 6, y);
  setText([255, 255, 255], 16, "bold");
  doc.text(pdfSafe(recommendation.decision || "MANUAL REVIEW REQUIRED"), MARGIN + 6, y + 8);
  setText([255, 255, 255], 9, "bold");
  doc.text("RISK LEVEL", PAGE_WIDTH - MARGIN - 6, y, { align: "right" });
  setText([255, 255, 255], 16, "bold");
  doc.text(pdfSafe(analysis.risk), PAGE_WIDTH - MARGIN - 6, y + 8, { align: "right" });
  y += 24;

  // ------------------------------------------------------------
  // Project details
  // ------------------------------------------------------------

  const project = analysis.project || {};
  const files = analysis.files || {};

  const details = [
    ["Project", project.name],
    ["Contract No.", project.contract_no],
    ["Contractor", project.contractor],
    ["Contract Value", project.contract_value],
    ["Amount Claimed", project.amount_claimed],
    ["Invoice Date", project.invoice_date],
    ["Contract File", files.contract],
    ["Invoice File", files.invoice],
    ["Site Photo", files.photo],
  ].filter(([, value]) => value);

  if (details.length) {
    sectionTitle("Project Details");

    details.forEach(([label, value]) => {
      setText(TEXT, 10, "bold");
      const lines = wrap(value, CONTENT_WIDTH - 45);
      ensureSpace(lines.length * LINE_HEIGHT);
      drawLines(lines, MARGIN + 45);
      setText(MUTED, 10);
      doc.text(label, MARGIN, y);
      y += lines.length * LINE_HEIGHT;
    });

    y += 2;
  }

  // ------------------------------------------------------------
  // Executive summary
  // ------------------------------------------------------------

  sectionTitle("Executive Summary");

  const summaryRows = [
    ["Invoice Progress (claimed)", percent(analysis.invoice_progress), TEXT],
    ["Expected Progress", percent(analysis.estimated_progress), TEXT],
    ["Difference", signedPercent(analysis.difference), [201, 138, 0]],
    ["Analysis Confidence", analysis.confidence != null ? `${analysis.confidence}%` : "N/A", TEXT],
    ["Risk Level", pdfSafe(analysis.risk), risk.rgb],
  ];

  ensureSpace(summaryRows.length * 9 + 4);

  summaryRows.forEach(([label, value, color], index) => {
    if (index % 2 === 0) {
      doc.setFillColor(...SAND_LIGHT);
      doc.rect(MARGIN, y - 5.5, CONTENT_WIDTH, 9, "F");
    }
    setText(TEXT, 11);
    doc.text(label, MARGIN + 4, y);
    setText(color, 11, "bold");
    doc.text(value, PAGE_WIDTH - MARGIN - 4, y, { align: "right" });
    y += 9;
  });

  y += 4;

  // Claimed vs expected bars
  const bars = [
    ["Invoice claims", analysis.invoice_progress, SAND_DARK],
    ["Expected", analysis.estimated_progress, HAZARD],
  ];

  ensureSpace(bars.length * 11 + 4);

  bars.forEach(([label, value, color]) => {
    setText(MUTED, 9);
    doc.text(label, MARGIN, y);
    const barX = MARGIN + 30;
    const barWidth = CONTENT_WIDTH - 50;
    doc.setFillColor(...SAND_LIGHT);
    doc.rect(barX, y - 4, barWidth, 5, "F");
    if (value != null) {
      doc.setFillColor(...color);
      doc.rect(barX, y - 4, (barWidth * Math.min(Math.max(value, 0), 100)) / 100, 5, "F");
    }
    setText(TEXT, 9, "bold");
    doc.text(percent(value), PAGE_WIDTH - MARGIN, y, { align: "right" });
    y += 9;
  });

  // ------------------------------------------------------------
  // Findings
  // ------------------------------------------------------------

  sectionTitle("Audit Findings");

  (analysis.findings || []).forEach((finding, index) => {
    setText(TEXT, 11);
    const lines = wrap(finding, CONTENT_WIDTH - 10);
    ensureSpace(lines.length * LINE_HEIGHT + 3);
    drawLines(lines, MARGIN + 8);

    setText(SAND_MID, 11, "bold");
    doc.text(`${index + 1}.`, MARGIN, y);

    y += lines.length * LINE_HEIGHT + 3;
  });

  if (analysis.site_observations) {
    y += 2;
    paragraph(`Site photo: ${analysis.site_observations}`, { color: MUTED, size: 10, style: "italic" });
  }

  // ------------------------------------------------------------
  // Recommendation
  // ------------------------------------------------------------

  sectionTitle("Procurement Recommendation");

  setText(risk.rgb, 12, "bold");
  ensureSpace(LINE_HEIGHT * 2);
  doc.text(`Decision: ${pdfSafe(recommendation.decision)}`, MARGIN, y);
  y += LINE_HEIGHT + 2;

  paragraph(recommendation.summary);

  // ------------------------------------------------------------
  // Method / notes
  // ------------------------------------------------------------

  sectionTitle("Analysis Method");

  paragraph(
    analysis.engine === "gemini"
      ? `Analysed by Google Gemini (${analysis.model}) using the contract text, the invoice and the site photo.`
      : "Analysed by the Contract Sentinel rule-based engine: claimed progress is read from the invoice and expected progress is derived from the contract schedule using a standard construction S-curve.",
    { size: 10, color: MUTED }
  );

  (analysis.notes || []).forEach((note) => {
    y += 1;
    paragraph(`Note: ${note}`, { size: 10, color: MUTED });
  });

  y += 3;
  paragraph(
    "This report supports, but does not replace, physical verification of work by the Engineer-in-Charge.",
    { size: 9, color: MUTED, style: "italic" }
  );

  // ------------------------------------------------------------
  // Footer on every page
  // ------------------------------------------------------------

  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...SAND_LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_HEIGHT - 15, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 15);
    setText(MUTED, 8);
    doc.text(`Generated by Contract Sentinel on ${generatedAt.toLocaleString()}`, MARGIN, PAGE_HEIGHT - 10);
    doc.text(`Page ${page} of ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: "right" });
  }

  return doc;
}

export function downloadReport(analysis) {
  const doc = buildReport(analysis);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`Contract_Sentinel_Report_${stamp}.pdf`);
}
