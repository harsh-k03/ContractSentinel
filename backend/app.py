from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Contract Sentinel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Contract Sentinel API Running"}


@app.post("/analyze")
async def analyze(
    contract: UploadFile = File(...),
    invoice: UploadFile = File(...),
    photo: UploadFile = File(...)
):

    return {

        "status": "success",

        "invoice_progress": 60,

        "estimated_progress": 42,

        "difference": 18,

        "risk": "HIGH",

        "clause_risk": 76,

        "findings": [

            "Possible overbilling detected.",

            "Visual evidence indicates slower construction progress.",

            "Payment milestone wording is ambiguous.",

            "Request revised invoice before payment."

        ],

        "vendor_notice":
        "Invoice claims 60% completion while AI estimates approximately 42%. Please submit supporting evidence before payment approval."

    }