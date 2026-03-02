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

Run checks before committing:

```bash
npm install
npm run lint       # eslint + stylelint + htmlhint
npm run test:run   # html-validate
```

## Deployment

Pushes to `main` trigger the CI/CD pipeline automatically:

1. **Build & Test** — lint + html-validate + `npm run build` (copies `public_html/` → `dist/`)
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
| Agile Lean Europe | https://agilelean.eu/ |
| Regional Scrum Gathering Brussels | https://www.rsgbrussels26.com/ |
| XP Days Benelux | https://xpdaysbenelux.org/ |
| Reimagining Agility – Brussels Workshop | `/events/reimagining-agility.html` |
