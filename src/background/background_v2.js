// Background script for Manifest V2 (Firefox)
// Uses browser API instead of chrome API

// Listen for extension installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open onboarding page
    browser.tabs.create({
      url: browser.runtime.getURL('src/dashboard/dashboard.html')
    });
  }
});

// Listen for storage changes and notify all tabs
browser.storage.onChanged.addListener((changes, areaName) => {
  // Broadcast changes to all tabs
  browser.tabs.query({}).then(tabs => {
    tabs.forEach(tab => {
      browser.tabs.sendMessage(
        tab.id,
        {
          action: 'STORAGE_CHANGED',
          changes: changes,
          areaName: areaName
        }
      ).catch(() => {
        // Tab may not have content script loaded, ignore
      });
    });
  });
});

// Handle messages from content scripts and popup
browser.runtime.onMessage.addListener((message, sender) => {
  switch (message.action) {
    case 'SHOW_APPLICATION_DETAILS':
      // Open popup - it will auto-detect the URL and show the application
      browser.browserAction.openPopup();
      return Promise.resolve({ success: true });

    case 'GET_ALL_APPLICATIONS':
      return getAllApplications();

    case 'SAVE_APPLICATION':
      return saveApplication(message.data);

    case 'DELETE_APPLICATION':
      return deleteApplication(message.appId);

    case 'SEARCH_APPLICATIONS':
      return searchApplications(message.query, message.filters);

    default:
      return Promise.resolve({ error: 'Unknown action' });
  }
});
