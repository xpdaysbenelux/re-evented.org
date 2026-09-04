# Re-Evented Website

Website for [Re-Evented](https://re-evented.org), a non-profit dedicated to creating environments for sharing knowledge in agile methods, lean thinking, reinventing organizations, and future ways of working.

## Tech Stack

- Plain HTML / CSS / vanilla JS
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- Hosted on Cloudflare Pages, deployed via GitHub Actions + `wrangler pages deploy`

## Repository

`https://github.com/xpdaysbenelux/re-evented.org`

## Local Development

No build step required — edit files in `public_html/` directly.

Start a local dev server:

```bash
cd public_html
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Install once, then enable the git hooks so the CI gate runs locally too:

```bash
npm install
npm run hooks:install   # sets core.hooksPath to .githooks/
```

`pre-commit` runs a secret scan (`gitleaks`, skipped with a warning if not installed) plus `npm run verify`. `pre-push` runs `npm run verify` again. To run the same checks manually:

```bash
npm run verify   # lint (eslint + stylelint + htmlhint) + test:run (html-validate) + build
```

**Known local/CI gap:** the `w3c-accessibility.yml` workflow (HTML5 validation, link checking via lychee, Pa11y accessibility scan) only runs in CI and is advisory (`continue-on-error: true` on every step) — it never blocks a merge or deploy. There's no local equivalent; if you want to check these before pushing, install `html5validator`, `lychee`, and `pa11y-ci` yourself and point them at a built `dist/`.

## Deployment

Pushes to `main` trigger the CI/CD pipeline automatically:

1. **Build & Test** — secret scan (gitleaks) + lint + html-validate + `npm run build` (copies `public_html/` → `dist/`)
2. **Deploy** — `wrangler pages deploy dist` to Cloudflare Pages, followed by a live-verify check against `https://re-evented.org/`

**Cloudflare Pages project:** `re-evented-org`
**Secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (GitHub Actions secrets)

## File Structure

```
public_html/
├── index.html                        # Homepage
├── styles.css                        # Main stylesheet
├── styles.min.css                    # Minified CSS
├── script.js                         # JavaScript
├── sw.js                             # Service Worker
├── manifest.json                     # PWA manifest
├── robots.txt
├── sitemap.xml
├── privacy-policy.html
├── terms-and-conditions.html
├── cookies-policy.html
├── events/
│   ├── reimagining-agility.html      # Reimagining Agility Brussels workshop (Oct 7, 2026)
│   ├── atbru.html                    # → agiletourbrussels.be
│   ├── xpdays.html                   # → xpdaysbenelux.org
│   ├── less.html                     # → less.works
│   ├── ai.html                       # → aibrusselssummit.com
│   └── chris.html
├── docs/
│   └── Re-Evented-sponsorbook-2026.pdf
└── img/
```

## Events 2026

| Event | Page |
|---|---|
| Liberating Structures Global Gathering | https://liberatingstructuresgathering.com/ |
| Regional Scrum Gathering Brussels | https://www.rsgbrussels26.com/ |
| XP Days Benelux | https://xpdaysbenelux.org/ |
| Reimagining Agility – Brussels Workshop | `/events/reimagining-agility.html` |
