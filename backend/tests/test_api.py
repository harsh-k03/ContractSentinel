def test_health_reports_rule_based_engine_without_key(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["engine"] == "rule-based"


def test_analyze_samples_with_rule_based_engine(client, sample_files):
    response = client.post("/analyze", files=sample_files())

    assert response.status_code == 200

    data = response.json()

    assert data["engine"] == "rule-based"
    assert data["invoice_progress"] == 60
    assert 40 <= data["estimated_progress"] <= 46
    assert data["difference"] == round(data["invoice_progress"] - data["estimated_progress"], 1)
    assert data["risk"] == "HIGH"
    assert data["recommendation"]["decision"] == "WITHHOLD PAYMENT"
    assert data["project"]["contract_no"] == "CS/RD/2026/014"
    assert data["files"]["contract"] == "sample_contract.pdf"

    # Errors are reported as notes, never mixed into the findings
    assert any("GEMINI_API_KEY" in note for note in data["notes"])
    assert not any("error" in finding.lower() for finding in data["findings"])


def test_rejects_unsupported_contract_type(client, sample_files):
    response = client.post("/analyze", files=sample_files(contract="contract.docx"))

    assert response.status_code == 400
    assert "contract must be a PDF" in response.json()["detail"]


def test_image_invoice_does_not_crash(client, sample_files):
    files = sample_files()
    files["invoice"] = ("invoice.jpg", files["photo"][1])

    response = client.post("/analyze", files=files)

    assert response.status_code == 200
    assert response.json()["risk"] == "UNKNOWN"


def test_corrupt_pdf_returns_clear_error(client, sample_files):
    files = sample_files()
    files["contract"] = ("contract.pdf", b"not really a pdf")

    response = client.post("/analyze", files=files)

    assert response.status_code == 400
    assert "Could not read PDF" in response.json()["detail"]


def test_path_traversal_filenames_stay_in_upload_dir(client, sample_files):
    from app import UPLOAD_DIR

    before = set(UPLOAD_DIR.iterdir())

    response = client.post("/analyze", files=sample_files(contract="../../evil.pdf"))

    assert response.status_code == 200
    new_files = set(UPLOAD_DIR.iterdir()) - before
    assert all(path.parent == UPLOAD_DIR for path in new_files)
