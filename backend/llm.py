import os
from dotenv import load_dotenv
from google import genai

# Load variables from .env
load_dotenv()

# Get Gemini settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

# Check API key
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Please add it to your .env file."
    )

# Create Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)


def ask_model(prompt: str) -> str:
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    return response.text