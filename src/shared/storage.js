// Get the browser storage API (works in Chrome and Firefox)
function getStorageAPI() {
  return typeof browser !== 'undefined' ? browser.storage : chrome.storage;
}

// Normalize URL by removing tracking params, sorting query params, lowercasing
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);

    // Remove tracking parameters
    TRACKING_PARAMS.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    // Sort remaining query parameters for consistency
    const sortedParams = new URLSearchParams(
      Array.from(urlObj.searchParams.entries()).sort()
    );

    // Build normalized URL
    let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;

    // Remove trailing slash (unless root)
    if (normalized.endsWith('/') && urlObj.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }

    // Add sorted params if any
    const paramStr = sortedParams.toString();
    if (paramStr) {
      normalized += '?' + paramStr;
    }

    return normalized.toLowerCase();
  } catch (e) {
    return url.toLowerCase();
  }
}

// Hash URL using SHA-256
async function hashUrl(url) {
  const normalized = normalizeUrl(url);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (e) {
    // Fallback for unsupported environments
    return btoa(normalized).substring(0, 32);
  }
}

// Get storage data
async function getStorage(keys = null) {
  return new Promise((resolve, reject) => {
    const storage = getStorageAPI()[STORAGE_AREA];

    storage.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

// Set storage data
async function setStorage(data) {
  return new Promise((resolve, reject) => {
    const storage = getStorageAPI()[STORAGE_AREA];

    storage.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Save application to storage
async function saveApplication(app) {
  // Generate ID if new
  if (!app.id) {
    app.id = generateUUID();
  }

  // Set timestamps
  app.dateApplied = app.dateApplied || getISOTimestamp();
  app.dateModified = getISOTimestamp();

  // Normalize and hash URL
  app.url = normalizeUrl(app.url);
  app.urlHash = await hashUrl(app.url);

  // Set default values
  if (!app.status) app.status = 'applied';
  if (!app.domain) app.domain = getDomain(app.url);

  // Get existing data
  const data = await getStorage([STORAGE_KEYS.APPLICATIONS, STORAGE_KEYS.URL_INDEX, STORAGE_KEYS.STATS]);
  const applications = data[STORAGE_KEYS.APPLICATIONS] || {};
  const urlIndex = data[STORAGE_KEYS.URL_INDEX] || {};
  const stats = data[STORAGE_KEYS.STATS] || { totalApplications: 0, lastSync: null };

  // Check if this URL already exists (by hash)
  const existingId = urlIndex[app.urlHash];
  if (existingId && existingId !== app.id) {
    // URL already exists, update existing record
    const existing = applications[existingId];
    app.id = existingId;
    app.dateApplied = existing.dateApplied; // Keep original date
  }

  // Save application
  applications[app.id] = app;
  urlIndex[app.urlHash] = app.id;

  // Update stats
  stats.totalApplications = Object.keys(applications).length;
  stats.lastSync = getISOTimestamp();

  // Save to storage
  const storageUpdate = {
    [STORAGE_KEYS.APPLICATIONS]: applications,
    [STORAGE_KEYS.URL_INDEX]: urlIndex,
    [STORAGE_KEYS.STATS]: stats
  };

  await setStorage(storageUpdate);
  return app;
}

// Get application by URL
async function getApplicationByUrl(url) {
  const hash = await hashUrl(url);
  const data = await getStorage([STORAGE_KEYS.URL_INDEX, STORAGE_KEYS.APPLICATIONS]);
  const urlIndex = data[STORAGE_KEYS.URL_INDEX] || {};
  const applications = data[STORAGE_KEYS.APPLICATIONS] || {};

  const appId = urlIndex[hash];
  if (appId) {
    return applications[appId] || null;
  }
  return null;
}

// Get application by ID
async function getApplicationById(id) {
  const data = await getStorage([STORAGE_KEYS.APPLICATIONS]);
  const applications = data[STORAGE_KEYS.APPLICATIONS] || {};
  return applications[id] || null;
}

// Get all applications
async function getAllApplications() {
  const data = await getStorage([STORAGE_KEYS.APPLICATIONS]);
  const applications = data[STORAGE_KEYS.APPLICATIONS] || {};
  return Object.values(applications);
}

// Update application
async function updateApplication(id, updates) {
  const app = await getApplicationById(id);
  if (!app) {
    throw new Error(`Application with ID ${id} not found`);
  }

  const updated = merge(app, updates);
  return saveApplication(updated);
}

// Delete application
async function deleteApplication(id) {
  const app = await getApplicationById(id);
  if (!app) {
    return; // Already deleted
  }

  const data = await getStorage([STORAGE_KEYS.APPLICATIONS, STORAGE_KEYS.URL_INDEX, STORAGE_KEYS.STATS]);
  const applications = data[STORAGE_KEYS.APPLICATIONS] || {};
  const urlIndex = data[STORAGE_KEYS.URL_INDEX] || {};
  const stats = data[STORAGE_KEYS.STATS] || {};

  // Remove from applications
  delete applications[id];

  // Remove from URL index
  const hash = app.urlHash;
  if (urlIndex[hash] === id) {
    delete urlIndex[hash];
  }

  // Update stats
  stats.totalApplications = Object.keys(applications).length;
  stats.lastSync = getISOTimestamp();

  // Save to storage
  const storageUpdate = {
    [STORAGE_KEYS.APPLICATIONS]: applications,
    [STORAGE_KEYS.URL_INDEX]: urlIndex,
    [STORAGE_KEYS.STATS]: stats
  };

  await setStorage(storageUpdate);
}

// Search applications
async function searchApplications(query = '', filters = {}) {
  let apps = await getAllApplications();

  // Text search
  if (query) {
    const lowerQuery = query.toLowerCase();
    apps = apps.filter(app =>
      app.title.toLowerCase().includes(lowerQuery) ||
      app.company.toLowerCase().includes(lowerQuery) ||
      (app.notes && app.notes.toLowerCase().includes(lowerQuery)) ||
      app.domain.toLowerCase().includes(lowerQuery)
    );
  }

  // Status filter
  if (filters.status) {
    apps = apps.filter(app => app.status === filters.status);
  }

  // Domain filter
  if (filters.domain) {
    apps = apps.filter(app => app.domain === filters.domain);
  }

  // Date range filter
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    apps = apps.filter(app => new Date(app.dateApplied) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    apps = apps.filter(app => new Date(app.dateApplied) <= toDate);
  }

  // Apply date shortcuts
  if (filters.dateRange === 'today') {
    const today = getStartOfToday();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    apps = apps.filter(app => {
      const appDate = new Date(app.dateApplied);
      return appDate >= new Date(today) && appDate < tomorrow;
    });
  } else if (filters.dateRange === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    apps = apps.filter(app => new Date(app.dateApplied) >= weekAgo);
  } else if (filters.dateRange === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    apps = apps.filter(app => new Date(app.dateApplied) >= monthAgo);
  }

  return apps;
}

// Get statistics
async function getStatistics() {
  const apps = await getAllApplications();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    totalApplications: apps.length,
    applicationsThisWeek: apps.filter(a => new Date(a.dateApplied) >= weekAgo).length,
    byStatus: {},
    byDomain: {}
  };

  // Count by status
  STATUS_OPTIONS.forEach(status => {
    stats.byStatus[status.value] = apps.filter(a => a.status === status.value).length;
  });

  // Count by domain
  apps.forEach(app => {
    stats.byDomain[app.domain] = (stats.byDomain[app.domain] || 0) + 1;
  });

  return stats;
}

// Clear all data (use with caution)
async function clearAllData() {
  const storage = getStorageAPI()[STORAGE_AREA];
  return new Promise((resolve, reject) => {
    storage.clear(() => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Export data
async function exportData(format = 'json', filtered = false, filterParams = {}) {
  let apps = filtered ? await searchApplications('', filterParams) : await getAllApplications();

  if (format === 'json') {
    return JSON.stringify(apps, null, 2);
  } else if (format === 'csv') {
    const headers = ['Job Title', 'Company', 'Location', 'Date Applied', 'Status', 'Domain', 'URL', 'Notes'];
    const rows = apps.map(app => [
      escapeCSV(app.title),
      escapeCSV(app.company),
      escapeCSV(app.location),
      formatDate(app.dateApplied),
      getStatusLabel(app.status),
      app.domain,
      app.url,
      escapeCSV(app.notes)
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csv;
  }

  throw new Error(`Unsupported format: ${format}`);
}

// Initialize storage (create default structure if needed)
async function initializeStorage() {
  const data = await getStorage();

  if (isEmpty(data)) {
    await setStorage({
      [STORAGE_KEYS.APPLICATIONS]: {},
      [STORAGE_KEYS.URL_INDEX]: {},
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
      [STORAGE_KEYS.STATS]: { totalApplications: 0, lastSync: null }
    });
  }
}
