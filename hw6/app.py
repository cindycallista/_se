import os

import psycopg2
from flask import Flask, jsonify, request
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
database_url = os.environ.get(
    "DATABASE_URL",
    "postgresql://stackuser:stackpass@localhost:5432/stackboard",
)


def connect():
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)


@app.get("/api/health")
def health():
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 AS ready")
            cursor.fetchone()
    return jsonify({"status": "ok", "database": "connected"})


@app.get("/api/tasks")
def list_tasks():
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, title, category, done, created_at "
                "FROM tasks ORDER BY id DESC"
            )
            rows = cursor.fetchall()
    return jsonify(rows)


@app.post("/api/tasks")
def create_task():
    payload = request.get_json(silent=True) or {}
    title = str(payload.get("title", "")).strip()
    category = str(payload.get("category", "General")).strip() or "General"
    if not title or len(title) > 100:
        return jsonify({"error": "Title must contain 1 to 100 characters."}), 400
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO tasks (title, category) VALUES (%s, %s) "
                "RETURNING id, title, category, done, created_at",
                (title, category[:30]),
            )
            row = cursor.fetchone()
    return jsonify(row), 201


@app.patch("/api/tasks/<int:task_id>")
def update_task(task_id):
    payload = request.get_json(silent=True) or {}
    if "done" not in payload:
        return jsonify({"error": "The done field is required."}), 400
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE tasks SET done = %s WHERE id = %s "
                "RETURNING id, title, category, done, created_at",
                (bool(payload["done"]), task_id),
            )
            row = cursor.fetchone()
    if row is None:
        return jsonify({"error": "Task not found."}), 404
    return jsonify(row)


@app.delete("/api/tasks/<int:task_id>")
def delete_task(task_id):
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM tasks WHERE id = %s RETURNING id", (task_id,))
            row = cursor.fetchone()
    if row is None:
        return jsonify({"error": "Task not found."}), 404
    return "", 204


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
