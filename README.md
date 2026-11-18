# Bulk Unlink Manager

A Firefox extension that unlinks a mapped site row in **every open hotel tab at once** — built for sessions with ~300 tabs open.

## How it works

- No toolbar button or pin needed: a small floating button on hotel pages opens a **manager tab**.
- The manager's one big button queries all open hotel tabs and injects the unlink code into each tab via `tabs.executeScript` — already-open tabs do **not** need reloading.
- The injected code ticks the site-row checkbox, neutralises the page's confirm dialog at DOM level, and clicks the site's "New ID / Unlink" submit button.
- Tabs are processed sequentially (~5/sec) with a live per-tab log and a final summary: unlinked / no checkbox / no button.

Born from a real workflow pain: unlinking hundreds of records one tab at a time.
