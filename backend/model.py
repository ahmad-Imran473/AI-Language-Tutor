from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    language: str = "Spanish"
    level: str = "Beginner"
    topic: str = "General conversation"


class ChatResponse(BaseModel):
    reply: str
    correction: Optional[str] = None
    grammar_tip: Optional[str] = None
    vocabulary: list[str] = []


class PronunciationRequest(BaseModel):
    target_text: str = Field(..., min_length=1, max_length=500)
    spoken_text: str = Field(..., min_length=1, max_length=500)
    language: str = "English"


class PronunciationResponse(BaseModel):
    score: int
    feedback: str
    correct_words: list[str]
    incorrect_words: list[str]
    tips: list[str]


class LessonRequest(BaseModel):
    language: str = "Spanish"
    level: str = "Beginner"
    goal: str = "Improve everyday conversation"


class VocabularyRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=100)
    language: str = "Spanish"
    level: str = "Beginner"


class ProgressResponse(BaseModel):
    total_lessons: int
    average_score: float
    vocabulary_count: int
    streak: int