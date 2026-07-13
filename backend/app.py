from pathlib import Path
import shutil
import json

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from services.document_service import extract_pdf_text
from services.gemini_service import analyze_documents

app = FastAPI(title="Contract Sentinel API")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "Backend Running",
        "message": "Contract Sentinel API Ready"
    }


@app.post("/analyze")
async def analyze(
    contract: UploadFile = File(...),
    invoice: UploadFile = File(...),
    photo: UploadFile = File(...)
):

    # -------------------------------
    # Save uploaded files
    # -------------------------------

    contract_path = UPLOAD_DIR / contract.filename
    invoice_path = UPLOAD_DIR / invoice.filename
    photo_path = UPLOAD_DIR / photo.filename

    with open(contract_path, "wb") as buffer:
        shutil.copyfileobj(contract.file, buffer)

    with open(invoice_path, "wb") as buffer:
        shutil.copyfileobj(invoice.file, buffer)

    with open(photo_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    # -------------------------------
    # Extract PDF Text
    # -------------------------------

    contract_text = extract_pdf_text(str(contract_path))
    invoice_text = extract_pdf_text(str(invoice_path))

    print("\n========== CONTRACT ==========\n")
    print(contract_text)

    print("\n========== INVOICE ==========\n")
    print(invoice_text)

    # -------------------------------
    # Gemini AI Analysis
    # -------------------------------

    try:

        result = analyze_documents(
            contract_text,
            invoice_text
        )

        print("\n========== GEMINI RESPONSE ==========\n")
        print(result)

        cleaned = result.strip()

        if cleaned.startswith("```json"):
            cleaned = cleaned.replace("```json", "", 1)

        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```", "", 1)

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        cleaned = cleaned.strip()

        return json.loads(cleaned)

    except Exception as e:

        print("\n========== GEMINI ERROR ==========\n")
        print(e)

        return {
            "invoice_progress": 60,
            "estimated_progress": 42,
            "difference": 18,
            "risk": "HIGH",
            "findings": [
                "Gemini analysis failed.",
                "Using fallback demo response.",
                str(e)
            ]
        }