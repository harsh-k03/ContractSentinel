import os
import json
import re

from dotenv import load_dotenv


load_dotenv()

PLACEHOLDER_KEYS = {"", "your_gemini_api_key_here"}

DEFAULT_MODELS = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash",
]

_client = None


class GeminiUnavailable(Exception):
    """Raised when Gemini cannot produce an analysis."""


def api_key():
    key = (os.getenv("GEMINI_API_KEY") or "").strip()
    return None if key in PLACEHOLDER_KEYS else key


def is_configured() -> bool:
    return api_key() is not None


def models():
    preferred = (os.getenv("GEMINI_MODEL") or "").strip()
    ordered = [preferred] if preferred else []
    return ordered + [m for m in DEFAULT_MODELS if m != preferred]


def get_client():
    global _client

    if _client is None:

        if not is_configured():
            raise GeminiUnavailable("GEMINI_API_KEY is not configured")

        from google import genai

        _client = genai.Client(api_key=api_key())

    return _client


PROMPT = """
You are an expert construction procurement auditor.

You are given a construction contract, a contractor invoice (running bill)
and a recent photo of the construction site. Compare them and decide
whether the progress claimed in the invoice is supported by the evidence.

Construction Contract:
--------------------------------
{contract_text}
--------------------------------

Contractor Invoice:
--------------------------------
{invoice_text}
--------------------------------

{attachments}

Your task:

1. invoice_progress: overall physical progress (0-100) claimed by the invoice.
2. estimated_progress: overall progress (0-100) you expect from the contract
   schedule on the invoice date AND from what is visible in the site photo.
3. risk: LOW, MEDIUM or HIGH procurement risk of paying this invoice.
4. confidence: your confidence in this assessment (0-100).
5. findings: 3 to 5 concise, specific findings (one sentence each).
6. site_observations: one or two sentences describing what the photo shows.
7. recommendation: one or two sentences for the procurement officer.
8. project: name, contract_no, contractor, contract_value, amount_claimed
   as short strings (use null when unknown).

Return ONLY valid JSON with exactly these keys:

{{
  "invoice_progress": 60,
  "estimated_progress": 42,
  "risk": "HIGH",
  "confidence": 80,
  "findings": ["...", "...", "..."],
  "site_observations": "...",
  "recommendation": "...",
  "project": {{
    "name": "...",
    "contract_no": "...",
    "contractor": "...",
    "contract_value": "...",
    "amount_claimed": "..."
  }}
}}
"""


def parse_json(text: str) -> dict:

    cleaned = (text or "").strip()

    # Remove ```json fences if the model added them
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if not match:
            raise GeminiUnavailable("Gemini returned a response that is not JSON")
        data = json.loads(match.group(0))

    if not isinstance(data, dict):
        raise GeminiUnavailable("Gemini returned an unexpected JSON structure")

    return data


def short_error(error: Exception) -> str:
    """A one-line, user-friendly description of an API error."""

    message = str(error)

    if "API_KEY_INVALID" in message or "API key not valid" in message:
        return "the Gemini API key is not valid"
    if "PERMISSION_DENIED" in message:
        return "the Gemini API key does not have permission to use this model"
    if "RESOURCE_EXHAUSTED" in message or "429" in message:
        return "the Gemini API quota has been exceeded"
    if "NOT_FOUND" in message:
        return "the requested Gemini model was not found"
    if "UNAVAILABLE" in message or "503" in message:
        return "the Gemini service is temporarily unavailable"

    first_line = message.splitlines()[0] if message else type(error).__name__
    return first_line[:160]


def is_auth_error(error: Exception) -> bool:
    message = str(error)
    return "API_KEY_INVALID" in message or "API key not valid" in message


def analyze_documents(contract_text, invoice_text, images=None):
    """
    Ask Gemini to analyse the documents.

    images: list of (label, bytes, mime_type) tuples, e.g. the site
    photo and, when the invoice is a scan, the invoice image.

    Returns (result_dict, model_name). Raises GeminiUnavailable.
    """

    from google.genai import types

    client = get_client()
    images = images or []

    attachments = "\n".join(
        f"Attached image {i + 1}: {label}"
        for i, (label, _, _) in enumerate(images)
    )

    prompt = PROMPT.format(
        contract_text=contract_text or "(no text could be extracted)",
        invoice_text=invoice_text or "(see attached invoice image)",
        attachments=attachments,
    )

    contents = [prompt] + [
        types.Part.from_bytes(data=data, mime_type=mime)
        for _, data, mime in images
    ]

    config = types.GenerateContentConfig(
        temperature=0.2,
        response_mime_type="application/json",
    )

    last_error = None

    for model in models():

        try:

            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=config,
            )

            return parse_json(response.text), model

        except GeminiUnavailable as e:
            print(f"\nModel {model} returned invalid output: {e}\n")
            last_error = e

        except Exception as e:

            print(f"\nModel {model} failed: {short_error(e)}\n")

            last_error = e

            # Every model will fail the same way with a bad key
            if is_auth_error(e):
                break

    raise GeminiUnavailable(short_error(last_error))
