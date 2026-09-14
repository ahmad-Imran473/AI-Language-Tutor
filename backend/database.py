import sqlite3
from pathlib import Path
from datetime import datetime


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "language_tutor.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            language TEXT NOT NULL,
            level TEXT NOT NULL,
            topic TEXT NOT NULL,
            score REAL DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vocabulary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            meaning TEXT,
            example TEXT,
            language TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT NOT NULL,
            ai_response TEXT NOT NULL,
            language TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


def save_lesson(language, level, topic, score=0):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO lessons
        (language, level, topic, score, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            language,
            level,
            topic,
            score,
            datetime.now().isoformat()
        )
    )

    connection.commit()
    connection.close()


def save_conversation(user_message, ai_response, language):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO conversations
        (user_message, ai_response, language, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (
            user_message,
            ai_response,
            language,
            datetime.now().isoformat()
        )
    )

    connection.commit()
    connection.close()


def save_vocabulary(word, meaning, example, language):
    connection = get_connection()

    connection.execute(
        """
        INSERT INTO vocabulary
        (word, meaning, example, language, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            word,
            meaning,
            example,
            language,
            datetime.now().isoformat()
        )
    )

    connection.commit()
    connection.close()


def get_progress():
    connection = get_connection()

    lessons = connection.execute(
        "SELECT COUNT(*) AS count FROM lessons"
    ).fetchone()["count"]

    average = connection.execute(
        "SELECT AVG(score) AS average FROM lessons WHERE score > 0"
    ).fetchone()["average"]

    vocabulary = connection.execute(
        "SELECT COUNT(*) AS count FROM vocabulary"
    ).fetchone()["count"]

    connection.close()

    return {
        "total_lessons": lessons,
        "average_score": round(average or 0, 1),
        "vocabulary_count": vocabulary,
        "streak": calculate_streak()
    }


def get_history():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT id, language, level, topic, score, created_at
        FROM lessons
        ORDER BY id DESC
        LIMIT 20
        """
    ).fetchall()
    connection.close()

    return [dict(row) for row in rows]


def calculate_streak():
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT DISTINCT DATE(created_at) AS lesson_date
        FROM lessons
        ORDER BY lesson_date DESC
        """
    ).fetchall()

    connection.close()

    if not rows:
        return 0

    dates = [datetime.strptime(row["lesson_date"], "%Y-%m-%d").date()
             for row in rows]

    today = datetime.now().date()

    if dates[0] != today:
        return 0

    streak = 1

    for index in range(1, len(dates)):
        difference = (dates[index - 1] - dates[index]).days

        if difference == 1:
            streak += 1
        else:
            break

    return streak