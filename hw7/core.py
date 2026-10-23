from datetime import datetime, timezone

AREAS = {"Kitchen", "Bathroom", "Hallway", "Bedroom", "Utility"}
PRIORITIES = {"low": 2, "normal": 1, "urgent": 0}


def normalize_ticket(data):
    ticket = {
        "reporter": str(data.get("reporter", "")).strip(),
        "area": str(data.get("area", "")).strip(),
        "priority": str(data.get("priority", "")).strip().lower(),
        "summary": str(data.get("summary", "")).strip(),
    }

    if not 2 <= len(ticket["reporter"]) <= 60:
        raise ValueError("Reporter name must contain 2–60 characters.")
    if ticket["area"] not in AREAS:
        raise ValueError("Choose a valid area.")
    if ticket["priority"] not in PRIORITIES:
        raise ValueError("Choose a valid priority.")
    if not 5 <= len(ticket["summary"]) <= 120:
        raise ValueError("Issue summary must contain 5–120 characters.")
    return ticket


def sort_tickets(tickets):
    return sorted(
        tickets,
        key=lambda item: (
            item["resolved"],
            PRIORITIES[item["priority"]],
            item["id"],
        ),
    )


class TicketStore:
    def __init__(self, initial=None, clock=None):
        self._clock = clock or (lambda: datetime.now(timezone.utc).isoformat())
        self._items = []
        self._next_id = 1
        for item in initial or []:
            self.create(item)

    def list(self):
        return [dict(item) for item in sort_tickets(self._items)]

    def create(self, data):
        ticket = normalize_ticket(data)
        saved = {
            **ticket,
            "id": self._next_id,
            "resolved": False,
            "created_at": self._clock(),
        }
        self._next_id += 1
        self._items.append(saved)
        return dict(saved)

    def resolve(self, ticket_id):
        for ticket in self._items:
            if ticket["id"] == int(ticket_id):
                ticket["resolved"] = True
                return dict(ticket)
        return None
