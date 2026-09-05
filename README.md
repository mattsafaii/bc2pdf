# bc2pdf

Download any Basecamp doc as a clean, print-ready PDF — without Basecamp's UI in the way.

Basecamp's own PDF and share links drag along the page chrome: your name, your avatar, timestamps, and the activity feed under the doc. bc2pdf hides all of that and prints the doc itself, keeping its native styling.

## Install

1. [Download the extension](https://github.com/mattsafaii/bc2pdf/archive/refs/heads/master.zip) and unzip it
2. Open `chrome://extensions`
3. Turn on **Developer mode** (top right)
4. Click **Load unpacked** and select the unzipped folder
5. Open any Basecamp doc — the **PDF** button appears in the doc toolbar

Works in any Chromium browser (Chrome, Edge, Brave).

## Use

Click **PDF** in the doc toolbar. The menu lets you:

- **Title alignment** — left or center the doc title
- **Full-width images** — let images span the full content column instead of the 684px cap
- **Live preview** — hide the Basecamp chrome on screen so you see the clean doc as you work. A floating PDF button keeps the menu reachable.
- **Download PDF** — opens your browser's print dialog with the clean layout applied; save as PDF from there

## Privacy

bc2pdf runs entirely in your browser. It only runs on Basecamp doc pages, and it never sends anything anywhere — no analytics, no network calls.

## How it works

bc2pdf is two small files that run in your browser on Basecamp doc pages. It adds a PDF button to the doc toolbar, then uses CSS to hide Basecamp's chrome when you preview or print. The PDF comes from your browser's own print dialog.

## Supported pages

Docs on `app.basecamp.com` and `3.basecamp.com` (the `/buckets/*/documents/*` URL pattern). Other Basecamp pages — message boards, to-dos, projects — aren't covered.

## Files

- `manifest.json` — the extension manifest, scoped to Basecamp doc pages
- `content.js` — the button, menu, preview, and print CSS