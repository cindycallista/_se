import unittest

from core import TicketStore, normalize_ticket, sort_tickets


SAMPLE = {
    "reporter": "Yang Li Si",
    "area": "Kitchen",
    "priority": "normal",
    "summary": "Ceiling lamp is flickering",
}


class TicketRulesTest(unittest.TestCase):
    def test_normalization_removes_extra_space(self):
        ticket = normalize_ticket({**SAMPLE, "reporter": "  Yang Li Si  "})
        self.assertEqual(ticket["reporter"], "Yang Li Si")

    def test_short_summary_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "5–120"):
            normalize_ticket({**SAMPLE, "summary": "Leak"})

    def test_urgent_open_ticket_is_sorted_first(self):
        items = [
            {"id": 1, "priority": "low", "resolved": False},
            {"id": 2, "priority": "urgent", "resolved": False},
            {"id": 3, "priority": "normal", "resolved": True},
        ]
        self.assertEqual([item["id"] for item in sort_tickets(items)], [2, 1, 3])

    def test_store_resolves_existing_ticket(self):
        store = TicketStore(clock=lambda: "2026-10-23T00:00:00+00:00")
        created = store.create(SAMPLE)
        resolved = store.resolve(created["id"])
        self.assertTrue(resolved["resolved"])


if __name__ == "__main__":
    unittest.main()
