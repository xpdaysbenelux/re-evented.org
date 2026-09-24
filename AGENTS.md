# re-evented.org

Static marketing site for Re-Evented (agile/lean events, Benelux). Plain HTML/CSS/JS, no framework, no bundler.

## Layout

- `public_html/` — the site. `index.html` (homepage), `cookies-policy.html`, `privacy-policy.html`, `terms-and-conditions.html`, `events/`, `img/`, `docs/`.
- `public_html/styles.css` — all custom CSS. Tailwind utilities are compiled at build time into `dist/tailwind.css` (config: `tailwind.config.js`, input: `src/tailwind.css`). Fonts are self-hosted (`fonts.css`, `fonts/`).
- `public_html/script.js` — all site JS (menu, animations, newsletter form, cookie banner).
- `public_html/subscribe.php` — newsletter signup endpoint (PHP on SiteGround/Apache).
- `public_html/.htaccess` — Apache config (access rules, caching, compression). Must stay deployed.
- `deploy.js` — rsync of `dist/` to SiteGround, run by CI.
- `.github/workflows/ci-cd.yml` — lint, validate, build, deploy on push to `main`.

## Commands

- `npm run verify` — lint (eslint, stylelint, htmlhint) + html-validate + build. Must pass before every commit.
- `npm run build` — copies `public_html/` to `dist/`, compiles Tailwind, content-hashes asset URLs.
- Tests: `npm run test:php` (Docker), `npm run test:tailwind`, `npm run test:hash`.
- Local preview: `npm run build && python3 -m http.server 8765 -d dist` (tailwind.css only exists in dist).

## Rules

- `public_html/subscribers.txt` holds real personal data: never commit it, never print or read its contents, never put it in a prompt.
- Asset URLs get a content hash at build time (`scripts/hash-assets.mjs`); don't hand-edit `?v=` values.
- No comments in code unless asked. Match the surrounding style.
- Do not commit or push; the orchestrator does that.
