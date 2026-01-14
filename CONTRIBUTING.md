# Contributing to JobMemory

Thank you for your interest in contributing to JobMemory! We welcome contributions from everyone. Please take a moment to read this guide.

## Code of Conduct

Be respectful and constructive in all interactions. We're building a tool for job seekers - let's be supportive and kind.

## How to Contribute

### Reporting Bugs
1. Check the [existing issues](https://github.com/ajinkyawakhale/JobMemory/issues) first
2. If the bug hasn't been reported, create a new issue using the bug report template
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS information
   - Screenshots if applicable

### Suggesting Features
1. Check the [existing issues](https://github.com/ajinkyawakhale/JobMemory/issues) and [roadmap](README.md#roadmap)
2. Create a new issue using the feature request template
3. Explain:
   - The problem it solves
   - How you envision the feature working
   - Why it would benefit users
   - Any alternative approaches

### Submitting Code

**Fork and Clone**
```bash
git clone https://github.com/YOUR_USERNAME/JobMemory.git
cd JobMemory
```

**Create a Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Make Your Changes**
- Keep commits small and focused
- Write clear commit messages
- Test your changes in multiple browsers if possible
- Don't modify files outside the scope of your change

**Test Your Code**
1. Load the unpacked extension in your browser
2. Test the feature/fix thoroughly
3. Check the browser console for errors (F12)
4. Test on different browsers if possible

**Commit and Push**
```bash
git add .
git commit -m "Brief description of changes"
git push origin feature/your-feature-name
```

**Create a Pull Request**
1. Go to the original repository
2. Click "New Pull Request"
3. Select your branch
4. Describe what your PR does
5. Link related issues using `#issue-number`
6. Submit the PR

## Code Style Guidelines

### JavaScript
- Use `const` and `let`, avoid `var`
- Use clear variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Use async/await instead of callbacks when possible

### HTML/CSS
- Use semantic HTML elements
- Keep CSS organized and maintainable
- Use consistent indentation (2 spaces)
- Comment CSS sections

### File Structure
Follow the existing structure:
```
src/
├── background/     # Service workers
├── content/        # Content scripts & overlays
├── popup/          # Popup interface
├── dashboard/      # Dashboard interface
├── shared/         # Shared utilities
└── export/         # Export functions
```

## Testing Checklist

Before submitting a PR, ensure:
- [ ] Feature works as intended
- [ ] No console errors
- [ ] Tested in Chrome
- [ ] Tested in Firefox (if applicable)
- [ ] Existing features still work
- [ ] Code follows style guidelines
- [ ] Commit messages are clear

## Development Setup

### Prerequisites
- Modern browser (Chrome, Firefox, Edge, or Safari)
- Python 3 (for icon generation)

### Load Extension for Testing
**Chrome/Edge:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder

**Firefox:**
1. Open `about:debugging`
2. Click "Load Temporary Add-on"
3. Select `manifest_v2.json`

### Generate Icons (if modified)
```bash
python3 generate_icons.py
```

## Project Structure Overview

- **manifest_v2.json** - Firefox extension manifest
- **manifest_v3.json** - Chrome/Edge/Safari manifest
- **src/shared/** - Core utilities (storage, constants, utils)
- **src/content/** - Content script injection (overlay detection)
- **src/background/** - Background service worker (lifecycle, messaging)
- **src/popup/** - Extension popup interface
- **src/dashboard/** - Full application dashboard
- **src/export/** - Export functionality (CSV, JSON)

## Areas for Contribution

### High Priority
- [ ] Save jobs feature (planned v2.0)
- [ ] Auto-scraping job details
- [ ] Browser storage optimization
- [ ] Firefox/Safari testing

### Medium Priority
- [ ] Interview prep notes
- [ ] Salary tracking
- [ ] Email notifications
- [ ] Search improvements

### Low Priority
- [ ] UI/UX improvements
- [ ] Dark mode theme
- [ ] Localization (other languages)
- [ ] Performance optimization

## Questions?

- Check the [README.md](README.md) and [implementation.md](implementation.md)
- Look at existing code and comments
- Open an issue to discuss before starting major work

## Recognition

All contributors will be recognized in the project! Thank you for making JobMemory better.

---

Happy coding! 🚀
