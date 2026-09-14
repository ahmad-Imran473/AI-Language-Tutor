from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


@app.get("/")
def home():
    return {
        "message": "AI Language Tutor backend is running!"
    }


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