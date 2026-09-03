# bc2pdf

Chrome extension that turns a Basecamp doc into a clean, chrome-free PDF.

Adds a **PDF** button to the doc toolbar (`.perma-toolbar__actions`) that opens a
menu with output options, then prints the doc via the browser's native print
dialog — hiding Basecamp's UI chrome (top nav, toolbar, breadcrumbs, byline,
avatar, comments, footer) while keeping the doc's native styling.

## Features

- **Live preview** — "focus mode" that hides the Basecamp chrome on-screen so
  you see the clean doc as you work. While active, a floating PDF button
  (top-right) keeps the menu reachable. Toggling it off restores the UI.
- **Title alignment** — left or center for the doc title.
- **Full-width images** — break the 684px cap so images span the content column.
- **Download PDF** — opens the print dialog with the clean layout applied.

## Install

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this folder
4. Open any Basecamp doc — the **PDF** button appears in the toolbar

## Files

- `manifest.json` — MV3, content script scoped to Basecamp doc pages
- `content.js` — button, dropdown menu, preview, and print CSS injection