#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
PAGE=public_html/index.html
FAIL=0

fail() { echo "FAIL: $1"; FAIL=1; }
absent() { if grep -q -i -E -- "$1" "$PAGE"; then fail "index.html still contains: $2"; fi; }
present() { if ! grep -q -F -- "$1" "$PAGE"; then fail "index.html misses: $2"; fi; }

absent 'sponsor' 'sponsor material'
absent 'testimonial|what our community says' 'testimonials'
absent '100[–-]200 (practitioners|participants)|50% (come|of)' 'generic statistics'
absent 'Explore 2026|events 2026|programme includes' 'event promotion'
absent 'upcoming|register now|tickets?\b|buy ' 'promotional wording'
absent 'no longer|no more events|stopped organising|final edition|last edition' 'announcement that events stopped'
absent 'EventScheduled' 'future event markup'
[ ! -e public_html/docs/Re-Evented-sponsorbook-2026.pdf ] || fail 'sponsor book PDF still present'

for id in events stand-for about faq contact newsletter legal; do
  present "id=\"$id\"" "section #$id"
done
present 'id="newsletterForm"' 'newsletter form'
present 'data-protect="email_info"' 'email contact'
present 'linkedin.com/company/re-evented' 'LinkedIn contact'

for fig in 'ca. 120 participants' 'ca. 30 participants' 'ca. 40 participants' 'ca. 150 participants' 'ca. 70 participants' 'ca. 200 participants' 'up to ca. 190 participants' '150–200 participants'; do
  present "$fig" "participant count '$fig'"
done
for ev in 'Regional Scrum Gathering' 'Liberating Structures Global Gathering' 'AI Summit Brussels' 'LeSS Conference Amsterdam' 'XP Days Benelux' 'Agile Tour Brussels'; do
  present "$ev" "event '$ev'"
done
[ -f public_html/events/ai.html ] || fail 'events/ai.html redirect missing'

for target in $(grep -o -E 'href="#[^"]+"' "$PAGE" | sed -E 's/href="#(.*)"/\1/' | sort -u); do
  [ -z "$target" ] && continue
  grep -q "id=\"$target\"" "$PAGE" || fail "dead anchor #$target in index.html"
done
for page in public_html/privacy-policy.html public_html/terms-and-conditions.html public_html/cookies-policy.html; do
  for target in $(grep -o -E 'index\.html#[^"]+' "$page" | sed 's/index.html#//' | sort -u); do
    grep -q "id=\"$target\"" "$PAGE" || fail "dead anchor index.html#$target in $page"
  done
done

node -e '
const fs=require("fs");
const html=fs.readFileSync(process.argv[1],"utf8");
const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
if(blocks.length!==2) process.exit(2);
const faq=blocks.find(b=>b["@type"]==="FAQPage");
const shown=[...html.matchAll(/<details[\s\S]*?<summary[^>]*>\s*([^<]+?)\s*<span/g)].map(m=>m[1]);
const ld=faq.mainEntity.map(q=>q.name);
if(JSON.stringify(shown)!==JSON.stringify(ld)) process.exit(3);
' "$PAGE" || fail 'JSON-LD invalid or FAQ schema out of sync with visible FAQ'

if [ "$FAIL" -ne 0 ]; then exit 1; fi
echo "site-content: OK"
