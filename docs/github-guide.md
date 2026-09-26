# GitHub Repository Guide

The brief requires the project to live in a **protected GitHub repository** with **visible, incremental work progress**. It states that failing to demonstrate proper work progress will cause the assignment to fail, so the history below is deliberately built up in ten meaningful commits rather than one bulk upload.

---

## 1. Why the repository matters

Two of the marking criteria depend on this guide:

* **Concept understanding (15%)** — a readable history shows how the work developed and lets the marker follow individual design decisions.
* **Code quality / professionalism** — commit messages explain *what changed and why*, which is exactly what the brief asks for.

Keep the repository **private** so other students cannot copy the work, and **invite the marker as a collaborator** so it remains accessible for marking.

---

## 2. One-time setup

### 2.1 Create the remote repository

1. Sign in to GitHub and choose **New repository**.
2. Repository name: `prog2002-charity-events` (or `usernameA2`).
3. Visibility: **Private**.
4. Do **not** initialise with a README, `.gitignore` or licence — the local project already contains them.
5. Copy the HTTPS URL, for example `https://github.com/your-username/prog2002-charity-events.git`.

### 2.2 Prepare the project folder

Before the first commit, confirm `.gitignore` exists at the repository root and excludes everything that should not be submitted:

```gitignore
# dependencies
node_modules/

# environment and secrets
.env
.env.local

# logs and coverage
npm-debug.log*
coverage/

# OS noise
.DS_Store
Thumbs.db
```

Verify no secrets are staged:

```bash
git status
git check-ignore -v api/.env node_modules
```

`api/.gitignore` already covers the API folder; add the root file above if you initialise the repository at the project root.

### 2.3 Initialise and link

```bash
cd prog2002-charity-events
git init
git branch -M main
git config user.name  "Your Full Name"
git config user.email "your.student@scu.edu.au"
git remote add origin https://github.com/your-username/prog2002-charity-events.git
```

---

## 3. The ten incremental commits

Each block below is a self-contained unit of work: stage the listed paths, commit with the exact message, then push. Committing in this order produces a history that mirrors the real build sequence described in **Section 8.3 of the project report**.

### Commit 1 — project scaffolding

```bash
git add .gitignore api/package.json api/.env.example api/package-lock.json
git commit -m "chore: scaffold api project, package.json and .env.example"
```

*Establishes the NodeJS project, its dependencies (express, mysql2, cors, helmet, dotenv) and the environment contract before any logic exists.*

### Commit 2 — database schema

```bash
git add api/database/schema.sql
git commit -m "feat(db): add charityevents_db schema with keys and constraints"
```

*Adds the five-table schema — organisations, categories, venues, events and event_highlights — with primary keys, foreign keys, CHECK constraints and indexes.*

### Commit 3 — seed data

```bash
git add api/database/seed.sql
git commit -m "feat(db): seed twelve realistic charity events"
```

*Loads varied sample data including free, paid, past, upcoming and one suspended event so every client rule can be demonstrated.*

### Commit 4 — search endpoint

```bash
git add api/event_db.js api/src/config api/src/utils api/src/services api/src/routes/events.js
git commit -m "feat(api): add parameterised event search endpoint"
```

*Introduces the mysql2 connection pool (`event_db.js`), the validation layer, the parameterised query builder and the search route.*

### Commit 5 — remaining read endpoints

```bash
git add api/src/routes/categories.js api/src/routes/locations.js api/src/routes/organisations.js api/src/middleware api/src/app.js api/server.js
git commit -m "feat(api): add event detail, category, location and organisation endpoints"
```

*Completes the read-only resource model, the shared error envelope and the application bootstrap.*

### Commit 6 — layout and home page

```bash
git add clientside/index.html clientside/css/styles.css clientside/js/config.js clientside/js/utils.js clientside/js/api.js clientside/js/layout.js clientside/js/home.js clientside/assets
git commit -m "feat(client): build shared layout and dynamic home page"
```

*Adds the navigation used by all three pages, the static organisation content and the API-driven event-card grid with past/upcoming labels.*

### Commit 7 — search page

```bash
git add clientside/search.html clientside/js/search.js
git commit -m "feat(client): add search filters, URL sync and DOM validation"
```

*Adds the date, location and multi-select category criteria, OR logic across selected categories, the Clear Filters control and DOM-written validation messages.*

### Commit 8 — event detail page

```bash
git add clientside/event.html clientside/js/event.js
git commit -m "feat(client): add event detail, progress bar and register dialog"
```

*Adds the full detail view, the goal-versus-progress bar and the Register dialog containing the exact required message.*

### Commit 9 — automated tests

```bash
git add api/tests
git commit -m "test: add unit, API smoke and client render suites"
```

*Adds the automated evidence supporting the accuracy and efficiency criterion.*

### Commit 10 — documentation

```bash
git add README.md docs scripts
git commit -m "docs: add report, README, GitHub guide and video script"
```

*Completes the concept-understanding deliverables: the project report, this guide, the video script, the submission checklist and the asset generator.*

### Push

```bash
git push -u origin main
```

If you have already committed everything in one go, you can still rebuild a readable history with an interactive rebase, or create the ten commits on a fresh repository by checking files in as shown above. Either way, the final repository must show **ten or more commits with descriptive messages**.

---

## 4. Protecting the repository

### 4.1 Keep it private

**Settings → General → Danger Zone → Change repository visibility → Private.**

Anyone who is not a collaborator then sees:

```
404 — This is not the web page you are looking for.
```

Test it yourself in a private/incognito window while logged out.

### 4.2 Invite the marker

1. **Settings → Collaborators and teams → Add people.**
2. Enter the marker/unit-coordinator GitHub username or email supplied on the unit's Blackboard site.
3. Choose **Write** access and send the invitation.
4. Confirm the invite shows **Pending invite** — the marker must accept it before it appears as an active collaborator.

### 4.3 Recommended extra protections

* **Settings → Branches → Add branch protection rule** for `main` to prevent accidental force-pushes.
* Enable **two-factor authentication** on your account.
* Add a short `README.md` at the root describing the project (already included).

---

## 5. Final verification

Before submitting the link, check every item below.

| # | Check | How |
| --- | --- | --- |
| 1 | Repository is private | Open the URL logged out — it must not be visible. |
| 2 | Marker is invited | Collaborators list shows a pending or accepted invite. |
| 3 | At least ten commits | `git log --oneline` lists ten entries with descriptive messages. |
| 4 | No `node_modules` or `.env` committed | `git ls-files | findstr /i "node_modules .env"` returns nothing (except `.env.example`). |
| 5 | Every commit message explains the change | Read `git log` top to bottom. |
| 6 | The link resolves on the default branch | Open the repository home page and confirm the files render. |
| 7 | The link is copied into the report cover page | Replace `[Paste your private GitHub link here]`. |

Paste the final URL into the submission and into the cover page of `docs/PROG2002_A2_Project_Report.docx`.