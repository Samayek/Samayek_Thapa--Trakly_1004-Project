# Trakly_1004-Project

All things and information related to COMP-1004 Project

# Trakly - Personal Productivity SPA

Trakly is a browser-based Single Page Application for personal productivity and management.  
It combines task/event planning, finance tracking, notifications, and backup/restore in one dashboard.

## Name: Samayek Thapa

## Stand-up Leader: Vivek Singh

## Overview

This project was built as a university software engineering SPA using Vanilla JavaScript and browser storage.  
It runs fully client-side (no backend), with modular architecture and persistent data in `localStorage`.

## Features

- Dashboard overview with monthly productivity summary
- Monthly task contribution heatmap
- Calendar Hub:
  - Add/Edit/Delete tasks and events
  - Status: To Do / In Progress / Done
  - Priority, reminders, repeat rules, custom reminder units
- Finance Tracker:
  - Add/Edit/Delete transactions
  - Income/Expense summaries
  - Monthly budget progress
  - Top categories, month/category filters
- Global Search in topbar (tasks/events/transactions)
- Notification panel:
  - Due today, overdue, upcoming, reminder-based items
  - View / Read / Dismiss / Mark all read
- Settings & Backup:
  - Profile + auto-initial avatar
  - Theme toggle (light/dark)
  - JSON export
  - JSON import with Overwrite or Add/Merge
  - Clear all data

## Tech Stack

- HTML5
- CSS3
- Bootstrap 5
- Bootstrap Icons
- Vanilla JavaScript (ES Modules)
- `localStorage` persistence

## Architecture

- `app.js`: app shell, topbar, sidebar, search, notifications
- `router.js`: view loading
- `calendar.js`: task/event logic
- `finance.js`: finance logic
- `dashboard.js`: aggregated insights
- `settings.js`: profile/theme/backup/notifications settings
- `storage.js`: single source of truth for persistence helpers

## Run Locally

1. Open project folder in VS Code.
2. Use Live Server (or any local static server).
3. Open `index.html` via `http://127.0.0.1:5500/...`

## Important Note (Browser Notifications)

Browser notifications require a secure context:

- Works on `localhost` / `127.0.0.1` / `https`
- May not prompt correctly on `file://` URLs

## Data Persistence

All data is stored in browser `localStorage`:

- Tasks/events
- Transactions
- Monthly budget
- Theme/profile
- Notification read/dismiss state

## Backup Format

Export creates JSON including:

- tasks/events
- transactions
- monthly budget
- theme/profile
- notification state

Import modes:

- **Overwrite**: replaces current data
- **Add/Merge**: keeps current data and adds unique entries

## Testing Checklist

- Add/edit/delete task and event
- Custom reminder and repeat behavior
- Finance CRUD and monthly filtering
- Dashboard month filter and heatmap
- Notification actions (View/Read/Dismiss)
- Backup export/import (overwrite + merge)
- Light/dark mode consistency

## Known Limitations

- No backend sync (local browser only)
- Notification behavior depends on browser permission/context
- Repeat-rule edge cases (month-end/DST) may need further hardening

## Future Improvements

- Better recurrence edge-case handling
- Optional all-time vs monthly summary toggle
- More analytics and charting
- PWA/offline enhancements

## Author

- Name: Samayek
- Project: Trakly (University SPA)
