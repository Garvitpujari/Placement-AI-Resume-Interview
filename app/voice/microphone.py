"""
microphone.py

Records the candidate's voice from the microphone.

Recording continues until the candidate presses ENTER.
The candidate can pause and think for as long as needed.
"""

import threading

import numpy as np
import sounddevice as sd  # access the microphone and  record audio 
from scipy.io.wavfile import write


# ==========================================================
# Configuration
# ==========================================================

SAMPLE_RATE = 16000   # 16k audio samples per second
CHANNELS = 1
BLOCK_SIZE = 1024    # chunks of 1024 samples 


# ==========================================================
# Record Audio
# ==========================================================

def record_audio(output_path: str) -> str:
    """
    Record microphone audio until the candidate presses ENTER.
    """

    print("\n🎤 Recording...")
    print("Speak your answer. Press ENTER when you are finished.")

    audio_chunks = []
    stop_event = threading.Event() # keep recording till it is false

    def callback(indata, frames, time_info, status):

        if status:  # eror , print it
            print(status)

        audio_chunks.append(indata.copy()) # make our own copy 

    # ------------------------------------------------------
    # Wait for ENTER in a separate thread
    # ------------------------------------------------------

    def wait_for_enter():
        input()            # waits for candidate to press enter    
        stop_event.set()   
    # two things reqd simultaneously recordinng and enter 
    input_thread = threading.Thread(
        target=wait_for_enter,
        daemon=True,
    )

    input_thread.start()

    # ------------------------------------------------------
    # Start microphone
    # ------------------------------------------------------

    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="float32", # -1 to 1 range
        blocksize=BLOCK_SIZE,
        callback=callback,
    ):

        while not stop_event.is_set():
            stop_event.wait(0.1)  # checking in every 100 ms 

    # ------------------------------------------------------
    # Validate recording
    # ------------------------------------------------------

    if not audio_chunks:
        raise RuntimeError("No audio was recorded.")

    # ------------------------------------------------------
    # Combine chunks
    # ------------------------------------------------------

    audio = np.concatenate(
        audio_chunks,
        axis=0,
    )

    # ------------------------------------------------------
    # Convert float32 → int16 WAV   wav requires int 16 
    # ------------------------------------------------------

    audio = np.int16(
        np.clip(audio, -1.0, 1.0) * 32767 # values b/w -1 to  then multtiply bt 32767 to convert to int16 range -1 to 1 just for safety
    )

    write(
        output_path,
        SAMPLE_RATE,
        audio,
    )

    print("✓ Recording complete.")

    return output_path