# Demonstration Video Script

**PROG2002 Assessment 2 — Charity Events (Common Ground Collective)**
Maximum duration: **15 minutes**. Target: **14:30** leaving a small safety margin.

The video must answer three questions set by the brief. They are reproduced verbatim below and each one is mapped to a timed segment in Section 3.

---

## 1. The three set questions (verbatim from the brief)

> **1. Database and API architecture (ULO3: Plan & design)**
> Explain and demonstrate your backend architecture, specifically how your database schema was designed to support the 'Charity event' case study and how your RESTful API endpoints efficiently retrieve the data required for your main website pages (Home, Search, and Details).

> **2. Data flow and interaction between API and website (ULO1: Apply & ULO3: Develop)**
> Explain the data flow and process how your website interacts with the API, initially from initiating API requests until you receive the responses and display the outputs on the website.

> **3. Website functionality demo (ULO3: Complete dynamic website)**
> Walk us through the live demo for the home page, search page, and event page, specifically the search feature, where you perform data filtering and validation.

The brief also notes: *"Upload your video to your SCU OneDrive and create a sharable link to it."* Section 5 covers that step.

---

## 2. Preparation before recording

### 2.1 Environment

1. Start MySQL and confirm the database is loaded:
   ```sql
   USE charityevents_db;
   SELECT COUNT(*) FROM events;   -- expect 12
   ```
2. Start the API: `cd api && npm start` → `Charity Events API listening on http://localhost:3000`.
3. Serve the client on port 5500: `cd clientside && npx --yes serve -l 5500 .`
4. Open these tabs **in order** so you can switch with `Ctrl+Tab`:
   * `http://localhost:5500/index.html`
   * `http://localhost:5500/search.html`
   * `http://localhost:5500/event.html?id=3`
   * `api/database/schema.sql` in your editor
   * `api/src/routes/events.js` and `api/src/services/eventService.js`
   * `clientside/js/search.js` and `clientside/js/api.js`
   * The GitHub repository commit history page

5. Close notifications, chat apps and anything showing personal information.
6. Rehearse the transitions twice; the demo segments are where time is usually lost.

### 2.2 Recording settings

* Record at **1080p**, 30 fps.
* Increase the editor and browser font size so the SQL and JavaScript are legible.
* Use a headset microphone and record a short 10-second test to check levels.
* Do a single continuous take if possible; if you must edit, keep the segments in the order below so the narrative still flows.

---

## 3. Shot-by-shot plan

### Segment 1 — Introduction (0:00 – 1:00) — ~1 min

**On screen:** The `charity-events-submission` folder expanded in the file explorer, then the running home page.

**Say:**

> "This is my PROG2002 Assessment 2 submission for the Charity Events case study. The site is called Common Ground Collective. It's built as three parts: a MySQL database called `charityevents_db`, a NodeJS and ExpressJS REST API that only exposes read-only GET endpoints, and a vanilla HTML, CSS and JavaScript client — no AngularJS. In the next fifteen minutes I'll cover the database and API design, the data flow between the API and the website, and then a live demo of the home page, the search page and the event detail page."

---

### Segment 2 — Database design (1:00 – 3:30) — ~2.5 min *(Question 1, database half)*

**On screen:** `api/database/schema.sql`, then a MySQL console.

**Do:**
1. Show the five `CREATE TABLE` statements.
2. Run:
   ```sql
   USE charityevents_db;
   SHOW TABLES;
   DESCRIBE events;
   ```
3. Point at the constraint lines on screen as you describe them.

**Say:**

> "The schema is normalised into five tables. `organisations` is the charity running the events. `categories` classifies them. `venues` holds the physical location. `events` is the central table, and `event_highlights` provides the bullet points shown on the detail page.
>
> `events` has three foreign keys — to organisations, categories and venues — so an event can never reference a charity, category or venue that doesn't exist. It also carries CHECK constraints: the end date must be after the start, the ticket price and funds raised can't be negative, and the goal must be greater than zero. Those rules are enforced by the database itself, not just by the application, so invalid data cannot be stored even if another client writes to it later.
>
> The status column is an ENUM using draft, published, suspended and cancelled — that is what lets the client hide the suspended sample event.
>
> For performance I added indexes on `start_datetime` combined with `status`, and on `category_id`, `organisation_id` and `venue_id`. Those are exactly the columns the search and home queries filter and join on, so the lookups stay fast as the table grows.
>
> The seed file loads twelve events, eight categories, ten venues and four organisations, and deliberately includes free events, paid events, past events, upcoming events and one suspended event so every rule in the client can be demonstrated."

---

### Segment 3 — REST API design (3:30 – 6:00) — ~2.5 min *(Question 1, API half)*

**On screen:** `api/server.js`, `api/event_db.js`, `api/src/routes/events.js`, then a browser tab hitting the API.

**Do:** Open these in the browser (or Postman):
```
http://localhost:3000/api/health
http://localhost:3000/api/events/upcoming?limit=6
http://localhost:3000/api/events/search?location=Surry%20Hills&category=arts-culture&scope=upcoming
http://localhost:3000/api/events/3
http://localhost:3000/api/events/11
```

**Say:**

> "The API follows REST conventions. Every resource is a noun and the URLs are intuitive: `/api/events`, `/api/categories`, `/api/locations` and `/api/organisations`. Each page of the website asks for exactly what it needs — the home page calls `/api/events/upcoming`, the search page calls `/api/events/search`, and the detail page calls `/api/events` followed by an ID.
>
> There are no POST, PUT or DELETE routes anywhere, because this assessment only requires read access.
>
> `event_db.js` is the single database connection file. It creates a mysql2 connection pool and exports the promise interface, so every route awaits a query without callback nesting.
>
> Every query uses prepared statements with bound parameters — here in `eventService.js` the filters are pushed into a `params` array and the SQL only contains question marks. That's what makes the search endpoint safe against SQL injection: user input is never concatenated into SQL text.
>
> Validation happens before the query runs. Look at this call: the search endpoint rejects a malformed date with a 400 and a clear message. If I request the suspended event, number 11, the API returns a 404 rather than leaking an unpublished record.
>
> Responses use a consistent envelope — a `data` array plus a `meta` block carrying pagination and the applied filters — so the client has one predictable shape to render."

**Timing tip:** if you are running long, cut the `/api/categories` and `/api/locations` calls; they are visible again in the demo segment.

---

### Segment 4 — Data flow (6:00 – 8:00) — ~2 min *(Question 2)*

**On screen:** `clientside/js/api.js`, then `clientside/js/search.js`, then `api/src/services/eventService.js`.

**Say:**

> "Here is the full round trip for one search.
>
> First, the user submits the search form. The submit handler in `search.js` calls `preventDefault` so the page doesn't reload, then reads the form values — the date, the location, the checked category boxes and the sort order.
>
> Second, it validates locally. If the date is in the past while the scope is upcoming, it writes an error message into the DOM and stops — no request is sent at all.
>
> Third, `Api.searchEvents()` in `api.js` builds the query string with `URLSearchParams` and calls `fetch` against the API base URL from `config.js`.
>
> Fourth, on the server, Express routes the request to the search route, the validation module coerces and checks each parameter, and the query builder assembles the parameterised SELECT — appending one `category.slug = ?` clause per selected category, joined with OR.
>
> Fifth, mysql2 executes the statement against the pool and MySQL returns the rows.
>
> Sixth, the service maps the raw columns into camelCase objects and returns the JSON envelope.
>
> Seventh, back in the browser, the promise resolves, `api.js` unwraps the envelope, and `search.js` renders the result cards with the DOM. If nothing matched, it shows the empty state instead. Every error path — a timeout, a 400 from the API, a network failure — is caught and shown to the user as a readable message via the DOM, never as a raw exception."

---

### Segment 5 — Live demonstration (8:00 – 11:30) — ~3.5 min *(Question 3)*

**On screen:** the three client pages.

**Do and say, in this order:**

1. **Home page.**
   > "The home page shows the static organisation information — the mission, the impact figures and how it works — alongside a dynamic grid of upcoming events loaded from the API. Notice each card shows the date, the suburb, the category and the price, and the events are ordered by start date."
   *Point at a past event badge:* "Past events are clearly labelled rather than hidden, and the suspended event never appears at all."

2. **Search page — date filter.**
   > "On the search page I have three criteria: a date, a location, and a multi-select list of categories."
   *Choose a future day, month and year, then submit.* "Filtering by date returns only events starting that day."

3. **Search page — validation.**
   *Switch the scope back to Upcoming, choose a day, month and year in the past, then submit.*
   > "Because I'm searching upcoming events, a past date is rejected. The message is written into the DOM next to the field, the field is marked `aria-invalid`, and no request is sent — this is client-side validation, not just a server error."

4. **Search page — location.**
   *Choose a suburb.* "Filtering by location maps to the venue suburb."

5. **Search page — multiple categories (OR logic).**
   *Tick two categories and submit.*
   > "Ticking two categories returns events in either category — an OR, not an AND. That's the required multi-select behaviour, and it's visible in the URL as repeated `category` parameters, which means the search is bookmarkable and shareable."

6. **Sorting and Clear Filters.**
   *Change the sort to price ascending.* "Sorting re-runs the search without losing the other filters."
   *Press Clear Filters.* "Clear Filters resets the form, clears the URL and reloads the unfiltered list."

7. **Event detail page.**
   *Click a paid event.*
   > "Clicking a card passes the event ID through the query string to the detail page, which fetches that single event."
   *Scroll through.* "Here's the full description, the schedule, the venue with its address, the highlights list, the capacity, and the price."
   *Point at the progress bar.* "This bar compares the funds raised against the goal, so you can see progress at a glance."

8. **Free event.**
   *Open a free event.* "Free events show the word Free instead of a price."

9. **Register button.**
   *Click Register.* "Pressing Register opens the modal with the exact message the brief requires: *This feature is currently under construction.* Nothing is sent to the server, because the API has no write endpoints."

10. **Suspended event.**
    *Navigate to `event.html?id=11`.* "And the suspended event correctly returns a not-found message."

---

### Segment 6 — Code quality and close (11:30 – 14:30) — ~3 min

**On screen:** a JSDoc comment block, then the GitHub commit history.

**Say:**

> "To finish, on the code quality side every file carries a JSDoc header explaining its responsibility, and non-obvious logic — like the OR grouping in the query builder — is commented inline with the reasoning, not just a restatement of the code.
>
> On GitHub the work is committed incrementally: scaffolding, then the schema, then the seed data, then the search endpoint, the remaining endpoints, the layout and home page, the search page, the detail page, the tests, and finally the documentation. Each commit message explains what changed.
>
> To recap the three questions: the database is normalised and enforces its own integrity rules with keys and CHECK constraints, and the API serves those tables through parameterised, read-only REST endpoints with validation and pagination. The data flows from a form submit, through client validation, into a fetch call, through server validation and a prepared statement, back as JSON, and finally into DOM rendering. And the live demo showed the home, search and detail pages, including filtering by date, location and multiple categories, validation, the Clear Filters control and the Register dialog.
>
> The repository is private with my marker invited as a collaborator, and the share link for this video is on the report cover page. Thank you for watching."

---

## 4. Timing summary

| Segment | Window | Length | Covers |
| --- | --- | --- | --- |
| 1. Introduction | 0:00 – 1:00 | 1:00 | Orientation |
| 2. Database design | 1:00 – 3:30 | 2:30 | Q1 (database) |
| 3. REST API design | 3:30 – 6:00 | 2:30 | Q1 (API) |
| 4. Data flow | 6:00 – 8:00 | 2:00 | Q2 |
| 5. Live demonstration | 8:00 – 11:30 | 3:30 | Q3 |
| 6. Code quality and close | 11:30 – 14:30 | 3:00 | Q1–Q3 recap |
| **Total** | | **14:30** | all three questions |

### Cut points if you overrun

1. Segment 3: drop the `/api/categories` and `/api/locations` calls (−30 s).
2. Segment 5: drop the free-event stop and the price sort (−40 s).
3. Segment 4: compress step seven into one sentence (−30 s).

**Never cut** the validation demonstration in Segment 5 or the Register dialog — both are explicitly named in the brief.

---

## 5. Upload to SCU OneDrive and create the share link

1. Export or record the final file as **MP4** (H.264, 1080p). Keep it under 15 minutes.
2. Open <https://onedrive.live.com> and sign in with your **SCU account**.
3. Upload the MP4 to your OneDrive (a folder such as `PROG2002/Assessment 2` keeps it tidy).
4. Right-click the file and choose **Share**.
5. Set the permission to **Anyone with the link can view** — the marker is not signed in as you, so "People in your organisation" is not enough if the marker uses an external account.
6. Leave **Allow editing** switched off.
7. Copy the link and open it in a private/incognito window to confirm it plays without prompting for a sign-in.
8. Paste the link into:
   * the submission form, and
   * the **video link** placeholder on the cover page of `docs/PROG2002_A2_Report_Template.docx`.

### If the video will not play for the marker

* Confirm the share permission is **Anyone with the link**, not **People in your organisation**.
* Confirm the file finished uploading — a partially uploaded file shows but does not stream.
* Test on a device that is not signed in to any Microsoft account.
* Keep the MP4 under OneDrive's per-file streaming limit; if it is very large, record at a lower bitrate rather than splitting the video, because the brief requires a single file/link.

---

## 6. Final checks before you record

- [ ] MySQL running and `charityevents_db` seeded (12 events).
- [ ] API running on port 3000 with no console errors.
- [ ] Client served on port 5500 and all three pages load.
- [ ] Editor and browser font sizes increased.
- [ ] Notifications muted and no personal information visible.
- [ ] Script rehearsed; the suspended event (`id=11`) and the past-date validation both ready to demonstrate.
- [ ] Timer visible so you can track the 15-minute limit.