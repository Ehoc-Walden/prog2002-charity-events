# PROG2002 Assessment 2 — Charity Events Platform

**Common Ground Collective** — a dynamic charity-events website built with a NodeJS/ExpressJS REST API over a MySQL database, plus a vanilla HTML/CSS/JavaScript client.

This repository contains the complete submission for Assessment 2: the database scripts, the REST API, the client-side website, the automated tests and the supporting documentation.

> **Latest compliance rule:** no CSS or JavaScript framework is used. The client is written in plain HTML, CSS and JavaScript, and manipulates the page through the DOM APIs exactly as the brief requires. Express is used only for the server-side JSON API; there is no view engine, no `res.render()` and no EJS, Pug or Handlebars templating.

---

## 1. What is included

| Folder | Purpose |
| --- | --- |
| `api/` | NodeJS + ExpressJS REST API, MySQL connection file, SQL schema and seed data, automated tests. |
| `clientside/` | The three-page website (Home, Search, Event detail) — static HTML, CSS and vanilla JavaScript. |
| `docs/` | Authoritative report `PROG2002_A2_Report_Template.docx`, framework-compliance audit, this guide set, the video script and the submission checklist. |
| `scripts/` | Helper script that generates the SVG cover art used by the client. |

The two archives required by the brief are produced from this folder:

* `usernameA2-clientside.zip` — the contents of `clientside/` only.
* `usernameA2-api.zip` — the contents of `api/` only.

---

## 2. Prerequisites

* **Node.js 18.18 or newer** (developed and tested on Node 20/24).
* **MySQL 8.0 or newer** (the schema uses `utf8mb4_0900_ai_ci` and `CHECK` constraints, both MySQL 8 features).
* A modern browser (Chrome, Edge, Firefox or Safari).
* A simple static web server for the client. The client must **not** be opened from `file://`, because browser CORS rules block `fetch()` from local files.

---

## 3. Setup

### 3.1 Create the database

From the project root:

```powershell
$root = (Get-Location).Path
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
& $mysql -u root -p -e "SOURCE $($root -replace '\\','/')/api/database/schema.sql;"
& $mysql -u root -p -e "SOURCE $($root -replace '\\','/')/api/database/seed.sql;"
```

> PowerShell does not accept `<` as input redirection. `SOURCE` is the equivalent command and works on Windows. If MySQL is installed elsewhere, change the `$mysql` path.

* `schema.sql` drops and recreates the `charityevents_db` database, then creates the five tables (`organisations`, `categories`, `venues`, `events`, `event_highlights`) with primary keys, foreign keys, `CHECK` constraints and indexes. It also creates the read-only `charity_app` MySQL account that the API logs in with, so no manual MySQL user setup is required.
* `seed.sql` loads the sample data: **4 organisations, 8 categories, 10 venues, 12 events and 33 event highlights**. The data deliberately includes *past*, *upcoming*, *free*, *paid* and one *suspended* event so every client-side rule can be demonstrated.

Verify the load:

```sql
USE charityevents_db;
SELECT COUNT(*) FROM events;      -- 12
SELECT COUNT(*) FROM categories;  -- 8
```

### 3.2 Configure the API

No manual configuration is needed. The API creates `api/.env` from `api/.env.example` automatically the first time it starts, using these defaults:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=charity_app
DB_PASSWORD=change_me
DB_NAME=charityevents_db
PORT=3000
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

**About `DB_USER`.** The API logs in as `charity_app`, a least-privilege, read-only account that `schema.sql` creates when it is run as an administrator. Nothing has to be created by hand, and because the API only ever issues `SELECT` statements a read-only grant is sufficient.

If your MySQL login is not allowed to manage users, only the account block at the end of `schema.sql` reports an error. In that case edit `api/.env` (already created on first run) and use your own login instead:

```ini
DB_USER=root
DB_PASSWORD=your_mysql_password
```

To use a different port or a different database login, edit `api/.env` and restart the API.

### 3.3 Install and start the API

```bash
cd api
npm install
npm start
```

Expected output:

```
Charity Events API listening on http://localhost:3000
```

The server verifies the database connection with `SELECT 1` before it starts listening, so any credential problem is reported immediately rather than at the first request.

### 3.4 Serve the client

In a second terminal, serve the `clientside` folder on **port 5500** (this matches the default CORS allow-list):

```bash
cd clientside
py -m http.server 5500                # Windows
# or: python -m http.server 5500      # macOS/Linux, or Windows with Python on PATH
# or: npx --yes serve -l 5500 .       # alternative if Node.js is available
```

Then open <http://localhost:5500/index.html>.

Any port works as long as it is added to `CORS_ORIGINS` in `api/.env` and the API is restarted.

---

## 4. REST API reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness probe; confirms the service is running. |
| `GET` | `/api/events/upcoming?limit=6` | Upcoming published events for the home page (`limit` 1–20, default 6). |
| `GET` | `/api/events/search` | Filtered event search — see the parameters below. |
| `GET` | `/api/events/:eventId` | Full detail for one event (404 when the event is missing or not published). |
| `GET` | `/api/categories` | Active categories, used to build the multi-select filter. |
| `GET` | `/api/locations` | Distinct suburbs that actually have a published event. |
| `GET` | `/api/organisations` | Active organisations (static content for the home page). |
| `GET` | `/api/organisations/:organisationId` | A single organisation. |

### `/api/events/search` parameters

| Parameter | Type | Notes |
| --- | --- | --- |
| `date` | `YYYY-MM-DD` | Only events starting on that calendar day. |
| `location` | string | Suburb name; matched to the venue. |
| `category` | string, repeatable | Category **slug**; repeat the parameter for multiple categories, which are combined with **OR**. |
| `scope` | `upcoming` \| `past` \| `all` | Defaults to `upcoming` (today or later). |
| `sort` | `date_asc` \| `date_desc` \| `raised_desc` \| `goal_desc` | Defaults to `date_asc`. |
| `page` | integer ≥ 1 | Defaults to 1. |
| `limit` | integer 1–50 | Defaults to 12. |

Example:

```
/api/events/search?date=2026-11-07&location=Surry%20Hills&category=arts-culture&category=community&scope=upcoming&sort=raised_desc&page=1&limit=12
```

### Response shape

Every successful response uses a consistent envelope:

```json
{
  "data": [ /* objects */ ],
  "meta": { "count": 2, "pagination": { "page": 1, "limit": 12, "total": 2, "totalPages": 1 } }
}
```

Errors are uniform and never leak internals:

```json
{ "error": { "status": 400, "message": "The \"date\" parameter must use the YYYY-MM-DD format." } }
```

### Security and efficiency notes

* **SQL injection is prevented** by exclusively using `mysql2` prepared statements with bound parameters — user input is never concatenated into SQL text.
* **Only `GET` routes exist.** There is no `POST`, `PUT`, `DELETE` or `PATCH` endpoint anywhere in the API, matching the brief.
* `helmet` sets safe HTTP response headers and `x-powered-by` is disabled.
* **CORS is an explicit allow-list** (`CORS_ORIGINS`), not a wildcard.
* Every input is validated and coerced (`limit` clamped to 1–20/1–50, dates parsed as calendar dates, unknown sort keys rejected).
* JSON request bodies are capped at 20 KB and responses carry a short `Cache-Control` header.
* Queries are covered by indexes on `start_datetime, status`, `category_id`, `organisation_id` and `venue_id`; the search route is paginated so the payload stays small.
* Database errors are translated into generic 500 responses — stack traces and SQL text are never returned to the client.

---

## 5. Client-side pages

| Page | File | What it does |
| --- | --- | --- |
| Home | `clientside/index.html` | Static organisation information (mission, impact figures, how-it-works) plus a dynamic upcoming-events grid fetched from `/api/events/upcoming`. Past events are labelled and events with a non-published status are hidden. |
| Search | `clientside/search.html` | Date, location and multi-select category filters (OR logic across selected categories), plus a scope selector (upcoming/past/all) and a sort control. Results are rendered with the DOM, validation messages are written with the DOM, and **Clear Filters** resets the form and the URL. |
| Event detail | `clientside/event.html` | Reads the event ID from the query string (with `localStorage` as a fallback) and displays the full record: description, schedule, venue, highlights, capacity, price (including "Free"), and a goal-versus-progress bar. |

Shared behaviour lives in `clientside/js/`:

| File | Responsibility |
| --- | --- |
| `config.js` | The single configurable value — the API base URL. |
| `utils.js` | DOM helpers, HTML escaping, currency/date formatting, category icons. |
| `api.js` | Thin `fetch()` wrapper that unwraps the response envelope and raises readable errors. |
| `layout.js` | Navigation, mobile menu and shared chrome used on all three pages. |
| `home.js`, `search.js`, `event.js` | One controller per page. |

The **Register** button on the event page opens an accessible modal containing exactly:

> This feature is currently under construction.

Nothing is sent to the server when it is pressed — the API has no write endpoints.

### Accessibility

Skip links, landmark elements, visible focus styles, `aria-current` on the active nav item, `aria-invalid` plus `aria-describedby` on invalid fields, `role`/`aria-modal` on the dialog with focus trapping and Escape-to-close, and `alt` text or `aria-hidden` on all imagery.

---

## 6. Automated tests

```bash
cd api
npm test                                   # runs both suites via node --test
# or run them individually:
node tests/validation.test.js
node tests/queryBuilder.test.js
```

| Suite | Covers |
| --- | --- |
| `tests/validation.test.js` | Date, scope, sort, pagination and category-slug validation, including the rejection cases. |
| `tests/queryBuilder.test.js` | Parameter binding order, OR-category grouping, scope/date clauses and the generated pagination clause. |

The API and client were also verified with two harnesses during development (15/15 endpoint checks and 12/12 client-render checks). Those results, the 18-row manual test matrix (MT1–MT18) and the five defects found and fixed (D1–D5) are documented in the project report.

> **Note:** if `npm test` reports an `EPERM`/spawn error on a locked-down machine, run the two test files individually with `node tests/<file>.test.js` as shown above.

---

## 7. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `Unable to connect to MySQL. Check the values in .env.` | Wrong `DB_*` values, MySQL not running, or the database has not been created. Re-run §3.1–3.2. |
| `DB_NAME is not set` warning | `api/.env` is missing. Start the API with `npm start` so it copies `.env.example` to `.env` automatically, or copy the file by hand inside `api/`. |
| Browser console shows a CORS error | The client is served from a port that is not in `CORS_ORIGINS`. Add the origin and restart the API. |
| `fetch` fails when opening `index.html` directly | The client was opened from `file://`. Serve it over HTTP (§3.4). |
| Event list is empty on the home page | The seed data was not loaded, or all seeded events are in the past. Re-run `seed.sql`. |
| Event 11 shows a 404 on the detail page | Expected — it is the suspended sample event, and the API deliberately excludes non-published events. |
| `404` for `search.html`/`index.html`, or `FileNotFoundError` in the Python log | The static server was started from the project root. Stop it, `cd clientside`, then run `py -m http.server 5500` again (§3.4). From the root you can also use `py -m http.server 5500 --directory clientside`. |
| `EADDRINUSE: address already in use :::3000` | The API is already running in another terminal. Reuse that window, or stop it with Ctrl+C before starting a second copy. |
| `favicon.ico 404` or `ConnectionAbortedError: [WinError 10053]` in the Python log | Harmless noise: the browser requests an icon that does not exist and closes some connections early. It does not affect the site. |
| `npm test` fails with a spawn error | Run each test file with `node tests/xxx.test.js`; see §6. |

---

## 8. Before you submit (one link to add)

The authoritative report is `docs/PROG2002_A2_Report_Template.docx`. Its cover page already contains the student details and the GitHub repository link. The only remaining placeholder is the **video share link**:

1. Record using `docs/demo-video-script.md`, keeping the video under fifteen minutes and demonstrating the search validation and Register dialog.
2. Upload the MP4 to SCU OneDrive and share it as **Anyone with the link can view**.
3. Paste the link over `[Paste the SCU OneDrive share link before submission]` in the report cover, then re-open the report and verify it.

Also confirm the GitHub repository is private and that the marker has been invited as a collaborator if the unit requires that step. Work through `docs/submission-checklist.md` before uploading.

The project has been audited against the latest rule: **no CSS or JavaScript framework, Express server-side only, and no Express view engine or templating**. See `docs/framework-compliance-audit.md` and Appendix D of the report. The previous report filename was removed from the working tree so that only the new-template version can be submitted.

---

## 9. Credits

* Case study: PROG2002 Assessment 2 — Charity Events (Southern Cross University).
* Organisation, venue, event and category content is fictional sample data created for this assessment.
* Cover artwork is generated locally by `scripts/generate_assets.py`; no third-party images are used.
