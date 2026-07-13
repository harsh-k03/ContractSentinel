import os
import json

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODELS = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
]


def analyze_documents(contract_text, invoice_text):

    prompt = f"""
You are an expert AI Procurement Auditor.

Construction Contract:

{contract_text}

--------------------------------

Contractor Invoice:

{invoice_text}

--------------------------------

Your task:

1. Estimate claimed invoice progress.
2. Estimate expected construction progress.
3. Calculate the difference.
4. Determine procurement risk.
5. Return exactly 3 concise findings.

IMPORTANT:
Return ONLY valid JSON.

Example:

{{
  "invoice_progress": 60,
  "estimated_progress": 42,
  "difference": 18,
  "risk": "HIGH",
  "findings": [
    "Invoice claims higher progress than expected.",
    "Milestone payment appears premature.",
    "Engineer verification is recommended."
  ]
}}

Return JSON only.
"""

    last_error = None

    for model in MODELS:

        try:

            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            return response.text

        except Exception as e:

            print(f"\nModel {model} failed.\n{e}\n")

            last_error = e

    raise Exception(last_error)