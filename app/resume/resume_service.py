"""
resume_service.py

Handles resume parsing and persistence.
"""

from sqlalchemy.orm import Session

from app.database.crud import save_resume
from app.resume.parser import parse_resume


def upload_resume(
    db: Session,
    user_id: int,
    pdf_path: str,
):
    """
    Parse a PDF resume and save it.

    Returns
    -------
    Resume
        Saved resume object.
    """

    resume_text = parse_resume(pdf_path)

    resume = save_resume(
        db=db,
        user_id=user_id,
        resume_text=resume_text,
    )

    return resume


def get_resume_text(
    pdf_path: str,
) -> str:
    """
    Extract resume text without saving.
    """

    return parse_resume(pdf_path)  # does not save to db, just returns the text