// Dashboard state
let allApplications = [];
let displayedApplications = [];
let editingAppId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeStorage();
    await loadApplications();
    setupEventListeners();
    renderDashboard();
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showErrorMessage('Error loading dashboard');
  }
});

// Load applications from storage
async function loadApplications() {
  allApplications = await getAllApplications();
  displayedApplications = [...allApplications];
}

// Setup event listeners
function setupEventListeners() {
  // Search
  document.getElementById('search-input').addEventListener('input',
    debounce(handleSearch, 300)
  );

  // Filters
  document.getElementById('filter-status').addEventListener('change', applyFilters);
  document.getElementById('filter-date').addEventListener('change', applyFilters);
  document.getElementById('sort-by').addEventListener('change', applySorting);

  // Reset filters
  document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);

  // Export
  document.getElementById('btn-export').addEventListener('click', showExportModal);

  // Clear all
  document.getElementById('btn-clear-all').addEventListener('click', clearAllData);

  // Card actions
  document.addEventListener('click', handleCardAction);

  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', closeAllModals);
  });

  // Empty state button
  document.getElementById('btn-try-now').addEventListener('click', closeAllModals);

  // Populate status filter
  populateStatusFilter();
}

// Populate status filter dropdown
function populateStatusFilter() {
  const select = document.getElementById('filter-status');
  select.innerHTML = '<option value="">All Statuses</option>';

  STATUS_OPTIONS.forEach(status => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = status.label;
    select.appendChild(option);
  });
}

// Render dashboard
async function renderDashboard() {
  showLoadingState();

  // Wait a bit for visual feedback
  await new Promise(resolve => setTimeout(resolve, 100));

  // Calculate and display stats
  await updateStatistics();

  // Render applications
  if (displayedApplications.length === 0) {
    showEmptyState();
  } else {
    showApplicationsState();
    renderApplicationCards();
  }
}

// Update statistics
async function updateStatistics() {
  const stats = await getStatistics();

  document.getElementById('stat-total').textContent = stats.totalApplications;

  const interviewing = (stats.byStatus.screening || 0) + (stats.byStatus.interviewing || 0);
  document.getElementById('stat-interviewing').textContent = interviewing;

  const offers = stats.byStatus.offer || 0;
  document.getElementById('stat-offers').textContent = offers;

  document.getElementById('stat-week').textContent = stats.applicationsThisWeek;
}

// Render application cards
function renderApplicationCards() {
  const container = document.getElementById('applications-container');
  container.innerHTML = '';

  displayedApplications.forEach(app => {
    const card = createApplicationCard(app);
    container.appendChild(card);
  });
}

// Create application card element
function createApplicationCard(app) {
  const card = document.createElement('div');
  card.className = 'app-card';
  card.dataset.appId = app.id;

  const statusLabel = getStatusLabel(app.status);

  let notesHTML = '';
  if (app.notes) {
    notesHTML = `<p class="app-notes">${escapeHtml(app.notes)}</p>`;
  }

  card.innerHTML = `
    <div class="app-card-header">
      <h3 class="app-title">${escapeHtml(app.title)}</h3>
      <span class="status-badge status-${app.status}">${statusLabel}</span>
    </div>
    <div class="app-card-body">
      <div class="app-info">
        <div class="app-info-item">
          <span>🏢</span>
          <span class="app-company">${escapeHtml(app.company)}</span>
        </div>
        <div class="app-info-item">
          <span>📅</span>
          <span>${formatDate(app.dateApplied)}</span>
        </div>
        <div class="app-info-item">
          <span>🌐</span>
          <span>${app.domain}</span>
        </div>
      </div>
      ${notesHTML}
    </div>
    <div class="app-card-footer">
      <button class="app-card-btn btn-view-job" data-app-id="${app.id}">
        <a href="${app.url}" target="_blank" style="color: inherit;">View Job</a>
      </button>
      <button class="app-card-btn btn-edit" data-app-id="${app.id}">Edit</button>
      <button class="app-card-btn app-card-btn-danger btn-delete" data-app-id="${app.id}">Delete</button>
    </div>
  `;

  return card;
}

// Handle card action clicks
function handleCardAction(e) {
  const editBtn = e.target.closest('.btn-edit');
  if (editBtn) {
    const appId = editBtn.dataset.appId;
    showEditModal(appId);
    return;
  }

  const deleteBtn = e.target.closest('.btn-delete');
  if (deleteBtn) {
    const appId = deleteBtn.dataset.appId;
    deleteApplicationConfirm(appId);
    return;
  }
}

// Show edit modal
async function showEditModal(appId) {
  const app = await getApplicationById(appId);
  if (!app) return;

  editingAppId = appId;

  const form = `
    <form id="edit-form">
      <div style="margin-bottom: 16px;">
        <label for="edit-title">Job Title</label>
        <input type="text" id="edit-title" value="${escapeHtml(app.title)}" required>
      </div>

      <div style="margin-bottom: 16px;">
        <label for="edit-company">Company</label>
        <input type="text" id="edit-company" value="${escapeHtml(app.company)}">
      </div>

      <div style="margin-bottom: 16px;">
        <label for="edit-location">Location</label>
        <input type="text" id="edit-location" value="${escapeHtml(app.location)}">
      </div>

      <div style="margin-bottom: 16px;">
        <label for="edit-status">Status</label>
        <select id="edit-status"></select>
      </div>

      <div style="margin-bottom: 16px;">
        <label for="edit-notes">Notes</label>
        <textarea id="edit-notes">${escapeHtml(app.notes)}</textarea>
      </div>

      <div style="display: flex; gap: 12px;">
        <button type="submit" class="btn btn-primary" style="flex: 1;">Save</button>
        <button type="button" class="btn btn-secondary modal-close" style="flex: 1;">Cancel</button>
      </div>
    </form>
  `;

  document.getElementById('edit-modal').querySelector('.modal-body').innerHTML = form;

  // Populate status dropdown
  const statusSelect = document.getElementById('edit-status');
  STATUS_OPTIONS.forEach(status => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = status.label;
    option.selected = status.value === app.status;
    statusSelect.appendChild(option);
  });

  // Add form submit handler
  document.getElementById('edit-form').addEventListener('submit', saveEditedApplication);

  // Show modal
  document.getElementById('edit-modal').classList.remove('hidden');
}

// Save edited application
async function saveEditedApplication(e) {
  e.preventDefault();

  try {
    const updated = await updateApplication(editingAppId, {
      title: document.getElementById('edit-title').value.trim(),
      company: document.getElementById('edit-company').value.trim(),
      location: document.getElementById('edit-location').value.trim(),
      status: document.getElementById('edit-status').value,
      notes: document.getElementById('edit-notes').value.trim()
    });

    // Update in local array
    const index = allApplications.findIndex(a => a.id === editingAppId);
    if (index !== -1) {
      allApplications[index] = updated;
      displayedApplications[displayedApplications.findIndex(a => a.id === editingAppId)] = updated;
    }

    closeAllModals();
    await renderDashboard();
  } catch (error) {
    alert('Error saving application: ' + error.message);
  }
}

// Delete application with confirmation
function deleteApplicationConfirm(appId) {
  if (!confirm('Are you sure you want to delete this application?')) {
    return;
  }

  deleteApplicationNow(appId);
}

// Delete application
async function deleteApplicationNow(appId) {
  try {
    await deleteApplication(appId);

    // Remove from local arrays
    allApplications = allApplications.filter(a => a.id !== appId);
    displayedApplications = displayedApplications.filter(a => a.id !== appId);

    await renderDashboard();
  } catch (error) {
    alert('Error deleting application: ' + error.message);
  }
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  applyFilters();
}

// Apply filters and search
function applyFilters() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  const dateFilter = document.getElementById('filter-date').value;

  let filtered = allApplications;

  // Text search
  if (query) {
    filtered = filtered.filter(app =>
      app.title.toLowerCase().includes(query) ||
      app.company.toLowerCase().includes(query) ||
      (app.notes && app.notes.toLowerCase().includes(query)) ||
      app.domain.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter) {
    filtered = filtered.filter(app => app.status === statusFilter);
  }

  // Date filter
  if (dateFilter) {
    const now = new Date();
    const appDate = new Date();

    filtered = filtered.filter(app => {
      const appDateObj = new Date(app.dateApplied);

      if (dateFilter === 'today') {
        return appDateObj.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return appDateObj >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return appDateObj >= monthAgo;
      }
      return true;
    });
  }

  displayedApplications = filtered;
  applySorting();
}

// Apply sorting
function applySorting() {
  const sortBy = document.getElementById('sort-by').value;

  const sorted = [...displayedApplications].sort((a, b) => {
    switch (sortBy) {
      case 'dateDesc':
        return new Date(b.dateApplied) - new Date(a.dateApplied);
      case 'dateAsc':
        return new Date(a.dateApplied) - new Date(b.dateApplied);
      case 'titleAsc':
        return a.title.localeCompare(b.title);
      case 'companyAsc':
        return a.company.localeCompare(b.company);
      default:
        return 0;
    }
  });

  displayedApplications = sorted;
  renderApplicationCards();
}

// Reset filters
function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-status').value = '';
  document.getElementById('filter-date').value = '';
  document.getElementById('sort-by').value = 'dateDesc';

  displayedApplications = [...allApplications];
  applySorting();
}

// Show export modal
function showExportModal() {
  document.getElementById('export-modal').classList.remove('hidden');
}

// Export JSON
document.addEventListener('click', async (e) => {
  if (e.target.id === 'export-json') {
    const filtered = document.getElementById('export-filtered').checked;
    const apps = filtered ? displayedApplications : allApplications;

    const json = JSON.stringify(apps, null, 2);
    downloadFile(json, `job-applications-${getDateForFile()}.json`, 'application/json');

    closeAllModals();
  }

  if (e.target.id === 'export-csv') {
    const filtered = document.getElementById('export-filtered').checked;
    const apps = filtered ? displayedApplications : allApplications;

    const csv = generateCSV(apps);
    downloadFile(csv, `job-applications-${getDateForFile()}.csv`, 'text/csv');

    closeAllModals();
  }
});

// Generate CSV
function generateCSV(apps) {
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

  const lines = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ];

  return lines.join('\n');
}

// Download file
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Get date for filename
function getDateForFile() {
  return new Date().toISOString().split('T')[0];
}

// Clear all data
async function clearAllData() {
  if (!confirm('Are you sure you want to delete ALL applications? This cannot be undone.')) {
    return;
  }

  if (!confirm('This will permanently delete all your application records. Are you absolutely sure?')) {
    return;
  }

  try {
    await clearAllData();
    allApplications = [];
    displayedApplications = [];
    await renderDashboard();
  } catch (error) {
    alert('Error clearing data: ' + error.message);
  }
}

// Close all modals
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
}

// Show/hide states
function showLoadingState() {
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('applications-container').classList.add('hidden');
}

function showEmptyState() {
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('empty-state').classList.remove('hidden');
  document.getElementById('applications-container').classList.add('hidden');
}

function showApplicationsState() {
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('applications-container').classList.remove('hidden');
}

// Show error message
function showErrorMessage(message) {
  const container = document.getElementById('applications-container');
  container.innerHTML = `<div style="color: #d32f2f; padding: 20px;">${message}</div>`;
  showApplicationsState();
}
