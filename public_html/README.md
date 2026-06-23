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
│   ├── certified-org-topologies-consultant.html      # C-OTC Bootcamp – Design AI-Ready Organizations with Org Topologies, Brussels (6–7 Oct 2026)
│   ├── ebac-workshop.html            # EBAC Workshop – Extraordinarily Badass Agile Coaching, Brussels (Oct 7, 2026)
│   ├── outcome-based-product-roadmaps.html  # Outcome-Based Product Roadmaps with Roman Pichler, Brussels (Oct 7, 2026)
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
| Org Topologies – Brussels Certification | `/events/certified-org-topologies-consultant.html` |
| EBAC Workshop – Extraordinarily Badass Agile Coaching | `/events/ebac-workshop.html` |
| Outcome-Based Product Roadmaps with Roman Pichler | `/events/outcome-based-product-roadmaps.html` |
