// Manage overlay visibility and interaction
let overlayElement = null;

// Create overlay element
function createOverlay(application) {
  const overlay = document.createElement('div');
  overlay.id = 'job-tracker-overlay-' + application.id;
  overlay.className = 'job-tracker-overlay';
  overlay.setAttribute('data-app-id', application.id);

  const dateApplied = formatDate(application.dateApplied);
  const statusLabel = getStatusLabel(application.status);

  overlay.innerHTML = `
    <div class="job-tracker-overlay-content">
      <div class="job-tracker-overlay-icon">✓</div>
      <div class="job-tracker-overlay-text">
        <strong>You already applied to this job</strong>
        <span>Applied on ${dateApplied}</span>
        <span class="status-badge status-${application.status}">${statusLabel}</span>
      </div>
      <div class="job-tracker-overlay-actions">
        <button class="job-tracker-btn job-tracker-btn-view" data-app-id="${application.id}">
          View Details
        </button>
        <button class="job-tracker-btn-close job-tracker-btn-close-overlay" data-app-id="${application.id}">
          ×
        </button>
      </div>
    </div>
  `;

  return overlay;
}

// Show overlay on page
function showOverlay(application, position = 'top') {
  // Remove existing overlay first
  removeOverlay();

  const overlay = createOverlay(application);

  if (position === 'bottom') {
    overlay.classList.add('job-tracker-overlay-bottom');
  }

  document.body.insertBefore(overlay, document.body.firstChild);
  overlayElement = overlay;

  attachOverlayListeners(overlay);
}

// Remove overlay from page
function removeOverlay() {
  const existing = document.getElementById('job-tracker-overlay-' + (overlayElement?.dataset.appId || ''));
  if (existing) {
    existing.remove();
    overlayElement = null;
  }

  // Also remove any other overlays (shouldn't happen but be safe)
  document.querySelectorAll('[id^="job-tracker-overlay-"]').forEach(el => el.remove());
}

// Attach event listeners to overlay
function attachOverlayListeners(overlay) {
  const appId = overlay.getAttribute('data-app-id');

  // View Details button
  const viewBtn = overlay.querySelector('.job-tracker-btn-view');
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      // Send message to background to open popup with this app
      chrome.runtime.sendMessage({
        action: 'SHOW_APPLICATION_DETAILS',
        appId: appId
      }, (response) => {
        // Popup will handle the display
      });
    });
  }

  // Close button
  const closeBtn = overlay.querySelector('.job-tracker-btn-close-overlay');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      removeOverlay();
    });
  }

  // Allow clicking on overlay to view details
  overlay.addEventListener('click', (e) => {
    if (
      !e.target.closest('.job-tracker-btn-close-overlay') &&
      e.target.closest('.job-tracker-overlay-text')
    ) {
      viewBtn?.click();
    }
  });
}

// Check current URL and show overlay if already applied
async function checkAndShowOverlay() {
  try {
    const currentUrl = window.location.href;
    const application = await getApplicationByUrl(currentUrl);

    if (application) {
      // Get settings to check if overlay is enabled
      const data = await getStorage([STORAGE_KEYS.SETTINGS]);
      const settings = data[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;

      if (settings.overlayEnabled) {
        showOverlay(application, settings.overlayPosition);
      }
    }
  } catch (e) {
    console.error('Error checking URL:', e);
  }
}

// Refresh overlay when storage changes
function setupStorageListener() {
  if (typeof browser !== 'undefined') {
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === STORAGE_AREA) {
        // Recheck current URL
        checkAndShowOverlay();
      }
    });
  } else if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === STORAGE_AREA) {
        // Recheck current URL
        checkAndShowOverlay();
      }
    });
  }
}

// Monitor URL changes for SPAs
function setupURLChangeListener() {
  let lastUrl = window.location.href;

  // Method 1: Intercept History API
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    onUrlChange();
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    onUrlChange();
  };

  // Method 2: Listen to popstate
  window.addEventListener('popstate', onUrlChange);

  // Method 3: Polling fallback (for sites that don't use History API)
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      onUrlChange();
    }
  }, 1000);

  async function onUrlChange() {
    const currentUrl = window.location.href;

    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      // Wait a bit for page content to load
      setTimeout(() => {
        checkAndShowOverlay();
      }, 500);
    }
  }
}

// Listen for messages from popup/background
function setupMessageListener() {
  if (typeof browser !== 'undefined') {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message, sendResponse);
      return true;
    });
  } else if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message, sendResponse);
      return true;
    });
  }
}

function handleMessage(message, sendResponse) {
  switch (message.action) {
    case 'GET_CURRENT_URL':
      sendResponse({
        url: window.location.href,
        title: document.title
      });
      break;

    case 'SCRAPE_PAGE':
      const scrapedData = scrapePageEnhanced();
      sendResponse({
        success: true,
        data: scrapedData
      });
      break;

    case 'CHECK_URL':
      getApplicationByUrl(window.location.href).then(app => {
        sendResponse({
          exists: !!app,
          application: app || null
        });
      });
      return true; // Async

    case 'REFRESH_OVERLAY':
      checkAndShowOverlay();
      sendResponse({ success: true });
      break;

    case 'REMOVE_OVERLAY':
      removeOverlay();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
}

// Initialize when content script loads
async function initializeContentScript() {
  try {
    // Initialize storage if needed
    await initializeStorage();

    // Check current URL immediately
    await checkAndShowOverlay();

    // Setup listeners
    setupStorageListener();
    setupURLChangeListener();
    setupMessageListener();
  } catch (e) {
    console.error('Error initializing content script:', e);
  }
}

// Run initialization
initializeContentScript();
