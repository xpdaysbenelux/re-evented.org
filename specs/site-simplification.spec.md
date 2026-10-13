---
name: Site simplification
description: Re-Evented.org as a simple informational site about learning and adaptive organisations, without promotion
targets:
  - ../public_html/index.html
  - ../public_html/sitemap.xml
  - ../public_html/script.js
  - ../public_html/privacy-policy.html
  - ../public_html/terms-and-conditions.html
---

# Site simplification

## Tone
- General descriptive text uses the present tense; everything about events, including the 2026 events, uses the past tense
  `[@test] ../tests/site-content.test.sh`
- No text announces that events have stopped
  `[@test] ../tests/site-content.test.sh`
- No future-dated events, ticket or registration links, sponsor material or testimonial blocks remain
  `[@test] ../tests/site-content.test.sh`

## Figures
- Each event on the timeline shows its approximate participant count (RSG Ghent ca. 200, RSG Brussels ca. 120, AI Summit Brussels ca. 40, XP Days Benelux up to ca. 190, Agile Tour Brussels 150-200, LS Gathering Brussels ca. 70, LS Gathering Eindhoven ca. 30, LeSS Conference Amsterdam ca. 150)
  `[@test] ../tests/site-content.test.sh`
- No aggregate total and no generic claims ("100-200 per event", "50% return") remain
  `[@test] ../tests/site-content.test.sh`

## Structure (single page)
- Hero with a heading on learning and adaptive organisations in the Benelux, since 2016
- "What we stand for": four short blocks (learning, adaptive organisations, peer exchange, open and transparent working)
- "What we did": all events stay visible, the 2026 events included, as one timeline with logo, date and place, in the past tense (the three event sections are merged; event pages and external links to the events stay)
- "About": story and approach in one block, with one sentence on the years (10 years, dozens of events)
- FAQ with three short questions; the FAQPage JSON-LD matches the visible questions
- "Contact" block (email, LinkedIn) that invites enquiries, and a "Stay connected" newsletter form with neutral text
- Footer with both legal entities and links to privacy, terms and cookies
  `[@test] ../tests/site-content.test.sh`

## Removed
- Sponsor book PDF, sponsor FAQ, statistics block, and promotional wording on event cards (calls to action, "explore", ticket links)
  `[@test] ../tests/site-content.test.sh`

## Kept
- The events themselves (AI Summit Brussels, Liberating Structures Global Gathering, Regional Scrum Gathering, XP Days Benelux, Agile Tour Brussels, LeSS Amsterdam and the others) and the redirect page `events/ai.html`
- Newsletter form and `subscribe.php` behave as before
  `[@test] ../tests/subscribe.test.sh`
- Contact stays reachable; people may still reach out
  `[@test] ../tests/site-content.test.sh`

## Consistency
- Dead assets are removed (sponsor book, unused photos and logos, testimonial and earlier-events CSS); `sw.js` stays as the tombstone for returning visitors
- JSON-LD, meta descriptions, sitemap, README and legal pages match the new content
  `[@test] ../tests/site-content.test.sh`
- Accessibility (pa11y) and link checks stay green in CI
