import json
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from wsgiref.simple_server import make_server

from core import TicketStore
from server import create_app


SAMPLE = {
    "reporter": "Yang Li Si",
    "area": "Bathroom",
    "priority": "urgent",
    "summary": "Water is leaking below the sink",
}


class TicketApiTest(unittest.TestCase):
    def setUp(self):
        self.server = make_server("127.0.0.1", 0, create_app(TicketStore()))
        self.base = f"http://127.0.0.1:{self.server.server_port}"
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def request(self, path, method="GET", payload=None):
        data = json.dumps(payload).encode() if payload is not None else None
        request = Request(self.base + path, data=data, method=method, headers={"Content-Type": "application/json"})
        with urlopen(request) as response:
            return response.status, json.loads(response.read() or b"{}")

    def test_health_endpoint(self):
        status, body = self.request("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(body, {"status": "ok"})

    def test_create_list_and_resolve_ticket(self):
        status, created = self.request("/api/tickets", "POST", SAMPLE)
        self.assertEqual(status, 201)
        _, listed = self.request("/api/tickets")
        self.assertEqual(listed[0]["summary"], SAMPLE["summary"])
        _, resolved = self.request(f"/api/tickets/{created['id']}/resolve", "PATCH")
        self.assertTrue(resolved["resolved"])

    def test_invalid_ticket_returns_400(self):
        with self.assertRaises(HTTPError) as error:
            self.request("/api/tickets", "POST", {**SAMPLE, "area": "Roof"})
        self.assertEqual(error.exception.code, 400)


if __name__ == "__main__":
    unittest.main()
