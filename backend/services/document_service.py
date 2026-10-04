from pathlib import Path

import pdfplumber


PDF_EXTENSIONS = {".pdf"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

IMAGE_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


class DocumentError(Exception):
    """Raised when an uploaded document cannot be read."""


def is_pdf(path: Path) -> bool:
    return path.suffix.lower() in PDF_EXTENSIONS


def is_image(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTENSIONS


def image_mime_type(path: Path) -> str:
    return IMAGE_MIME_TYPES.get(path.suffix.lower(), "image/jpeg")


def extract_pdf_text(pdf_path: str) -> str:

    text = ""

    try:

        with pdfplumber.open(pdf_path) as pdf:

            for page in pdf.pages:

                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

    except Exception as e:
        raise DocumentError(
            f"Could not read PDF '{Path(pdf_path).name}'. "
            "Make sure it is a valid, non-encrypted PDF file."
        ) from e

    return text


def extract_text(path: Path) -> str:
    """Return the text of a PDF, or an empty string for images."""

    if is_pdf(path):
        return extract_pdf_text(str(path))

    return ""
