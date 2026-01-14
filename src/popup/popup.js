// Popup state management
let currentApplication = null;
let currentTab = null;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize storage
    await initializeStorage();

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    // Check if application exists for this URL
    await checkApplicationExists();

    // Setup event listeners
    setupEventListeners();
  } catch (error) {
    showErrorState('Error initializing popup: ' + error.message);
  }
});

// Check if application exists for current URL
async function checkApplicationExists() {
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'CHECK_URL'
    });

    if (response.exists && response.application) {
      showExistingState(response.application);
    } else {
      // Scrape page for new application
      await showNewApplicationForm();
    }
  } catch (error) {
    // Content script might not be loaded
    await showNewApplicationForm();
  }
}

// Show existing application state
function showExistingState(application) {
  currentApplication = application;

  // Populate fields
  document.getElementById('existing-title').textContent = application.title || 'N/A';
  document.getElementById('existing-company').textContent = application.company || 'N/A';
  document.getElementById('existing-location').textContent = application.location || 'N/A';
  document.getElementById('existing-date').textContent = formatDate(application.dateApplied);
  document.getElementById('existing-notes').value = application.notes || '';

  // Set status dropdown
  const statusSelect = document.getElementById('existing-status');
  populateStatusDropdown(statusSelect);
  statusSelect.value = application.status;

  // Update badge
  updateStatusBadge(application.status);

  // Show state
  showState('existing-state');
}

// Show new application form
async function showNewApplicationForm() {
  try {
    // Scrape page data
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'SCRAPE_PAGE'
    });

    const scrapedData = response.data || {
      title: '',
      company: '',
      location: '',
      url: currentTab.url
    };

    // Pre-fill form
    document.getElementById('new-title').value = scrapedData.title || '';
    document.getElementById('new-company').value = scrapedData.company || '';
    document.getElementById('new-location').value = scrapedData.location || '';

    // Set status dropdown
    const statusSelect = document.getElementById('new-status');
    populateStatusDropdown(statusSelect);
    statusSelect.value = 'applied';

    showState('new-state');
  } catch (error) {
    // If scraping fails, still show new form
    document.getElementById('new-title').focus();
    const statusSelect = document.getElementById('new-status');
    populateStatusDropdown(statusSelect);
    statusSelect.value = 'applied';
    showState('new-state');
  }
}

// Populate status dropdown
function populateStatusDropdown(selectElement) {
  selectElement.innerHTML = '';
  STATUS_OPTIONS.forEach(status => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = status.label;
    selectElement.appendChild(option);
  });
}

// Update status badge
function updateStatusBadge(status) {
  const badge = document.getElementById('status-badge');
  const label = getStatusLabel(status);
  badge.textContent = label;
  badge.className = 'status-badge status-' + status;
}

// Show/hide states
function showState(stateName) {
  document.querySelectorAll('.state').forEach(state => {
    state.classList.add('hidden');
  });
  const state = document.getElementById(stateName);
  if (state) {
    state.classList.remove('hidden');
  }
}

// Show error state
function showErrorState(message) {
  document.getElementById('error-message').textContent = message;
  showState('error-state');
}

// Setup event listeners
function setupEventListeners() {
  // Existing application actions
  document.getElementById('btn-save-existing').addEventListener('click', saveExistingChanges);
  document.getElementById('btn-delete').addEventListener('click', deleteExistingApplication);
  document.getElementById('btn-view-job').addEventListener('click', viewJob);

  // New application form
  document.getElementById('new-app-form').addEventListener('submit', saveNewApplication);

  // Status change in existing view
  document.getElementById('existing-status').addEventListener('change', (e) => {
    updateStatusBadge(e.target.value);
  });

  // Dashboard link
  document.getElementById('btn-dashboard').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/dashboard/dashboard.html')
    });
  });

  // Retry button
  document.getElementById('btn-retry').addEventListener('click', () => {
    location.reload();
  });
}

// Save existing application changes
async function saveExistingChanges() {
  try {
    const status = document.getElementById('existing-status').value;
    const notes = document.getElementById('existing-notes').value;

    const updated = await updateApplication(currentApplication.id, {
      status: status,
      notes: notes
    });

    currentApplication = updated;
    showSuccessMessage('Changes saved');
  } catch (error) {
    alert('Error saving changes: ' + error.message);
  }
}

// Delete existing application
async function deleteExistingApplication() {
  if (!confirm('Are you sure you want to delete this application record?')) {
    return;
  }

  try {
    await deleteApplication(currentApplication.id);
    showSuccessMessage('Application deleted');

    // Reset form
    setTimeout(() => {
      showNewApplicationForm();
    }, 500);
  } catch (error) {
    alert('Error deleting application: ' + error.message);
  }
}

// Save new application
async function saveNewApplication(e) {
  e.preventDefault();

  const title = document.getElementById('new-title').value.trim();
  if (!title) {
    alert('Job title is required');
    return;
  }

  try {
    const app = await saveApplication({
      title: title,
      company: document.getElementById('new-company').value.trim(),
      location: document.getElementById('new-location').value.trim(),
      status: document.getElementById('new-status').value,
      notes: document.getElementById('new-notes').value.trim(),
      url: currentTab.url
    });

    showSuccessMessage('Application saved');

    // Show existing view
    setTimeout(() => {
      showExistingState(app);
    }, 500);
  } catch (error) {
    alert('Error saving application: ' + error.message);
  }
}

// View job in new tab
function viewJob() {
  if (currentApplication && currentApplication.url) {
    chrome.tabs.create({
      url: currentApplication.url
    });
  }
}

// Show success message
function showSuccessMessage(message) {
  // Brief visual feedback
  const header = document.querySelector('.popup-header');
  if (!header) return;

  const originalHTML = header.innerHTML;
  header.innerHTML = '<span style="color: #4caf50; font-weight: 600;">' + message + '</span>';

  setTimeout(() => {
    header.innerHTML = originalHTML;
  }, 1500);
}
