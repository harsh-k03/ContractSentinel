import os
import re
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.document_service import (
    DocumentError,
    extract_text,
    image_mime_type,
    is_image,
    is_pdf,
)
from services.analysis_service import normalize_analysis, rule_based_analysis
from services import gemini_service


app = FastAPI(title="Contract Sentinel API")

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB per file

DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
] or DEFAULT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def engine_status():
    return {
        "ai_configured": gemini_service.is_configured(),
        "engine": "gemini" if gemini_service.is_configured() else "rule-based",
    }


@app.get("/")
def root():
    return {
        "status": "Backend Running",
        "message": "Contract Sentinel API Ready",
        **engine_status(),
    }


@app.get("/health")
def health():
    return {"status": "ok", **engine_status()}


# -------------------------------
# Upload helpers
# -------------------------------


def safe_filename(name: str) -> str:
    name = Path(name or "upload").name
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name[-100:] or "upload"


def save_upload(upload: UploadFile, field: str, allow_pdf: bool, allow_image: bool) -> Path:

    original = safe_filename(upload.filename)
    path = UPLOAD_DIR / f"{uuid.uuid4().hex[:12]}_{original}"

    allowed = (allow_pdf and is_pdf(path)) or (allow_image and is_image(path))

    if not allowed:
        kinds = " or ".join(
            kind
            for kind, ok in [("PDF", allow_pdf), ("JPG/PNG/WEBP image", allow_image)]
            if ok
        )
        raise HTTPException(
            status_code=400,
            detail=f"The {field} must be a {kinds} file (got '{original}').",
        )

    data = upload.file.read(MAX_UPLOAD_BYTES + 1)

    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"The {field} file is larger than 20 MB.",
        )

    if not data:
        raise HTTPException(
            status_code=400,
            detail=f"The {field} file is empty.",
        )

    path.write_bytes(data)

    return path


# -------------------------------
# Analysis
# -------------------------------


@app.post("/analyze")
def analyze(
    contract: UploadFile = File(...),
    invoice: UploadFile = File(...),
    photo: UploadFile = File(...),
):

    contract_path = save_upload(contract, "contract", allow_pdf=True, allow_image=False)
    invoice_path = save_upload(invoice, "invoice", allow_pdf=True, allow_image=True)
    photo_path = save_upload(photo, "site photo", allow_pdf=False, allow_image=True)

    try:
        contract_text = extract_text(contract_path)
        invoice_text = extract_text(invoice_path)
    except DocumentError as e:
        raise HTTPException(status_code=400, detail=str(e))

    notes = []

    if is_pdf(contract_path) and not contract_text.strip():
        notes.append(
            "No text could be extracted from the contract PDF "
            "(it may be a scanned document)."
        )

    if is_pdf(invoice_path) and not invoice_text.strip():
        notes.append(
            "No text could be extracted from the invoice PDF "
            "(it may be a scanned document)."
        )

    # -------------------------------
    # Gemini AI Analysis
    # -------------------------------

    if gemini_service.is_configured():

        images = [
            ("latest construction site photo", photo_path.read_bytes(), image_mime_type(photo_path))
        ]

        if is_image(invoice_path):
            images.insert(
                0,
                ("scanned contractor invoice", invoice_path.read_bytes(), image_mime_type(invoice_path)),
            )

        try:

            result, model = gemini_service.analyze_documents(
                contract_text,
                invoice_text,
                images,
            )

            return with_files(
                normalize_analysis(result, engine="gemini", model=model, notes=notes),
                contract, invoice, photo,
            )

        except gemini_service.GeminiUnavailable as e:

            print(f"\n========== GEMINI UNAVAILABLE ==========\n{e}\n")

            notes.insert(
                0,
                f"AI analysis was unavailable ({e}). "
                "Showing the rule-based analysis instead.",
            )

    else:

        notes.insert(
            0,
            "GEMINI_API_KEY is not configured. Showing the rule-based "
            "analysis; the site photo was not analysed visually.",
        )

    # -------------------------------
    # Rule-based fallback
    # -------------------------------

    if is_image(invoice_path):
        notes.append(
            "The invoice is an image, which the rule-based engine cannot "
            "read. Upload a PDF invoice or configure Gemini."
        )

    result = rule_based_analysis(contract_text, invoice_text)

    return with_files(
        normalize_analysis(result, engine="rule-based", notes=notes),
        contract, invoice, photo,
    )


def with_files(analysis, contract, invoice, photo):
    analysis["files"] = {
        "contract": contract.filename,
        "invoice": invoice.filename,
        "photo": photo.filename,
    }
    return analysis
