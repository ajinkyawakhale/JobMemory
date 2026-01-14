// Background service worker for Manifest V3 (Chrome, Edge, Safari)

// Listen for extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open onboarding page
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/dashboard/dashboard.html')
    });
  }
});

// Listen for storage changes and notify all tabs
chrome.storage.onChanged.addListener((changes, areaName) => {
  // Broadcast changes to all tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'SHOW_APPLICATION_DETAILS':
      // Open popup - it will auto-detect the URL and show the application
      chrome.action.openPopup();
      sendResponse({ success: true });
      break;

    case 'GET_ALL_APPLICATIONS':
      handleGetAllApplications(sendResponse);
      return true; // Async

    case 'SAVE_APPLICATION':
      handleSaveApplication(message.data, sendResponse);
      return true; // Async

    case 'DELETE_APPLICATION':
      handleDeleteApplication(message.appId, sendResponse);
      return true; // Async

    case 'SEARCH_APPLICATIONS':
      handleSearchApplications(message.query, message.filters, sendResponse);
      return true; // Async

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Get all applications
async function handleGetAllApplications(sendResponse) {
  try {
    const apps = await getAllApplications();
    sendResponse({ success: true, data: apps });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Save application
async function handleSaveApplication(appData, sendResponse) {
  try {
    const app = await saveApplication(appData);
    sendResponse({ success: true, data: app });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Delete application
async function handleDeleteApplication(appId, sendResponse) {
  try {
    await deleteApplication(appId);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Search applications
async function handleSearchApplications(query, filters, sendResponse) {
  try {
    const apps = await searchApplications(query, filters);
    sendResponse({ success: true, data: apps });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}
