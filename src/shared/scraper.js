// Extract text content from element safely
function extractText(selector) {
  const element = document.querySelector(selector);
  if (!element) return '';

  const text = element.textContent || element.innerText || '';
  return text.trim().substring(0, 200);
}

// Extract attribute value safely
function extractAttribute(selector, attribute) {
  const element = document.querySelector(selector);
  if (!element) return '';

  return (element.getAttribute(attribute) || '').trim();
}

// Extract meta tag content
function extractMetaContent(property) {
  const selector = `meta[property="${property}"], meta[name="${property}"]`;
  const element = document.querySelector(selector);
  return (element ? element.getAttribute('content') : '').trim();
}

// Get page title
function getPageTitle() {
  return document.title.trim().substring(0, 200);
}

// Scrape job data from current page
function scrapePage() {
  const data = {
    title: '',
    company: '',
    location: '',
    pageTitle: getPageTitle(),
    domain: window.location.hostname,
    url: window.location.href
  };

  // Try multiple selectors for job title
  const titleSelectors = [
    'h1[itemprop="title"]',
    'h1.job-title',
    'h1.position-title',
    'h1[class*="title"]',
    'meta[property="og:title"]',
    'h1'
  ];

  for (const selector of titleSelectors) {
    let title = '';

    if (selector.includes('meta')) {
      title = extractMetaContent('og:title');
    } else {
      title = extractText(selector);
    }

    if (title && title.length > 3) {
      data.title = title;
      break;
    }
  }

  // Try multiple selectors for company name
  const companySelectors = [
    '[itemprop="hiringOrganization"]',
    '[itemprop="name"]',
    '.company-name',
    '.company',
    'span[class*="company"]',
    'a[class*="company"]',
    '[class*="employer"]',
    'meta[property="og:site_name"]'
  ];

  for (const selector of companySelectors) {
    let company = '';

    if (selector.includes('meta')) {
      company = extractMetaContent('og:site_name');
    } else {
      company = extractText(selector);
    }

    if (company && company.length > 2) {
      data.company = company;
      break;
    }
  }

  // Try multiple selectors for location
  const locationSelectors = [
    '[itemprop="jobLocation"]',
    '[itemprop="location"]',
    '.job-location',
    '.location',
    'span[class*="location"]',
    '[class*="location"]'
  ];

  for (const selector of locationSelectors) {
    const location = extractText(selector);

    if (location && location.length > 2) {
      data.location = location;
      break;
    }
  }

  // Fallback: try to extract from page title if title is empty
  if (!data.title && data.pageTitle) {
    // Remove common suffixes
    let title = data.pageTitle
      .replace(/\s*\|\s*.*/, '') // Remove after pipe
      .replace(/\s*-\s*.*/, '') // Remove after dash
      .trim();

    if (title.length > 3 && !title.toLowerCase().includes('job')) {
      data.title = title;
    }
  }

  // Fallback: extract domain as company if not found
  if (!data.company) {
    data.company = getDomain(data.url)
      .replace('www.', '')
      .replace(/\.com$/i, '')
      .replace(/\./g, ' ')
      .toUpperCase();
  }

  // Clean up extracted data
  data.title = data.title.trim();
  data.company = data.company.trim();
  data.location = data.location.trim();

  return data;
}

// Try to extract salary if available on page
function scrapeSalary() {
  const salarySelectors = [
    '[itemprop="baseSalary"]',
    '.salary',
    '[class*="salary"]',
    'span[class*="salary"]'
  ];

  for (const selector of salarySelectors) {
    const salary = extractText(selector);
    if (salary) return salary;
  }

  return '';
}

// Extract structured data from JSON-LD if available
function extractJsonLd() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const data = {};

  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent);

      if (json['@type'] === 'JobPosting') {
        data.title = json.title || data.title;
        data.company = (json.hiringOrganization && json.hiringOrganization.name) || data.company;
        data.location = (json.jobLocation && json.jobLocation.address && json.jobLocation.address.addressLocality) || data.location;
        data.salary = json.baseSalary || data.salary;
        break;
      }
    } catch (e) {
      // Silently skip invalid JSON
    }
  }

  return data;
}

// Try to find application button/link on page
function findApplicationButton() {
  const buttonSelectors = [
    'button[class*="apply"]',
    'a[class*="apply"]',
    'button:contains("Apply")',
    'a:contains("Apply")',
    '[class*="apply-button"]',
    'button[aria-label*="Apply"]'
  ];

  for (const selector of buttonSelectors) {
    const button = document.querySelector(selector);
    if (button && button.offsetHeight > 0) {
      return button;
    }
  }

  return null;
}

// Enhanced scrape with JSON-LD fallback
function scrapePageEnhanced() {
  const basicData = scrapePage();

  // Try to get JSON-LD data
  const jsonLdData = extractJsonLd();

  // Merge with preference to JSON-LD
  const merged = {
    title: jsonLdData.title || basicData.title,
    company: jsonLdData.company || basicData.company,
    location: jsonLdData.location || basicData.location,
    salary: jsonLdData.salary || scrapeSalary(),
    pageTitle: basicData.pageTitle,
    domain: basicData.domain,
    url: basicData.url
  };

  return merged;
}
