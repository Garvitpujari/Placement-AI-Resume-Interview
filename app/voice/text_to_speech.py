"""
text_to_speech.py

Converts the interviewer's textual response
into speech.
"""

import pyttsx3


engine = pyttsx3.init()

engine.setProperty("rate", 175)
engine.setProperty("volume", 1.0)


def speak(text: str) -> None:
    """
    Convert text into speech and play it.
    """

    if not text:
        return

    engine.say(text)
    engine.runAndWait()  # wait until speaking is finished v