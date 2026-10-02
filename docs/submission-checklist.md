# Pre-Submission Checklist

Mirrors **Appendix E** of the project report. Work top to bottom, tick each box, and only then open the submission dropbox.

**Original unit due date: 28 September 2026.** Confirm any extension or revised deadline in Blackboard before uploading.

---

## A. Personal details and links (do these first)

- [ ] **1. Verify the cover details and add the video link.**
  Open `docs/PROG2002_A2_Report_Template.docx` and confirm Student ID 24832847, Last Name Wei and First Name Zhiming are correct. Replace `[Paste the SCU OneDrive share link before submission]` with the final video link. *Verify:* no placeholder remains and the link plays in a private window.

- [ ] **2. Confirm the private GitHub repository and marker access.**
  The cover already contains `https://github.com/Ehoc-Walden/prog2002-charity-events`. *Verify:* the repository is private, the marker is invited as a collaborator if required, and the link opens for an authorised reviewer.

---

## B. Report formatting

- [ ] **3. Confirm the report is 12 pt Arial with 1.5 line spacing.**
  Select all body text in the DOCX and check the font and paragraph settings. The document was generated with these settings; confirm they survived any edits you made. *Verify:* Font = Arial, Size = 12, Line spacing = 1.5, paragraph spacing applied consistently. Table text, captions and code listings may use a smaller size for readability.

- [ ] **4. Confirm the new unit template structure and figures survived your edits.**
  *Verify:* Sections 1-7 and Appendices A-E are present, Figure 1-4 captions match the images, Appendix D records the latest framework audit, and no page shows a clipped table or image.

---

## C. Database

- [ ] **5. Run the database scripts on a clean MySQL instance.**
  Run from the project root in PowerShell:
  ```powershell
  $root = (Get-Location).Path
  $mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
  & $mysql -u root -p -e "SOURCE $($root -replace '\\','/')/api/database/schema.sql;"
  & $mysql -u root -p -e "SOURCE $($root -replace '\\','/')/api/database/seed.sql;"
  ```
  *Verify:*
  ```sql
  USE charityevents_db;
  SHOW TABLES;                    -- 5 tables
  SELECT COUNT(*) FROM events;    -- 12
  SELECT COUNT(*) FROM categories;-- 8
  ```
  The database name must be exactly `charityevents_db`.

- [ ] **6. Export the SQL file for submission.**
  Confirm `api/database/schema.sql` and `api/database/seed.sql` are both present in the API archive. Together they are the required SQL export. *Verify:* open the archive and confirm both files exist.

---

## D. API

- [ ] **7. Confirm the connection file is named exactly `event_db.js`.**
  *Verify:* `api/event_db.js` exists at the top level of the API folder, not inside `src/`.

- [ ] **8. Run the API unit tests.**
  Run from `api/`:
  ```powershell
  node tests/validation.test.js
  node tests/queryBuilder.test.js
  ```
  *Verify:* every assertion passes in both suites. If `npm test` reports a spawn/EPERM error on a restricted machine, running the two files individually as above is equivalent.

- [ ] **9. Start the API and check every endpoint.**
  Run from `api/`:
  ```powershell
  npm install
  npm start
  ```
  Then confirm each of these returns 200 with a `data` payload:
  ```text
  /api/health
  /api/events/upcoming?limit=6
  /api/events/search?scope=upcoming&sort=date_asc&page=1&limit=12
  /api/events/search?date=2026-11-07&location=Surry%20Hills&category=arts-culture&category=community
  /api/events/3
  /api/categories
  /api/locations
  /api/organisations
  ```
  *Verify also:* `/api/events/11` returns **404** (suspended event) and a malformed `date` such as `2026-13-45` returns **400**. Confirm **no** application POST, PUT, PATCH or DELETE route exists.

---

## E. Client-side website

- [ ] **10. Serve the client and walk through the manual test matrix MT1-MT18.**
  Run from `clientside/`:
  ```powershell
  python -m http.server 5500
  ```
  Open `http://localhost:5500/index.html` with the API running.

  Key checks:
  - Home page loads API events and clearly marks past vs upcoming.
  - The suspended event is never displayed.
  - Search filters by **date**, **location** and **multiple categories** using OR logic.
  - Validation errors are written into the DOM; try a past date while scope is Upcoming.
  - **Clear Filters** resets the form, the results and the URL.
  - Detail page resolves the event ID from the query string and the `localStorage` fallback.
  - Detail page shows full details, price including **Free**, and the goal-vs-progress bar.
  - **Register** shows exactly: `This feature is currently under construction.`
  - Navigation is present on all three pages, and the site is usable at a mobile width.
  - No CSS framework, no client JavaScript framework and no Express templating: the latest restriction is checked in Appendix D and `docs/framework-compliance-audit.md`.

---

## F. Packaging

- [ ] **11. Confirm neither archive contains `node_modules` or `.env`.**
  *Verify:* list the archive contents with `tar -tf` or open them in Explorer and confirm no `node_modules/` folder and no `.env` file. `.env.example` is expected and correct.

- [ ] **12. Confirm the two archive names are exactly `usernameA2-clientside.zip` and `usernameA2-api.zip`.**
  *Verify:* file names match character for character, including capitalisation and the `.zip` extension. Replace `username` with your own username only if the unit explicitly asks you to.

- [ ] **13. Confirm the archive contents are correct.**
  - `usernameA2-clientside.zip` contains the contents of `clientside/`: `index.html`, `search.html`, `event.html`, `css/`, `js/` and `assets/`, not the folder wrapped in an extra directory.
  - `usernameA2-api.zip` contains the contents of `api/`: `server.js`, `event_db.js`, `package.json`, `.env.example`, `src/`, `database/` and `tests/`.
  *Verify:* open each archive and inspect the top-level entries.

- [ ] **14. Confirm the video is under fifteen minutes and answers all three set questions.**
  *Verify:* time the recording and tick off the three question rows in Section 4 of `docs/demo-video-script.md`. Never omit the search validation demo or the Register dialog.

---

## G. Submission

- [ ] **15. Upload everything to the assessment dropbox before the confirmed deadline.**
  The submission must contain:
  1. `docs/PROG2002_A2_Report_Template.docx`,
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
| Does the API expose any write POST/PUT/PATCH/DELETE endpoint? | Must be **No**. |
| Does the Register dialog show the exact required sentence? | Must be **Yes**, word for word. |
| Is the GitHub repo private with the marker invited? | |
| Are the two archive names exactly as specified? | |
| Is the report 12 pt Arial with 1.5 line spacing? | |
| Is the video under 15 minutes with a working share link? | |
