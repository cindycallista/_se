# HW7 — FixTrack Test Stack

Student: 楊莉思 (111210555)

Live application: https://cindycallista.github.io/_se/hw7/

FixTrack is a dormitory repair-request queue. Its backend uses only Python’s standard library, and the GitHub Pages version keeps sample requests in browser storage.

## Test matrix

| Scope | Tool | Evidence |
| --- | --- | --- |
| Server rules | Python `unittest` | `tests/unit/test_core.py` |
| Web API | WSGI server + `urllib` | `tests/system/test_api.py` |
| Browser flow | Playwright Chromium | `tests/e2e/report.spec.mjs` |

## Run

```bash
npm install
npx playwright install chromium
npm run test:all
```

The system test starts the API on a temporary port. Playwright starts `server.py` on port 4183 and runs without a visible browser window.
