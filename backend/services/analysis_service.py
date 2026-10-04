"""
Shared analysis logic used by both analysis engines:

- a rule-based engine that works offline by reading the contract
  schedule and the invoice claim straight from the document text
- normalisation of any engine's output into one consistent response
  (risk level, recommendation and difference always agree with the numbers)
"""

import re
from datetime import date, datetime


RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"]

# Difference (claimed - expected progress) thresholds, in percentage points
MEDIUM_RISK_THRESHOLD = 5
HIGH_RISK_THRESHOLD = 15

RECOMMENDATIONS = {
    "LOW": {
        "decision": "RELEASE PAYMENT",
        "summary": (
            "Invoiced progress is consistent with the expected progress "
            "for this stage of the project. The milestone payment can be "
            "released after routine checks."
        ),
    },
    "MEDIUM": {
        "decision": "VERIFY BEFORE RELEASE",
        "summary": (
            "Invoiced progress is moderately ahead of the expected progress. "
            "Release only the verified portion of the claim and request "
            "supporting measurements from the contractor."
        ),
    },
    "HIGH": {
        "decision": "WITHHOLD PAYMENT",
        "summary": (
            "Invoice claims significantly higher work completion than "
            "estimated from the submitted project evidence. Withhold the "
            "milestone payment until the Engineer-in-Charge verifies the "
            "progress on site."
        ),
    },
    "UNKNOWN": {
        "decision": "MANUAL REVIEW REQUIRED",
        "summary": (
            "The documents did not contain enough information to compare "
            "claimed and expected progress automatically. A procurement "
            "officer should review the claim manually."
        ),
    },
}


# ---------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------

MONTHS = {
    m: i + 1
    for i, m in enumerate(
        [
            "jan", "feb", "mar", "apr", "may", "jun",
            "jul", "aug", "sep", "oct", "nov", "dec",
        ]
    )
}

DATE_PATTERNS = [
    # 2026-03-01
    (r"(\d{4})-(\d{1,2})-(\d{1,2})", "ymd"),
    # 01/03/2026, 01-03-2026, 01.03.2026 (day first, Indian / UK style)
    (r"(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})", "dmy"),
    # 1 March 2026, 1st Mar 2026
    (r"(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})", "d_mon_y"),
    # March 1, 2026
    (r"([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})", "mon_d_y"),
]


def parse_date(text: str):
    """Return the first date found in text, or None."""

    for pattern, kind in DATE_PATTERNS:

        for match in re.finditer(pattern, text):

            a, b, c = match.groups()

            try:
                if kind == "ymd":
                    return date(int(a), int(b), int(c))
                if kind == "dmy":
                    return date(int(c), int(b), int(a))
                if kind == "d_mon_y":
                    month = MONTHS.get(b[:3].lower())
                    if month:
                        return date(int(c), month, int(a))
                if kind == "mon_d_y":
                    month = MONTHS.get(a[:3].lower())
                    if month:
                        return date(int(c), month, int(b))
            except ValueError:
                continue

    return None


def find_labeled_date(text: str, labels):
    for line in text.splitlines():
        lower = line.lower()
        if any(label in lower for label in labels):
            found = parse_date(line)
            if found:
                return found
    return None


AMOUNT_RE = re.compile(
    r"(?:INR|Rs\.?|₹|USD|\$)\s*([\d,]+(?:\.\d+)?)",
    re.IGNORECASE,
)


def parse_amount(text: str):
    match = AMOUNT_RE.search(text)
    if not match:
        return None
    try:
        return float(match.group(1).replace(",", ""))
    except ValueError:
        return None


def find_labeled_amount(text: str, labels):
    for line in text.splitlines():
        lower = line.lower()
        if any(label in lower for label in labels):
            amount = parse_amount(line)
            if amount:
                return amount
    return None


def find_labeled_value(text: str, labels):
    for line in text.splitlines():
        for label in labels:
            match = re.match(
                rf"\s*{re.escape(label)}\s*[:\-]\s*(.+)",
                line,
                re.IGNORECASE,
            )
            if match:
                return match.group(1).strip()
    return None


PERCENT_RE = re.compile(r"(\d{1,3}(?:\.\d+)?)\s*%")

CLAIM_KEYWORDS = [
    "cumulative",
    "overall",
    "total progress",
    "physical progress",
    "progress claimed",
    "work completed",
]


def find_claimed_progress(invoice_text: str):
    """Look for an explicit overall progress percentage in the invoice."""

    for line in invoice_text.splitlines():
        lower = line.lower()
        if any(keyword in lower for keyword in CLAIM_KEYWORDS):
            match = PERCENT_RE.search(line)
            if match:
                value = float(match.group(1))
                if 0 <= value <= 100:
                    return value

    return None


def planned_progress(start: date, end: date, on: date) -> float:
    """
    Expected physical progress on a given date using the classic
    construction S-curve (slow mobilisation, fast middle, slow finish).
    """

    total = (end - start).days

    if total <= 0:
        return 0.0

    t = min(max((on - start).days / total, 0.0), 1.0)

    return round((3 * t ** 2 - 2 * t ** 3) * 100, 1)


def find_labeled_amount_text(text: str, labels):
    """The amount exactly as written in the document, e.g. 'INR 2,40,00,000'."""
    for line in text.splitlines():
        lower = line.lower()
        if any(label in lower for label in labels):
            match = AMOUNT_RE.search(line)
            if match:
                return match.group(0).strip()
    return None


# ---------------------------------------------------------------
# Risk and normalisation
# ---------------------------------------------------------------


def risk_from_difference(difference):

    if difference is None:
        return "UNKNOWN"

    if difference > HIGH_RISK_THRESHOLD:
        return "HIGH"

    if difference > MEDIUM_RISK_THRESHOLD:
        return "MEDIUM"

    return "LOW"


def _to_percent(value):

    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip().rstrip("%").strip()

    try:
        number = float(value)
    except (TypeError, ValueError):
        return None

    return round(min(max(number, 0.0), 100.0), 1)


def normalize_analysis(raw: dict, engine: str, model=None, notes=None) -> dict:
    """
    Turn the output of any engine into a consistent response.

    The difference is always recomputed from the two progress values
    and the risk level can never be lower than what the numbers imply.
    """

    invoice_progress = _to_percent(raw.get("invoice_progress"))
    estimated_progress = _to_percent(raw.get("estimated_progress"))

    difference = None
    if invoice_progress is not None and estimated_progress is not None:
        difference = round(invoice_progress - estimated_progress, 1)

    numeric_risk = risk_from_difference(difference)

    reported_risk = str(raw.get("risk") or "").strip().upper()

    if reported_risk in RISK_LEVELS and numeric_risk in RISK_LEVELS:
        risk = max(
            reported_risk,
            numeric_risk,
            key=RISK_LEVELS.index,
        )
    elif reported_risk in RISK_LEVELS:
        risk = reported_risk
    else:
        risk = numeric_risk

    findings = [
        str(item).strip()
        for item in (raw.get("findings") or [])
        if str(item).strip()
    ][:6]

    if not findings:
        findings = ["No specific findings were reported."]

    confidence = raw.get("confidence")
    try:
        confidence = int(round(float(confidence)))
        confidence = min(max(confidence, 0), 100)
    except (TypeError, ValueError):
        confidence = None

    recommendation = dict(RECOMMENDATIONS[risk])

    raw_recommendation = raw.get("recommendation")
    if isinstance(raw_recommendation, str) and raw_recommendation.strip():
        recommendation["summary"] = raw_recommendation.strip()

    return {
        "invoice_progress": invoice_progress,
        "estimated_progress": estimated_progress,
        "difference": difference,
        "risk": risk,
        "confidence": confidence,
        "findings": findings,
        "recommendation": recommendation,
        "site_observations": str(raw.get("site_observations") or "").strip()
        or None,
        "project": raw.get("project") or {},
        "engine": engine,
        "model": model,
        "notes": notes or [],
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }


# ---------------------------------------------------------------
# Rule-based engine
# ---------------------------------------------------------------


def rule_based_analysis(contract_text: str, invoice_text: str) -> dict:
    """
    Offline analysis that reads the contract schedule and the invoice
    claim from the document text. Used when Gemini is not configured
    or unavailable.
    """

    findings = []
    signals = 0

    contract_value_labels = ["contract value", "contract amount", "contract price"]
    claimed_labels = ["claimed to date", "amount claimed", "cumulative", "gross amount"]

    contract_value = find_labeled_amount(contract_text, contract_value_labels)
    start = find_labeled_date(
        contract_text, ["start date", "commencement", "start of work"]
    )
    end = find_labeled_date(
        contract_text,
        ["completion date", "end date", "completion of work", "finish date"],
    )
    invoice_date = find_labeled_date(
        invoice_text, ["invoice date", "bill date", "date"]
    )
    claimed_amount = find_labeled_amount(invoice_text, claimed_labels)

    project = {
        "name": find_labeled_value(contract_text, ["project", "name of work"]),
        "contract_no": find_labeled_value(
            contract_text, ["contract no", "contract number", "agreement no"]
        ),
        "contractor": find_labeled_value(
            contract_text, ["contractor"]
        ) or find_labeled_value(invoice_text, ["contractor"]),
        "contract_value": find_labeled_amount_text(
            contract_text, contract_value_labels
        ),
        "amount_claimed": find_labeled_amount_text(invoice_text, claimed_labels),
        "invoice_date": invoice_date.isoformat() if invoice_date else None,
    }

    # Claimed progress: explicit percentage, else amount / contract value
    invoice_progress = find_claimed_progress(invoice_text)

    if invoice_progress is not None:
        signals += 1
        findings.append(
            f"Invoice claims {invoice_progress:g}% cumulative physical progress."
        )
    elif claimed_amount and contract_value:
        signals += 1
        invoice_progress = round(claimed_amount / contract_value * 100, 1)
        findings.append(
            f"Amount claimed to date is {invoice_progress:g}% of the contract value."
        )
    else:
        findings.append(
            "Claimed progress could not be identified in the invoice."
        )

    if claimed_amount and contract_value and invoice_progress is not None:
        billed_share = claimed_amount / contract_value * 100
        if abs(billed_share - invoice_progress) > 2:
            findings.append(
                f"Billed amount ({billed_share:.1f}% of contract value) does "
                f"not match the claimed physical progress ({invoice_progress:g}%)."
            )

    # Expected progress from the contract schedule
    estimated_progress = None

    if start and end and invoice_date:
        signals += 1
        estimated_progress = planned_progress(start, end, invoice_date)
        elapsed = (invoice_date - start).days
        total = (end - start).days
        findings.append(
            f"{elapsed} of {total} contract days had elapsed on the invoice "
            f"date; the planned S-curve progress is {estimated_progress:g}%."
        )
    else:
        findings.append(
            "Contract start/completion dates or the invoice date are missing, "
            "so expected progress could not be scheduled."
        )

    if invoice_progress is not None and estimated_progress is not None:
        gap = invoice_progress - estimated_progress
        if gap > HIGH_RISK_THRESHOLD:
            findings.append(
                "Claimed progress is far ahead of schedule; the milestone "
                "payment appears premature."
            )
        elif gap > MEDIUM_RISK_THRESHOLD:
            findings.append(
                "Claimed progress is ahead of schedule; supporting "
                "measurement records should be requested."
            )
        else:
            findings.append(
                "Claimed progress is consistent with the contract schedule."
            )

    if "engineer" in contract_text.lower():
        findings.append(
            "Contract requires Engineer-in-Charge verification before "
            "milestone payments are released."
        )

    confidence = {0: 20, 1: 45, 2: 70}.get(signals, 70)

    return {
        "invoice_progress": invoice_progress,
        "estimated_progress": estimated_progress,
        "confidence": confidence,
        "findings": findings,
        "project": {k: v for k, v in project.items() if v},
    }
