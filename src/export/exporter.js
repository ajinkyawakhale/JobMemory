// Export functionality - utility functions for data export

// Export applications to JSON format
async function exportToJSON(applications = null) {
  const apps = applications || await getAllApplications();

  const dataStr = JSON.stringify(apps, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });

  const filename = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(blob, filename);
}

// Export applications to CSV format
async function exportToCSV(applications = null) {
  const apps = applications || await getAllApplications();

  const headers = ['Job Title', 'Company', 'Location', 'Date Applied', 'Status', 'Domain', 'URL', 'Notes'];

  const rows = apps.map(app => [
    escapeCSV(app.title),
    escapeCSV(app.company),
    escapeCSV(app.location || ''),
    formatDate(app.dateApplied),
    getStatusLabel(app.status),
    app.domain,
    app.url,
    escapeCSV(app.notes || '')
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const filename = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(blob, filename);
}

// Download file to user's computer
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Get export statistics
async function getExportStats(applications = null) {
  const apps = applications || await getAllApplications();

  const stats = {
    totalApplications: apps.length,
    byStatus: {},
    byDomain: {},
    dateRange: {
      earliest: null,
      latest: null
    }
  };

  if (apps.length === 0) {
    return stats;
  }

  // Count by status
  STATUS_OPTIONS.forEach(status => {
    stats.byStatus[status.value] = apps.filter(a => a.status === status.value).length;
  });

  // Count by domain
  apps.forEach(app => {
    stats.byDomain[app.domain] = (stats.byDomain[app.domain] || 0) + 1;
  });

  // Date range
  const dates = apps.map(a => new Date(a.dateApplied)).sort((a, b) => a - b);
  if (dates.length > 0) {
    stats.dateRange.earliest = dates[0].toISOString();
    stats.dateRange.latest = dates[dates.length - 1].toISOString();
  }

  return stats;
}

// Generate export preview/summary
async function generateExportSummary(applications = null) {
  const stats = await getExportStats(applications);
  const apps = applications || await getAllApplications();

  let summary = 'Job Application Export Summary\n';
  summary += '==============================\n\n';

  summary += `Total Applications: ${stats.totalApplications}\n`;

  if (stats.dateRange.earliest) {
    summary += `Date Range: ${formatDate(stats.dateRange.earliest)} to ${formatDate(stats.dateRange.latest)}\n`;
  }

  summary += '\nBreakdown by Status:\n';
  STATUS_OPTIONS.forEach(status => {
    const count = stats.byStatus[status.value] || 0;
    summary += `  ${status.label}: ${count}\n`;
  });

  summary += '\nTop Job Posting Domains:\n';
  const sortedDomains = Object.entries(stats.byDomain)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedDomains.forEach(([domain, count]) => {
    summary += `  ${domain}: ${count}\n`;
  });

  return summary;
}

// Import from JSON
async function importFromJSON(jsonStr) {
  try {
    const apps = JSON.parse(jsonStr);

    if (!Array.isArray(apps)) {
      throw new Error('Invalid JSON format: expected array of applications');
    }

    let imported = 0;
    for (const app of apps) {
      if (app.url && app.title) {
        try {
          await saveApplication(app);
          imported++;
        } catch (e) {
          console.warn('Failed to import application:', e);
        }
      }
    }

    return {
      success: true,
      imported: imported,
      total: apps.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Parse CSV and import
async function importFromCSV(csvStr) {
  try {
    const lines = csvStr.trim().split('\n');

    if (lines.length < 2) {
      throw new Error('CSV must have headers and at least one data row');
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    const titleIdx = headers.findIndex(h => h.toLowerCase().includes('title'));
    const companyIdx = headers.findIndex(h => h.toLowerCase().includes('company'));
    const urlIdx = headers.findIndex(h => h.toLowerCase().includes('url'));
    const statusIdx = headers.findIndex(h => h.toLowerCase().includes('status'));
    const notesIdx = headers.findIndex(h => h.toLowerCase().includes('notes'));

    if (titleIdx === -1 || urlIdx === -1) {
      throw new Error('CSV must have "Job Title" and "URL" columns');
    }

    // Parse data rows
    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length > 0) {
        const app = {
          title: values[titleIdx] || 'Untitled',
          company: companyIdx !== -1 ? values[companyIdx] : '',
          url: values[urlIdx],
          status: statusIdx !== -1 ? values[statusIdx] : 'applied',
          notes: notesIdx !== -1 ? values[notesIdx] : ''
        };

        try {
          await saveApplication(app);
          imported++;
        } catch (e) {
          console.warn('Failed to import row:', e);
        }
      }
    }

    return {
      success: true,
      imported: imported,
      total: lines.length - 1
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Parse CSV line (handles quoted values)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
