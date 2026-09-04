# Re-Evented Website

Website for [Re-Evented](https://re-evented.org), a non-profit dedicated to creating environments for sharing knowledge in agile methods, lean thinking, reinventing organizations, and future ways of working.

## Tech Stack

- Plain HTML / CSS / vanilla JS
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- Hosted on SiteGround, deployed via GitHub Actions + rsync over SSH

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
2. **Deploy** — rsync `dist/` to SiteGround via SSH

**Remote path:** `~/www/re-evented.org/public_html/`
**SSH host:** `ssh.re-evented.org` port `18765`
**SSH user:** set via `SITEGROUND_USER` in `ci-cd.yml`
**SSH key:** stored as `SITEGROUND_SSH_KEY` GitHub Actions secret

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
