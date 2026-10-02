# Framework Compliance Audit

**Audit date:** 2 October 2026  
**Scope:** the submitted `api/` and `clientside/` source trees. `node_modules/`, `.git/` and local `.env` files are excluded from the served submission.

**Latest unit rule:** CSS and JavaScript frameworks are not permitted in the client. Express may be used only to build the server side. Express templating (for example EJS) is not permitted. Webpages must be delivered using only HTML, CSS and JavaScript.

**Result: PASS.** No forbidden framework or template engine was found in the application code. All API routes are read-only `GET` endpoints and return JSON only.

## Audit evidence

| Check | Evidence in the project | Result |
| --- | --- | --- |
| No CSS framework | `clientside/css/styles.css` is a hand-written stylesheet. The three HTML pages link only to that local file. No Bootstrap, Tailwind, Bulma or Foundation dependency or CDN link is present. | Pass |
| No client JavaScript framework | The client loads only local scripts: `config.js`, `utils.js`, `api.js`, `layout.js` and one page controller. It uses native `fetch()`, Promises, DOM APIs and event listeners. No React, Vue, AngularJS or jQuery code is present. | Pass |
| Express is server-side only | `api/package.json` lists `express` for routing. `cors`, `dotenv`, `helmet` and `mysql2` are supporting libraries, not front-end frameworks or page renderers. | Pass |
| No Express templating | `api/src/app.js` configures no view engine and returns JSON through `res.json()`. No `res.render()`, EJS, Pug, Handlebars, Mustache or Nunjucks file or call exists. | Pass |
| Plain HTML/CSS/JS delivery | The browser receives static `.html`, `.css` and `.js` files from `clientside/`. Dynamic cards and details are created in the DOM from JSON API responses. | Pass |
| No third-party front-end assets | Logos, favicons and event covers are local SVG files under `clientside/assets/`. The only URL in the client configuration is the local development API URL `http://localhost:3000/api`; it is not a third-party library or asset. | Pass |
| Read-only server API | Every route under `api/src/routes/` uses `router.get(...)`. There are no application POST, PUT, PATCH or DELETE routes. Express may create automatic OPTIONS handling for CORS, but there is no business write endpoint. | Pass |

## Commands used for the audit

Run these from the project root in PowerShell:

```powershell
$clientFiles = Get-ChildItem clientside -Recurse -File |
  Where-Object { $_.Extension -in '.html', '.css', '.js' }
$clientFiles | Select-String -Pattern 'bootstrap|tailwind|bulma|foundation|jquery|react|vue|angular|cdn' -CaseSensitive:$false

Get-ChildItem api\src -Recurse -File -Filter *.js |
  Select-String -Pattern 'res\.render|view engine|ejs|pug|handlebars|mustache|nunjucks' -CaseSensitive:$false

Get-ChildItem api\src\routes -Recurse -File -Filter *.js |
  Select-String -Pattern 'router\.(get|post|put|patch|delete)' -CaseSensitive:$false

Get-Content api\package.json
```

Expected result: no forbidden framework or template-engine match in the application source, only `router.get(...)` route declarations, and only the documented Express dependency among server frameworks.

## Notes for the marker

The project intentionally uses plain HTML, CSS, JavaScript, DOM APIs, `fetch()`, NodeJS, Express server-side routing and MySQL. Names of prohibited frameworks appear only in documentation where the restriction itself is being explained; they are not imports, dependencies or runtime references.
