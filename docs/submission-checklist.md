# Pre-Submission Checklist

Mirrors **Appendix E** of the project report. Work top to bottom, tick each box, and only then open the submission dropbox. Items 1–3 are the only ones that require information only you can supply.

**Due: 28 September 2026.**

---

## A. Personal details and links (do these first)

- [ ] **1. Replace the cover-page placeholders.**
  Open `docs/PROG2002_A2_Project_Report.docx` and replace `[Your full name]` and `[Your student ID]` with your real details. *Verify:* both fields show real values, and the orange highlight is gone.

- [ ] **2. Add your private GitHub repository link.**
  Replace `[Paste your private GitHub link here]` on the cover page with the repository URL. *Verify:* open the link in a logged-out/incognito window — it must **not** be publicly visible. Follow `docs/github-guide.md` to create the repo, make ten incremental commits and invite the marker as a collaborator.

- [ ] **3. Add your video share link.**
  Record using `docs/demo-video-script.md`, upload the MP4 to SCU OneDrive, share as **Anyone with the link can view**, and paste the link over `[Paste your SCU OneDrive video link here]`. *Verify:* the link plays in a private window with no sign-in prompt.

---

## B. Report formatting

- [ ] **4. Confirm the report is 12 pt Arial with 1.5 line spacing.**
  Select all text in the DOCX and check the font and paragraph settings. The document was generated with these settings; confirm they survived any edits you made. *Verify:* Font = Arial, Size = 12, Line spacing = 1.5, paragraph spacing applied consistently.

- [ ] **5. Confirm the table of contents and figures still make sense after your edits.**
  *Verify:* Section 1–11 and Appendices A–E are present, Figure 1–4 captions match the images, and no page shows a clipped table or image.

---

## C. Database

- [ ] **6. Run the database scripts on a clean MySQL instance.**
  ```bash
  mysql -u root -p < api/database/schema.sql
  mysql -u root -p < api/database/seed.sql
  ```
  *Verify:*
  ```sql
  USE charityevents_db;
  SHOW TABLES;                    -- 5 tables
  SELECT COUNT(*) FROM events;    -- 12
  SELECT COUNT(*) FROM categories;-- 8
  ```
  The database name must be exactly `charityevents_db`.

- [ ] **7. Export the SQL file for submission.**
  Confirm `api/database/schema.sql` and `api/database/seed.sql` are both present in the API archive — together they are the required SQL export. *Verify:* open the archive and confirm both files exist.

---

## D. API

- [ ] **8. Confirm the connection file is named exactly `event_db.js`.**
  *Verify:* `api/event_db.js` exists at the top level of the API folder (not inside `src/`).

- [ ] **9. Run the API unit tests.**
  ```bash
  cd api
  node tests/validation.test.js
  node tests/queryBuilder.test.js
  ```
  *Verify:* every assertion passes in both suites. (If `npm test` reports a spawn/EPERM error on a restricted machine, running the files individually as above is equivalent.)

- [ ] **10. Start the API and check every endpoint.**
  ```bash
  cd api && npm install && npm start
  ```
  Then confirm each of these returns 200 with a `data` payload:
  ```
  /api/health
  /api/events/upcoming?limit=6
  /api/events/search?scope=upcoming&sort=date_asc&page=1&limit=12
  /api/events/search?date=2026-11-07&location=Surry%20Hills&category=arts-culture&category=community
  /api/events/3
  /api/categories
  /api/locations
  /api/organisations
  ```
  *Verify also:* `/api/events/11` returns **404** (suspended event) and a malformed `date` (e.g. `2026-13-45`) returns **400**. Confirm **no** POST/PUT/DELETE route exists.

---

## E. Client-side website

- [ ] **11. Serve the client and walk through the manual test matrix MT1–MT18.**
  ```bash
  cd clientside && npx --yes serve -l 5500 .
  ```
  Open `http://localhost:5500/index.html` with the API running.

  Key checks:
  - Home page loads API events and clearly marks past vs upcoming.
  - The suspended event is never displayed.
  - Search filters by **date**, **location** and **multiple categories** (OR logic).
  - Validation errors are written into the DOM (try a past date while scope is Upcoming).
  - **Clear Filters** resets the form, the results and the URL.
  - Detail page resolves the event ID from the query string (and `localStorage` fallback).
  - Detail page shows full details, price including **Free**, and the goal-vs-progress bar.
  - **Register** shows exactly: `This feature is currently under construction.`
  - Navigation is present on all three pages, and the site is usable at a mobile width.
  - No AngularJS anywhere — plain HTML/CSS/JS with DOM manipulation.

---

## F. Packaging

- [ ] **12. Confirm neither archive contains `node_modules` or `.env`.**
  *Verify:* list the archive contents (`tar -tf` or open in Explorer) and confirm no `node_modules/` folder and no `.env` file — `.env.example` is expected and correct.

- [ ] **13. Confirm the two archive names are exactly `usernameA2-clientside.zip` and `usernameA2-api.zip`.**
  *Verify:* file names match character for character, including capitalisation and the `.zip` extension. Replace `username` with your own username only if the unit explicitly asks you to.

- [ ] **14. Confirm the archive contents are correct.**
  - `usernameA2-clientside.zip` → the **contents of the `clientside/` folder** (`index.html`, `search.html`, `event.html`, `css/`, `js/`, `assets/`), not the folder wrapped in an extra directory.
  - `usernameA2-api.zip` → the **contents of the `api/` folder** (`server.js`, `event_db.js`, `package.json`, `.env.example`, `src/`, `database/`, `tests/`).
  *Verify:* open each archive and inspect the top-level entries.

- [ ] **15. Confirm the video is under fifteen minutes and answers all three set questions.**
  *Verify:* time the recording and tick off the three question rows in Section 4 of `docs/demo-video-script.md`. **Never** omit the search validation demo or the Register dialog.

---

## G. Submission

- [ ] **16. Upload everything to the assessment dropbox before 28 September 2026.**
  The submission must contain:
  1. the project documentation (`PROG2002_A2_Project_Report.docx`),
  2. `usernameA2-clientside.zip`,
  3. `usernameA2-api.zip`,
  4. the private GitHub repository link,
  5. the video file or shareable OneDrive link.

  *Verify:* check the submission receipt, then **download each uploaded file once** and open it to confirm it is not corrupt and is the correct version.

---

## Final five-minute sanity check

| Question | Answer before you submit |
| --- | --- |
| Is the database named exactly `charityevents_db`? | |
| Is the connection file named exactly `event_db.js`? | |
| Does the API expose any write (POST/PUT/DELETE) endpoint? | Must be **No**. |
| Does the Register dialog show the exact required sentence? | Must be **Yes**, word for word. |
| Is the GitHub repo private with the marker invited? | |
| Are the two archive names exactly as specified? | |
| Is the report 12 pt Arial, 1.5 line spacing? | |
| Is the video under 15 minutes with a working share link? | |