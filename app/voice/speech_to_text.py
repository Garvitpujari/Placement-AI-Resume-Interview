"""
speech_to_text.py

Converts microphone audio into text using Groq Speech-to-Text.

Groq hosts the Whisper model remotely, so we do not need to
load faster-whisper / CTranslate2 locally.
"""

import os

from dotenv import load_dotenv
from groq import Groq


# ==========================================================
# Environment
# ==========================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured in the environment."
    )


# ==========================================================
# Groq Client
# ==========================================================

client = Groq(
    api_key=GROQ_API_KEY,
)


# ==========================================================
# Configuration
# ==========================================================

STT_MODEL = os.getenv(
    "STT_MODEL",
    "whisper-large-v3-turbo",
)


# ==========================================================
# Speech To Text
# ==========================================================

def transcribe_audio(
    audio_path: str,
) -> str:
    """
    Transcribe an audio file into text using Groq Whisper.
    """

    if not audio_path:
        return ""

    if not os.path.exists(audio_path):
        raise FileNotFoundError(
            f"Audio file not found: {audio_path}"
        )

    try:

        print(
            "\nTranscribing your answer..."
        )

        with open(
            audio_path,
            "rb",
        ) as audio_file:

            transcription = (
                client.audio.transcriptions.create(
                    file=audio_file,
                    model=STT_MODEL,
                    language="en",
                    response_format="json",
                    temperature=0.0,
                )
            )

        text = transcription.text.strip()

        print(
            "Transcription complete."
        )

        return text

    except Exception as e:

        raise RuntimeError(
            f"Speech-to-text failed: {e}"
        ) from e