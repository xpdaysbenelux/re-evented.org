# re-evented.org

Static marketing site for Re-Evented (agile/lean events, Benelux). Plain HTML/CSS/JS, no framework, no bundler.

## Layout

- `public_html/` — the site. `index.html` (homepage), `cookies-policy.html`, `privacy-policy.html`, `terms-and-conditions.html`, `events/`, `img/`, `docs/`.
- `public_html/styles.css` — all custom CSS. Tailwind utility classes come from the Tailwind CDN in the HTML `<head>`.
- `public_html/script.js` — all site JS (menu, animations, newsletter form, cookie banner).
- `public_html/subscribe.php` — newsletter signup endpoint (PHP on SiteGround/Apache).
- `public_html/.htaccess` — Apache config (access rules, caching, compression). Must stay deployed.
- `deploy.js` — rsync of `dist/` to SiteGround, run by CI.
- `.github/workflows/ci-cd.yml` — lint, validate, build, deploy on push to `main`.

## Commands

- `npm run verify` — lint (eslint, stylelint, htmlhint) + html-validate + build. Must pass before every commit.
- `npm run build` — copies `public_html/` to `dist/`.
- Local preview: `python3 -m http.server 8765 -d public_html`.

## Rules

- `public_html/subscribers.txt` holds real personal data: never commit it, never print or read its contents, never put it in a prompt.
- After changing `styles.css` or `script.js`, bump the `?v=` query on its `<link>`/`<script>` tag in every HTML page (assets are cached for a month).
- No comments in code unless asked. Match the surrounding style.
- Do not commit or push; the orchestrator does that.
