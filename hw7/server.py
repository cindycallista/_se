import json
import mimetypes
import os
from pathlib import Path
from urllib.parse import unquote
from wsgiref.simple_server import make_server

from core import TicketStore

ROOT = Path(__file__).resolve().parent


def json_response(start_response, status, payload):
    body = json.dumps(payload).encode("utf-8")
    start_response(status, [("Content-Type", "application/json; charset=utf-8"), ("Content-Length", str(len(body)))])
    return [body]


def read_json(environ):
    length = int(environ.get("CONTENT_LENGTH") or 0)
    if length > 100_000:
        raise ValueError("Request is too large.")
    return json.loads(environ["wsgi.input"].read(length) or b"{}")


def create_app(store=None):
    tickets = store or TicketStore()

    def app(environ, start_response):
        method = environ["REQUEST_METHOD"]
        path = unquote(environ.get("PATH_INFO", "/"))

        if method == "GET" and path == "/api/health":
            return json_response(start_response, "200 OK", {"status": "ok"})
        if method == "GET" and path == "/api/tickets":
            return json_response(start_response, "200 OK", tickets.list())
        if method == "POST" and path == "/api/tickets":
            try:
                return json_response(start_response, "201 Created", tickets.create(read_json(environ)))
            except (ValueError, json.JSONDecodeError) as error:
                return json_response(start_response, "400 Bad Request", {"error": str(error)})

        parts = path.strip("/").split("/")
        if method == "PATCH" and len(parts) == 4 and parts[:2] == ["api", "tickets"] and parts[3] == "resolve":
            ticket = tickets.resolve(parts[2])
            return json_response(start_response, "200 OK" if ticket else "404 Not Found", ticket or {"error": "Ticket not found."})
        if path.startswith("/api/"):
            return json_response(start_response, "404 Not Found", {"error": "Route not found."})

        relative = "index.html" if path == "/" else path.lstrip("/")
        file_path = (ROOT / relative).resolve()
        if ROOT not in file_path.parents or not file_path.is_file():
            body = b"Not found"
            start_response("404 Not Found", [("Content-Type", "text/plain"), ("Content-Length", str(len(body)))])
            return [body]
        body = file_path.read_bytes()
        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        start_response("200 OK", [("Content-Type", f"{content_type}; charset=utf-8"), ("Content-Length", str(len(body)))])
        return [body]

    return app


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "4183"))
    print(f"FixTrack is running at http://127.0.0.1:{port}")
    make_server("127.0.0.1", port, create_app()).serve_forever()
