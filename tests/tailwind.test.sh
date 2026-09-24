#!/bin/bash
set -euo pipefail

echo "Running Tailwind build-time CSS tests..."

npm run build

echo "Test 1: dist/tailwind.css exists"
if [[ -f dist/tailwind.css ]]; then
    echo "PASS: dist/tailwind.css exists"
else
    echo "FAIL: dist/tailwind.css not found"
    exit 1
fi

echo "Test 2: dist/tailwind.css is under 100 KB"
SIZE=$(wc -c < dist/tailwind.css)
if [[ "$SIZE" -lt 102400 ]]; then
    echo "PASS: dist/tailwind.css is ${SIZE} bytes (< 100 KB)"
else
    echo "FAIL: dist/tailwind.css is ${SIZE} bytes (>= 100 KB)"
    exit 1
fi

echo "Test 2b: dist/tailwind.css is minified (single line)"
LINE_COUNT=$(wc -l < dist/tailwind.css)
if [[ "$LINE_COUNT" -le 1 ]]; then
    echo "PASS: dist/tailwind.css is minified (${LINE_COUNT} line(s))"
else
    echo "FAIL: dist/tailwind.css has ${LINE_COUNT} lines (expected minified)"
    exit 1
fi

echo "Test 3: dist/tailwind.css contains .md\\:grid-cols-2"
if grep -q 'md\\:grid-cols-2' dist/tailwind.css; then
    echo "PASS: .md\\:grid-cols-2 found"
else
    echo "FAIL: .md\\:grid-cols-2 not found"
    exit 1
fi

echo "Test 4: dist/tailwind.css contains .max-w-3xl"
if grep -q 'max-w-3xl' dist/tailwind.css; then
    echo "PASS: .max-w-3xl found"
else
    echo "FAIL: .max-w-3xl not found"
    exit 1
fi

echo "Test 5: dist/tailwind.css contains .hidden"
if grep -q '\.hidden' dist/tailwind.css; then
    echo "PASS: .hidden found"
else
    echo "FAIL: .hidden not found"
    exit 1
fi

echo "Test 6: dist/tailwind.css contains arbitrary-value class max-w-\[220px\]"
if grep -qF 'max-w-\[220px\]' dist/tailwind.css; then
    echo "PASS: arbitrary-value class max-w-\[220px\] found"
else
    echo "FAIL: arbitrary-value class max-w-\[220px\] not found"
    exit 1
fi

echo "Test 7: dist/tailwind.css contains z-\[9999\] (from script.js)"
if grep -qF 'z-\[9999\]' dist/tailwind.css; then
    echo "PASS: z-\[9999\] found (JS classes scanned)"
else
    echo "FAIL: z-\[9999\] not found (JS classes not scanned)"
    exit 1
fi

echo "Test 8: dist/*.html references tailwind.css (not wrong filename)"
BAD_LINK=0
for f in dist/*.html; do
    if ! grep -q 'href="tailwind\.css' "$f"; then
        echo "FAIL: $f does not reference tailwind.css"
        BAD_LINK=$((BAD_LINK + 1))
    fi
done
if [[ "$BAD_LINK" -eq 0 ]]; then
    echo "PASS: all HTML files reference tailwind.css"
else
    echo "FAIL: $BAD_LINK file(s) do not reference tailwind.css"
    exit 1
fi

echo "Test 9: no dist/*.html contains cdn.tailwindcss.com"
CDN_COUNT=0
for f in dist/*.html; do
    if grep -q 'cdn.tailwindcss.com' "$f"; then
        echo "FAIL: $f still references cdn.tailwindcss.com"
        CDN_COUNT=$((CDN_COUNT + 1))
    fi
done
if [[ "$CDN_COUNT" -eq 0 ]]; then
    echo "PASS: no HTML file references cdn.tailwindcss.com"
else
    echo "FAIL: $CDN_COUNT file(s) still reference cdn.tailwindcss.com"
    exit 1
fi

echo "All Tailwind tests passed!"
