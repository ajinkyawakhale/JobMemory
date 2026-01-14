// Main content script - handles messaging and coordination
// Note: overlay.js is loaded before this file and handles the actual overlay logic

// Keep content script alive by responding to pings
if (typeof browser !== 'undefined') {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'PING') {
      sendResponse({ pong: true });
    }
  });
} else if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'PING') {
      sendResponse({ pong: true });
    }
  });
}
