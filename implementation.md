# JobMemory - Implementation Tracking

## Phase 1: Core Infrastructure
**Goal**: Setup project structure and core data layer

### Files to Create
- [ ] `manifest_v2.json` - Firefox manifest
- [ ] `manifest_v3.json` - Chrome/Edge/Safari manifest
- [ ] `src/shared/constants.js` - Status enums, config
- [ ] `src/shared/utils.js` - Date formatting, HTML escaping, debounce
- [ ] `src/shared/storage.js` - Cross-browser storage abstraction
- [ ] `src/shared/scraper.js` - Page data extraction

### Key Functions (storage.js)
- `normalizeUrl(url)` - Remove tracking params, sort query params, lowercase
- `hashUrl(url)` - SHA-256 hash for indexing
- `saveApplication(app)` - Save to storage + update urlIndex
- `getApplicationByUrl(url)` - Fast lookup via hash
- `getAllApplications()` - Return all apps as array
- `updateApplication(id, updates)` - Partial update
- `deleteApplication(id)` - Remove from storage + index
- `searchApplications(query, filters)` - Text search + filtering

### Testing
- Load unpacked extension in Chrome
- Test storage save/retrieve in console
- Test URL normalization with different URLs
- Verify hash consistency

---

## Phase 2: Content Script & Overlay
**Goal**: Detect URLs and show duplicate alerts

### Files to Create
- [ ] `src/content/content.js` - Main content script
- [ ] `src/content/overlay.js` - Overlay component
- [ ] `src/content/content.css` - Overlay styling

### Content Script Logic
- On page load: check if URL exists in storage
- If exists: show overlay
- Listen for messages from popup/background
- Monitor SPA URL changes (History API + polling)
- Handle: SAVE_APPLICATION, CHECK_URL, REFRESH_OVERLAY messages

### Overlay Component
- Fixed position banner at top
- Shows: "Already applied on [date]", status badge
- Buttons: View Details, Dismiss
- High z-index (999999), non-intrusive colors
- Slide-down animation

### Testing
- Visit job page, manually add to storage
- Reload page, verify overlay appears
- Test on LinkedIn, Indeed, company career pages
- Test SPA navigation (LinkedIn job browsing)
- Test overlay dismiss and reappear

---

## Phase 3: Background Scripts
**Goal**: Handle extension lifecycle and messaging

### Files to Create
- [ ] `src/background/background_v2.js` - Firefox background script
- [ ] `src/background/background_v3.js` - Chrome service worker

### Background Logic
- Listen for icon clicks (if no popup defined)
- Handle storage change events
- Broadcast changes to all tabs
- Message routing between components

### Testing
- Click extension icon, verify message sent to content script
- Verify storage changes propagate to all tabs
- Test in Chrome and Firefox

---

## Phase 4: Popup Interface
**Goal**: Quick add/edit interface

### Files to Create
- [ ] `src/popup/popup.html` - Popup layout
- [ ] `src/popup/popup.js` - Popup logic
- [ ] `src/popup/popup.css` - Popup styling

### Popup States
1. Loading - Check current URL
2. Existing - Show saved application, allow edit
3. New - Show form to add application

### Popup Logic
- Get active tab URL
- Check if application exists
- If exists: show details, status dropdown, notes textarea
- If new: scrape page, pre-fill form
- Save/Update/Delete handlers
- Link to dashboard

### Testing
- Click icon on applied job page, verify existing state
- Click icon on new job page, verify pre-filled form
- Update status/notes, verify saved
- Delete application, verify removed
- Test on various job sites

---

## Phase 5: Dashboard
**Goal**: Full application management interface

### Files to Create
- [ ] `src/dashboard/dashboard.html` - Dashboard layout
- [ ] `src/dashboard/dashboard.js` - Dashboard logic
- [ ] `src/dashboard/dashboard.css` - Dashboard styling

### Dashboard Features
- Statistics: total apps, interviewing count, offers, this week
- Search bar: text search across title/company/notes
- Filters: status, date range, domain
- Sort: date applied, title, company
- Card view: each application as card
- Actions: view job, edit, delete

### Dashboard Logic
- Load all applications on init
- Calculate and display stats
- Real-time search with debounce
- Filter and sort pipeline
- Card click handlers (event delegation)
- Empty state when no applications

### Testing
- Add 20+ applications via popup
- Test search functionality
- Test status filter
- Test date filters (today, this week, this month)
- Test sorting options
- Test edit/delete from dashboard
- Performance test with 100+ applications

---

## Phase 6: Export Functionality
**Goal**: Export data to CSV and JSON

### Files to Create
- [ ] `src/export/exporter.js` - Export functions

### Export Features
- Export to JSON (pretty-printed)
- Export to CSV with proper escaping
- Export all or filtered applications
- Download as file with timestamp in name

### Testing
- Export 10 applications to JSON, verify format
- Export to CSV, open in Excel/Sheets
- Test CSV escaping (commas, quotes, newlines in notes)
- Test export with filters applied

---

## Phase 7: Icons and Polish
**Goal**: Branding and visual polish

### Files to Create
- [ ] `icons/icon16.png` - Toolbar icon
- [ ] `icons/icon32.png` - Small icon
- [ ] `icons/icon48.png` - Medium icon
- [ ] `icons/icon128.png` - Store listing icon
- [ ] `README.md` - Installation and usage instructions

### Icon Design
- Simple, recognizable design
- Clear at small sizes
- Professional appearance
- Conveys "job tracking" concept

### Testing
- Verify icons appear correctly in toolbar
- Verify icons in extensions page
- Test on high-DPI displays

---

## Phase 8: Cross-Browser Testing
**Goal**: Ensure compatibility across all browsers

### Testing Matrix
- [ ] Chrome: Install, test all features
- [ ] Firefox: Install with v2 manifest, test all features
- [ ] Edge: Install, test all features
- [ ] Safari: Convert and test (requires macOS)

### Edge Cases
- [ ] Very long job titles (100+ chars)
- [ ] Special characters in company names
- [ ] URLs with 10+ query parameters
- [ ] Pages without clear job title
- [ ] Multiple tabs with same job open
- [ ] Rapid URL changes (SPA navigation)
- [ ] Storage approaching limit

---

## Phase 9: Packaging and Distribution
**Goal**: Prepare for store submission

### Tasks
- [ ] Create packaging script (optional)
- [ ] Package Chrome version with manifest_v3.json
- [ ] Package Firefox version with manifest_v2.json
- [ ] Write store description
- [ ] Create promotional images
- [ ] Submit to Chrome Web Store
- [ ] Submit to Firefox Add-ons
- [ ] Submit to Edge Add-ons

---

## Future Enhancements (Post-MVP)

### Priority 1
- Application reminders (follow up after X days)
- Cloud sync option (Firebase/Supabase)
- Dark mode theme
- Keyboard shortcuts

### Priority 2
- Advanced analytics (success rate, time-to-response)
- Import from CSV/JSON
- Email integration (detect application emails)
- Contact tracking (recruiters, hiring managers)

### Priority 3
- Interview prep notes
- Salary tracking and comparison
- Browser sync (use built-in sync API)
- Mobile companion app

---

## Notes

### URL Normalization Strategy
Remove these tracking params:
- utm_source, utm_medium, utm_campaign, utm_term, utm_content
- fbclid, gclid, ref, source, referrer
- _ga, mc_eid

Sort remaining params, lowercase hostname, remove trailing slash (except root).

### Known Limitations
- Storage limit: chrome.storage.sync has 100KB limit (use storage.local if needed)
- SPA detection may miss some frameworks (polling fallback helps)
- Page scraping may fail on heavily dynamic pages (allow manual entry)
- Safari requires macOS for conversion and testing

### Performance Targets
- Content script load: < 100ms
- Overlay render: < 50ms
- Dashboard load (1000 apps): < 500ms
- Search response: < 300ms (with debounce)

### Security Considerations
- Never store sensitive data (passwords, SSN, etc)
- Always escape user input (XSS prevention)
- Use textContent instead of innerHTML
- CSP: script-src 'self'
