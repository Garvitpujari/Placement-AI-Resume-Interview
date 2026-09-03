"""
parser.py

Extracts text from PDF resumes.
"""

import fitz


def parse_resume(pdf_path: str) -> str:
    """
    Extract text from a PDF resume.

    Parameters
    ----------
    pdf_path : str
        Path to the resume PDF.

    Returns
    -------
    str
        Extracted resume text.
    """

    document = fitz.open(pdf_path)

    pages = []

    for page in document:
        pages.append(page.get_text())  # join text of different pages into a single string

    document.close()

    return "\n".join(pages).strip() 