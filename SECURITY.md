# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in JobMemory, please **DO NOT** open a public GitHub issue. Instead, please report it responsibly by sending an email to the project maintainer.

### How to Report
1. Email: [Open a private security report via GitHub](https://github.com/ajinkyawakhale/JobMemory/security/advisories)
2. Include:
   - Description of the vulnerability
   - Steps to reproduce (if applicable)
   - Potential impact
   - Any potential fixes you've identified

### What to Expect
- Acknowledgment of your report within 48 hours
- Detailed investigation and response plan
- Updates on remediation progress
- Credit to the reporter (if desired)

## Security Principles

JobMemory is built with security and privacy in mind:

### ✅ What We Do
- **Local Storage Only** - All data is stored in browser local storage, never sent to external servers
- **No Tracking** - No analytics, telemetry, or user tracking of any kind
- **Open Source** - Full source code is available for review and audit
- **No Authentication** - Works completely offline, no login required
- **No External Dependencies** - Vanilla JavaScript, no third-party libraries
- **Input Validation** - All user input is sanitized to prevent XSS attacks
- **Content Security Policy** - Strict CSP headers to prevent injection attacks

### ❌ What We Don't Do
- Collect personal data
- Send data to external servers
- Store passwords or credentials
- Use cookies or tracking pixels
- Include ads or sponsored content
- Require user accounts

## Browser Permissions

JobMemory requires these permissions:

| Permission | Used For | Why |
|-----------|----------|-----|
| `storage` | Storing your data locally | To save jobs and applications on your computer |
| `activeTab` | Detecting current page | To check if you've already applied to the current job |
| `scripting` | Injecting overlay | To show the duplicate detection alert |
| `<all_urls>` | Running on any website | To work on all job posting websites |

None of this data is transmitted anywhere.

## Data Safety

Your data is yours and yours alone:
- Data is stored only in your browser using the `chrome.storage.local` or `browser.storage.local` API
- You can export your data at any time (CSV or JSON)
- You can delete all data with one click
- Clearing browser data will clear extension data
- No cloud sync or backup (planned as optional in v2.0)

## Privacy Notice

- **No tracking**: We don't use Google Analytics, Mixpanel, or any tracking service
- **No phone home**: The extension doesn't communicate with any external servers
- **No error reporting**: Errors are logged locally only, never sent elsewhere
- **No ads**: There are no ads, pop-ups, or sponsored content
- **Open source**: You can inspect all the code to verify these claims

## Safe Usage Tips

1. **Keep your browser updated** - Security fixes for the browser benefit all extensions
2. **Review permissions** - We only ask for the minimum required
3. **Export regularly** - Backup your data periodically
4. **Read the code** - As open source, you can verify our security claims
5. **Report issues** - Help us improve by reporting security concerns

## Third-Party Dependencies

As of v1.0.0, JobMemory has **zero third-party JavaScript dependencies**. All code is vanilla JavaScript.

## Browser Storage Limits

Note the storage limits on your browser:
- **Chrome**: 10+ MB per extension
- **Firefox**: 10 MB per extension
- **Edge**: 10+ MB per extension
- **Safari**: Varies, typically 5-10 MB

If you hit storage limits, export and clear old data.

## Compliance

- **GDPR**: Fully compliant (no data collection or processing)
- **CCPA**: Fully compliant (no data collection or processing)
- **Data Residency**: All data stays on your device in your home country

## Future Security Considerations

When cloud sync is added in v2.0:
- Will be completely optional
- Will use end-to-end encryption
- Will use established, reputable services (Firebase, Supabase, etc.)
- Will require explicit user consent

## Version History

- **v1.0.0** - Initial release with strong privacy and security defaults

## Questions?

Have security questions? Please refer to this policy or contact the maintainer privately.

---

**Security through transparency.** All code is open source and available for community review.
