# Demonstration Video — Full Speech Script

**PROG2002 Assessment 2 — Charity Events (Common Ground Collective)**
**Student:** Zhiming Wei — 24832847
Hard limit: **15 minutes**. Target: **13:30–14:00**, leaving a safety margin.
Read the English text out loud; the lines in `【屏幕】` are stage directions (not spoken).

---

## 0. Before you press record (10 minutes of setup)

Open everything in this order, then rehearse the click path once.

1. **MySQL** running, database loaded. Confirm: `SELECT COUNT(*) FROM events;` → 12.
2. **API** running: in `api/` run `npm start` → `Charity Events API listening on http://localhost:3000`. Leave this window open.
3. **Client** running: in a second window, project root, run `py -m http.server 5500` (or `python -m http.server 5500`). Leave it open.
4. **Browser tabs, in this order** so you can move with `Ctrl+Tab`:
   1. `http://localhost:5500/index.html`
   2. `http://localhost:5500/search.html`
   3. `http://localhost:5500/event.html?id=3`
   4. `http://localhost:3000/api/events/search?scope=upcoming&sort=date_asc&page=1&limit=12` (raw JSON)
5. **Editor tabs:** `api/database/schema.sql`, `api/src/routes/events.js`, `api/src/utils/eventSql.js`, `clientside/js/api.js`, `clientside/js/search.js`.
6. Increase browser zoom to ~125% and editor font size so text is legible on video.
7. Mute notifications, close chat apps, and close anything showing personal data or your `.env` password.
8. Record a 10-second test to check microphone level, then delete it.

---

## 1. Segment-by-segment script

### Segment 1 — Introduction (0:00 – 0:50)

`【屏幕】` Show the `charity-events-submission` folder in File Explorer, then switch to the running home page.

Say:

> "Hello, my name is Zhiming Wei, student ID 24832847. This is my PROG2002 Assessment 2 submission for the Charity Events case study. The website is called Common Ground Collective.
> 
> The solution has three parts: a MySQL database called charityevents_db, a NodeJS and ExpressJS REST API that exposes only read-only GET endpoints, and a client built in plain HTML, CSS and JavaScript with no framework.
> 
> In the next fourteen minutes I will cover the database and API design, the data flow between the API and the website, and then a live demonstration of the home page, the search page and the event detail page — including filtering and validation."

---

### Segment 2 — Architecture overview (0:50 – 2:00)

`【屏幕】` Scroll the README "What is included" table, then show the folder tree: `api/`, `clientside/`, `docs/`.

Say:

> "The project is a classic three-tier architecture. The MySQL database stores the data. The Express API reads that data and returns JSON. The browser client calls the API with fetch() and renders the results into the DOM.
> 
> The api folder holds the server, the connection module, the SQL scripts, the route handlers and the automated tests. The clientside folder holds three pages — home, search and event detail — plus shared CSS and JavaScript. There is no view engine and no templating: Express only ever returns JSON, and the browser builds every page from that JSON."

---

### Segment 3 — Database design (2:00 – 4:30)

`【屏幕】` Open `api/database/schema.sql`, then a MySQL console.

Do:

1. Scroll the five `CREATE TABLE` statements.
2. Run `USE charityevents_db; SHOW TABLES; DESCRIBE events;`
3. Point at the foreign keys, the CHECK constraints and the indexes as you speak.

Say:

> "The schema is normalised into five tables. organisations is the charity that runs an event. categories classifies it. venues holds the physical location. events is the central table, and event_highlights stores the bullet points shown on the detail page.
> 
> events has three foreign keys — to organisations, categories and venues — so an eve nt can never point at a charity, category or venue that does not exist. It also carries CHECK constraints: the end date must be after the start date, the ticket price and funds raised cannot be negative, and the goal must be greater than zero. These rules are enforced by the database itself, not only by the application, so invalid rows cannot be stored even if another program writes to the database later.
> 
> The status column is controlled vocabulary — draft, published, suspended or cancelled. That is what lets the site hide the suspended sample event.
> 
> For performance I added an index on start_datetime together with status, and indexes on category_id, organisation_id and venue_id. Those are exactly the columns the home and search queries filter and join on.
> 
> The seed file loads four organisations, eight categories, ten venues, twelve events and thirty-three highlights, including past, upcoming, free, paid and one suspended event so every rule can be demonstrated."

---

### Segment 4 — REST API design (4:30 – 6:30)

`【屏幕】` Open `api/src/routes/events.js`, then the raw JSON tab and a real request.

Do:

1. Show the four GET routes: `/upcoming`, `/search`, `/:eventId`, and the categories/locations endpoints.
2. In the browser open `http://localhost:3000/api/events/search?scope=upcoming&sort=date_asc&page=1&limit=12`.
3. Point at the JSON envelope: `{ "data": [...], "meta": {...} }`.

Say:

> "The API is deliberately small and read-only. Every route is a GET. There is no POST, PUT, PATCH or DELETE anywhere in the code, because the brief only asks the site to display data, and registration is intentionally not implemented.
> 
> The main endpoint is GET /api/events/search. It accepts a date, a location, one or more category slugs, a scope of upcoming, past or all, a sort key, and page and limit for pagination. There are also /api/events/upcoming for the home page, /api/events/:id for the detail page, and /api/categories and /api/locations to populate the search filters.
> 
> Every response uses one envelope — a data field and a meta field — so the client always knows where to look, whether the call succeeded or failed. Validation runs before the query: a bad date format returns HTTP 400, and an unpublished or suspended event returns HTTP 404. Only events with the published status are ever returned.
> 
> All SQL is parameterised. The query builder collects the filter values into an array and passes them to mysql2 execute(), so user input is never concatenated into the SQL string. That closes the door on SQL injection."

---

### Segment 5 — Data flow from click to screen (6:30 – 8:15)

`【屏幕】` Open `clientside/js/search.js`, then `clientside/js/api.js`, then `api/src/routes/events.js`, then `api/src/utils/eventSql.js`.

Say:

> "This is the data flow, end to end. On the search page, the user fills in the filters and submits the form. The search controller reads the form values and validates them in the browser first. If the date is incomplete, or it is in the past while the scope is Upcoming, the page shows a message next to the field and stops — no request is sent.
> 
> If the input is valid, the controller calls the shared API wrapper. That wrapper builds the query string and calls fetch() against the API base URL, which is the only configurable value in the client.
> 
> On the server, Express matches the route, and the validation layer checks the date, the scope, the sort key, the pagination and the category slugs — the same rules again, because you can never trust the client. The query builder then assembles a parameterised SQL statement, the service layer runs it through mysql2, and Express sends the JSON envelope back.
> 
> When the response arrives, the client checks for errors, then renders each event into the DOM using the shared card component, updates the results count, and writes the filters into the URL so the search can be bookmarked or shared. Nothing is rendered with innerHTML from the server — the browser builds the elements itself, which keeps it safe and framework-free."

---

### Segment 6 — Live demonstration (8:15 – 12:30)

`【屏幕】` All actions happen in the browser. Follow the order below.

#### 6.1 Home page (8:15 – 9:05) — tab 1

Do:

1. Show the hero banner and the live upcoming-events count.
2. Scroll through the mission section and down to the live event grid.
3. Point at the "Good intentions deserve good evidence" section that explains the progress bar.

Say:

> "This is the home page. The upcoming-events count and the event cards are loaded live from GET /api/events/upcoming — they are not hard-coded. Each card shows the category, the date, the venue and the price, and the site never shows a suspended or cancelled event. The mission section explains the local programs the events support, and further down the 'good evidence' section explains how the goal-versus-progress bar on each event page works."

#### 6.2 Search page — filtering (9:05 – 10:35) — tab 2

Do:

1. Leave the date empty, pick a location (e.g. Surry Hills), tick two categories, press Show matching events.
2. Point at the result count and the active-filter chips.
3. Change the sort order and show the results re-order.
4. Press **Clear filters**.

Say:

> "On the search page I can filter by date, by location and by multiple categories. The categories use OR logic, so an event matches if it is in any of the selected categories. The results update in place, the count updates, and the chosen filters are written into the URL so this exact search could be shared or bookmarked.
> 
> I can also change the sort — for example by date or by funds raised. And Clear filters resets the form, the results and the URL back to the start."

#### 6.3 Search page — validation (10:35 – 11:15) — tab 2 (required by the brief)

Do:

1. Keep the time range (scope) on **Upcoming**.
2. Choose a **Day, Month and Year** in the past (for example last year).
3. Press **Show matching events** and point at the inline error next to the date field:
   `Choose today or a future date, or switch the time range to past events.`
4. Switch the scope to **Past** and press Show matching events again to show the same date now passes.

Say:

> "Validation is enforced on both sides. Here the scope is Upcoming, but I choose a date in the past. The page shows an error next to the date field and does not send the request. If I switch the time range to past events, the same date is now valid and the search runs. The same rules are re-checked on the server with HTTP 400 for bad input, so the client can never bypass them."

#### 6.4 Event detail page (11:15 – 12:30) — tab 3

Do:

1. From a search result, open an event (or go to `event.html?id=3`).
2. Scroll the full record: description, schedule, venue, highlights, capacity, price and the goal-versus-progress bar.
3. Open a **free** event and point at the word Free.
4. Press **Register** and show the dialog text.
5. Navigate to `event.html?id=11` and show the not-found message.

Say:

> "Clicking an event card opens its detail page. The page reads the event ID from the query string — with a localStorage fallback — and fetches that single event, so this is a real dynamic page, not a static one.
> 
> Here is the full description, the schedule, the venue with its address, the highlights list, the capacity and the price. This bar compares the funds raised against the goal, so progress is visible at a glance. Free events show the word Free instead of a price.
> 
> Pressing Register opens this dialog with the exact message the brief requires: This feature is currently under construction. Nothing is sent to the server, because the API has no write endpoints.
> 
> Finally, event eleven is the suspended sample event. The API excludes non-published events, so the detail page correctly shows a not-found message."

---

### Segment 7 — Code quality and close (12:30 – 13:45)

`【屏幕】` Show a JSDoc comment block in the editor, then the GitHub commit history page.

Say:

> "To finish, on code quality: every file has a JSDoc header that explains its responsibility, and the non-obvious logic — like the OR grouping in the search query builder — is commented with the reasoning, not just a restatement of the code.
> 
> The automated tests cover the validation rules and the query builder: parameter binding order, the OR category grouping, the scope clauses and the pagination.
> 
> On GitHub the work is committed incrementally — scaffolding, then the schema, then the seed data, then the search endpoint, the remaining endpoints, the pages, the tests, and the documentation — and each commit message explains what changed.
> 
> To recap the three questions: the database is normalised and enforces its own integrity with keys and CHECK constraints, and the API serves it through parameterised, read-only REST endpoints with validation and pagination. The data flows from the form, through client validation, into a fetch call, through server validation and a prepared statement, and back as JSON into the DOM. And the live demo showed the home, search and detail pages, including filtering, validation, Clear filters and the Register dialog.
> 
> Thank you for watching."

---

## 2. Timing summary

| Segment                   | Window        | Length    | Covers              |
| ------------------------- | ------------- | --------- | ------------------- |
| 1. Introduction           | 0:00 – 0:50   | 0:50      | Orientation         |
| 2. Architecture overview  | 0:50 – 2:00   | 1:10      | Structure           |
| 3. Database design        | 2:00 – 4:30   | 2:30      | Q1 (database)       |
| 4. REST API design        | 4:30 – 6:30   | 2:00      | Q1 (API)            |
| 5. Data flow              | 6:30 – 8:15   | 1:45      | Q2                  |
| 6. Live demonstration     | 8:15 – 12:30  | 4:15      | Q3                  |
| 7. Code quality and close | 12:30 – 13:45 | 1:15      | Recap               |
| **Total**                 |               | **13:45** | all three questions |

### If you are running over

1. Segment 4: drop the categories/locations sentence (−20 s).
2. Segment 5: compress the server-side steps into one sentence (−30 s).
3. Segment 6.4: skip the free-event stop (−20 s).

**Never cut** the search validation demo (6.3) or the Register dialog (6.4) — both are explicitly required.

---

## 3. What you MUST show on screen (checklist)

**Database (Segment 3)**

- [ ] `schema.sql` with the five `CREATE TABLE` statements
- [ ] The foreign keys, CHECK constraints and indexes in `events`
- [ ] `SHOW TABLES;` and `DESCRIBE events;` in the MySQL console
- [ ] The seed counts: 12 events, 8 categories

**API (Segment 4)**

- [ ] `api/src/routes/events.js` showing the GET-only routes
- [ ] A live JSON response in the browser (`/api/events/search?...`)
- [ ] The `{ data, meta }` envelope
- [ ] The parameterised query in `eventSql.js`

**Data flow (Segment 5)**

- [ ] `clientside/js/search.js` (client validation + fetch)
- [ ] `clientside/js/api.js` (the fetch wrapper)
- [ ] `api/src/routes/events.js` and `eventSql.js` (server validation + SQL)

**Live demo (Segment 6)**

- [ ] Home page loading events from the API
- [ ] Search filtering by date, location and multiple categories
- [ ] Sorting and **Clear filters**
- [ ] **Validation error**: past date while scope is Upcoming  ← required
- [ ] Event detail page: description, schedule, venue, highlights, price, progress bar
- [ ] A free event showing the word "Free"
- [ ] **Register dialog**: `This feature is currently under construction.`  ← required
- [ ] The suspended event (`event.html?id=11`) returning not-found

**Closing (Segment 7)**

- [ ] A JSDoc header, and the GitHub commit history

Do **not** show: `node_modules/`, your `.env` file or password, or any personal information.

---

## 4. Upload and share the video

1. Export as **MP4**, H.264, 1080p, under 15 minutes.
2. Upload to your SCU OneDrive (`PROG2002/Assessment 2`).
3. Right-click → **Share** → **Anyone with the link can view**. Turn editing **off**.
4. Open the link in a private/incognito window to confirm it plays without signing in.
5. Paste the link over `[Paste the SCU OneDrive share link before submission]` on the report cover page, and into the submission form.

### If the marker cannot play it

- Make sure the permission is **Anyone with the link**, not "People in your organisation".
- Confirm the upload finished — a partial file shows but does not stream.
- Test from a device that is not signed in to any Microsoft account.
