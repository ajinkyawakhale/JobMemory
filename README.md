# JobMemory

**Save jobs. Track applications. Never forget.**

A lightweight browser extension that helps job seekers discover, save, and track job applications across all job sites. Never apply twice, never miss an opportunity.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-brightgreen)](https://chrome.google.com/webstore)

## Features

- **Save Jobs** - Build a list of interesting jobs to apply to later
- **Track Applications** - Record where you've applied with dates and notes
- **Duplicate Detection** - Get alerts when you revisit a job you've already applied to
- **Application Status** - Track progress (applied, screening, interviewing, offer, rejected, etc.)
- **Smart Search & Filter** - Find jobs by title, company, status, or date
- **Export Data** - Download your job history as CSV or JSON
- **Cross-Browser** - Works on Chrome, Firefox, Edge, and Safari
- **Privacy First** - All data stays locally on your computer, no cloud sync

## Installation

### Chrome / Edge / Safari
1. Download the extension from [Chrome Web Store](https://chrome.google.com/webstore) (link coming soon)
2. Or load locally:
   - Clone this repo
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `job_apply_plugin` folder

### Firefox
1. Clone this repo
2. Go to `about:debugging`
3. Click "Load Temporary Add-on"
4. Select `manifest_v2.json` from the folder

## Quick Start

1. **Visit a job posting** - Any job site (LinkedIn, Indeed, company career pages)
2. **Click the JobMemory icon** - In your browser toolbar
3. **Save or Apply** - Either save the job for later or mark it as applied
4. **Manage** - Use the dashboard to organize all your jobs and applications
5. **Export** - Download your data whenever you need it

## Usage Guide

### Saving Jobs
- Click the extension icon on a job posting page
- Pre-filled with job title, company, and location
- Add notes (salary expectations, why interested, etc.)
- Click "Save Job"
- Access your saved jobs list anytime from the dashboard

### Tracking Applications
- Click the extension icon after applying to a job
- Record the application with date, status, and notes
- When you revisit the same job URL, you'll see an alert: "You already applied to this job"
- Update status as you progress through interviews

### Dashboard
- View all saved jobs and applications
- Search by job title, company, or notes
- Filter by status or date applied
- Sort by date, company name, or job title
- Edit or delete entries
- Export everything to CSV/JSON

## Tech Stack

- **Frontend**: Vanilla JavaScript + HTML/CSS (no frameworks)
- **Storage**: Browser local storage (Chrome/Firefox storage API)
- **Architecture**: Content scripts + Background service worker + Popup UI
- **Compatibility**: Manifest V2 (Firefox) and V3 (Chrome/Edge/Safari)

## Project Structure

```
job_apply_plugin/
├── manifest_v2.json          # Firefox extension config
├── manifest_v3.json          # Chrome/Edge/Safari config
├── manifest.json             # Active manifest (copy of v3)
├── icons/                    # Extension icons (16, 32, 48, 128px)
├── src/
│   ├── background/           # Service worker/background scripts
│   ├── content/              # Content scripts & overlay
│   ├── popup/                # Quick add/edit interface
│   ├── dashboard/            # Full application management
│   ├── shared/               # Utilities (storage, constants, etc.)
│   └── export/               # Export functionality
├── README.md                 # This file
├── implementation.md         # Detailed development notes
└── generate_icons.py         # Icon generation script
```

## Data Model

Each saved/applied job contains:
- **Job Title** - Title of the position
- **Company** - Employer name
- **Location** - Job location
- **URL** - Link to the job posting
- **Status** - Applied, Saved, Screening, Interviewing, Offer, Rejected, etc.
- **Date Applied** - When you applied (auto-filled)
- **Notes** - Your notes about the position
- **Domain** - Which job site (linkedin.com, indeed.com, etc.)

All data is stored locally in your browser using the storage API.

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Supported |
| Firefox | 88+ | ✅ Supported |
| Edge | 90+ | ✅ Supported |
| Safari | 15+ | ⚠️ Requires conversion |

## Privacy & Security

- ✅ No server uploads - All data stays in your browser
- ✅ No tracking - No analytics or telemetry
- ✅ No login required - Works completely offline
- ✅ Open source - Inspect the code yourself

## Troubleshooting

**Overlay not showing for duplicate jobs?**
- Refresh the page
- Make sure the URL matches exactly
- Check that "Overlay Enabled" is on in settings

**Search not finding applications?**
- Try different keywords
- Check if filters are restricting results
- Use "Reset Filters" button

**Export not downloading?**
- Check browser download settings
- Disable pop-up blockers if needed
- Try a different format (JSON vs CSV)

## Roadmap

### Current (v1.0)
- Save jobs for later
- Track applications
- Duplicate detection
- Search, filter, export

### Planned (v2.0)
- Application reminders (follow-up alerts)
- Interview notes and prep
- Salary tracking and comparison
- Job board integrations (auto-scrape)
- Cloud sync option (optional)

## Development

### Prerequisites
- Python 3 (for icon generation)
- Pillow/PIL (for image processing)

### Building Icons
```bash
python3 generate_icons.py
```

### Testing
1. Load unpacked extension in your browser
2. Visit job sites and test all features
3. Check browser console for errors (F12 → Console)
4. Test on different browsers if possible

### Contributing

Contributions are welcome! Please:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Ajinkya Wakhale**
- GitHub: [@ajinkyawakhale](https://github.com/ajinkyawakhale)

## Support

Found a bug or have a feature request? Open an [issue](https://github.com/ajinkyawakhale/JobMemory/issues) on GitHub.

---
