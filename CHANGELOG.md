# Changelog

All notable changes to JobMemory will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-14

### Added
- **Core Tracking** - Manually save job applications with one click
- **Duplicate Detection** - Visual overlay alerts when revisiting applied jobs
- **Status Tracking** - Track application progress (applied, screening, interviewing, offer, rejected, etc.)
- **Application Notes** - Add and edit notes for each application
- **Dashboard** - Full application management interface
- **Search & Filter** - Find jobs by title, company, status, date
- **Sort Options** - Organize by date, company name, or job title
- **Export Data** - Download application history as CSV or JSON
- **Cross-Browser Support** - Works on Chrome, Firefox, Edge, and Safari
- **Local Storage** - All data stays on your computer (no cloud sync)
- **SPA Support** - Detects URL changes for single-page applications
- **Page Scraping** - Auto-extracts job title, company, and location from pages
- **Settings** - Configurable overlay position and preferences
- **URL Normalization** - Removes tracking parameters to detect duplicates accurately

### Technical
- Vanilla JavaScript (no frameworks)
- Manifest V3 for Chrome/Edge/Safari
- Manifest V2 for Firefox
- Browser storage API for data persistence
- Content scripts for page overlay injection
- Service worker/background script architecture

### Known Limitations
- Safari requires XCode conversion
- Page scraping may not work for heavily dynamic pages
- Storage capacity depends on browser settings

## [2.0.0] - Planned

### Planned Features
- Save jobs for later (job discovery feature)
- Application reminders and follow-up alerts
- Interview prep notes and tracking
- Salary tracking and comparison
- Job board integrations (auto-scrape from LinkedIn, Indeed, etc.)
- Optional cloud sync
- Dark mode theme
- Email notifications
- Advanced analytics and success rate tracking

---

## How to Update Version

1. Update `manifest_v2.json` version field
2. Update `manifest_v3.json` version field
3. Update `manifest.json` version field
4. Update this CHANGELOG.md file
5. Create a git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
6. Push changes: `git push && git push --tags`
