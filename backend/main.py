import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from llm import ask_model

app = FastAPI(title="AI Language Tutor")

# Allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str

frontend_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)
@app.get("/")
def home():
    return FileResponse(
        os.path.join(frontend_path, "index.html")
    )


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    prompt = f"""
You are an AI Language Tutor.

Your job is to help the learner improve their language skills.

When the learner sends a message:
1. Respond naturally and clearly.
2. Correct important grammar mistakes.
3. Suggest better vocabulary when useful.
4. Keep the explanation beginner-friendly.
5. Encourage the learner to continue practicing.

Learner's message:
{request.message}
"""

    try:
        reply = ask_model(prompt)
        return ChatResponse(reply=reply)

    except Exception as error:
        return {
            "reply": "ERROR: " + str(error)
        }


@app.get("/app.js")
def app_js():
    return FileResponse(
        os.path.join(frontend_path, "app.js")
    )


@app.get("/style.css")
def style_css():
    return FileResponse(
        os.path.join(frontend_path, "style.css")
    )