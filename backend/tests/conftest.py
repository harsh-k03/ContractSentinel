import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
SAMPLES_DIR = BACKEND_DIR.parent / "docs" / "samples"

sys.path.insert(0, str(BACKEND_DIR))


@pytest.fixture
def client(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    from fastapi.testclient import TestClient
    from app import app

    return TestClient(app)


@pytest.fixture
def sample_files():
    def build(contract="sample_contract.pdf", invoice="sample_invoice.pdf", photo="sample_site_photo.jpg"):
        return {
            "contract": (contract, (SAMPLES_DIR / "sample_contract.pdf").read_bytes()),
            "invoice": (invoice, (SAMPLES_DIR / "sample_invoice.pdf").read_bytes()),
            "photo": (photo, (SAMPLES_DIR / "sample_site_photo.jpg").read_bytes()),
        }

    return build
