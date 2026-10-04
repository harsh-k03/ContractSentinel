from datetime import date

from services.analysis_service import (
    normalize_analysis,
    parse_date,
    planned_progress,
    risk_from_difference,
)
from services.gemini_service import parse_json, short_error


def test_parse_date_formats():
    assert parse_date("Start Date: 01/03/2026") == date(2026, 3, 1)
    assert parse_date("on 2026-08-15") == date(2026, 8, 15)
    assert parse_date("15th August 2026") == date(2026, 8, 15)
    assert parse_date("August 15, 2026") == date(2026, 8, 15)
    assert parse_date("no date here") is None


def test_planned_progress_follows_s_curve():
    start, end = date(2026, 1, 1), date(2027, 1, 1)

    assert planned_progress(start, end, start) == 0
    assert planned_progress(start, end, end) == 100
    assert 49 <= planned_progress(start, end, date(2026, 7, 2)) <= 51


def test_risk_thresholds():
    assert risk_from_difference(None) == "UNKNOWN"
    assert risk_from_difference(2) == "LOW"
    assert risk_from_difference(10) == "MEDIUM"
    assert risk_from_difference(18) == "HIGH"


def test_normalize_recomputes_difference_and_never_lowers_risk():
    result = normalize_analysis(
        {
            "invoice_progress": "60%",
            "estimated_progress": 42,
            "difference": 5,
            "risk": "low",
            "findings": ["a", "", "b"],
            "confidence": "88",
        },
        engine="gemini",
    )

    assert result["difference"] == 18
    assert result["risk"] == "HIGH"
    assert result["findings"] == ["a", "b"]
    assert result["confidence"] == 88
    assert result["recommendation"]["decision"] == "WITHHOLD PAYMENT"


def test_parse_json_strips_code_fences():
    assert parse_json('```json\n{"risk": "LOW"}\n```') == {"risk": "LOW"}
    assert parse_json('Here you go: {"risk": "LOW"} thanks') == {"risk": "LOW"}


def test_short_error_hides_raw_api_payload():
    error = Exception(
        "400 INVALID_ARGUMENT. {'error': {'code': 400, 'message': "
        "'API key not valid. Please pass a valid API key.', 'reason': 'API_KEY_INVALID'}}"
    )

    assert short_error(error) == "the Gemini API key is not valid"
