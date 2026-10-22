# Fluxo Digital — project notes

## What this is
A single-page static marketing site in Brazilian Portuguese for a web-design studio.
Plain HTML/CSS/JS: `index.html` (all markup), `styles.css`, `app.js`, `assets/` (images).
No package manager, no build step, no backend, no tests.

## Running it locally (Base44 sandbox)
`docker compose -f docker-compose.base44.yml up -d` → http://localhost:3000

- `python:3.12-alpine` runs `python -m http.server 3000` with the repo bind-mounted at
  `/app` (read-only). Files are read from disk per request, so source edits are live on
  the next page load — no build or restart needed.
- The sandbox checkout is mode `700` and root-owned, so an unprivileged web server
  (e.g. nginx's default `nginx` worker user) returns **403 Forbidden**. That is why the
  static server runs as root; do not "fix" it by chmod-ing the checkout.
- There is no live-reload dev server for a static site, so call `reload_preview` after edits.

## External dependencies (browser-side only)
- **FormSubmit** — the quote form in `app.js` POSTs JSON to
  `https://formsubmit.co/ajax/fluxodigitalbr@outlook.com`. No API key or secret; the
  target inbox must confirm a one-time activation email before submissions are relayed.
  If it is not activated, the form shows its own "being activated" message with WhatsApp
  and e-mail fallbacks. Verifying the form end to end sends a real e-mail, so don't do it
  during checks — assert that validation blocks empty submits instead.
- Outbound links only: WhatsApp (`wa.me`), `mailto:`, and the AutoDigital demo site.
- No web fonts, CDNs, analytics or cookies.

## How to verify
1. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → `200`.
2. Page renders the hero ("Seu negócio em um novo fluxo."), brand image and AutoDigital
   preview; no console errors; no horizontal overflow at desktop or mobile widths.
3. Menu toggle (`.menu-toggle`) opens/closes `#navigation.open` and flips `aria-expanded`;
   it also closes when a nav link is clicked.
4. A `[data-service="…"]` link preselects the matching option in `#service-select`.
5. Submitting the empty form is blocked by native validation — no request to formsubmit.co.
