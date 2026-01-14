// Status options for job applications
const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Phone Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer Received' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'ghosted', label: 'No Response' }
];

// Get status label from value
function getStatusLabel(value) {
  const status = STATUS_OPTIONS.find(s => s.value === value);
  return status ? status.label : value;
}

// Storage keys
const STORAGE_KEYS = {
  APPLICATIONS: 'applications',
  URL_INDEX: 'urlIndex',
  SETTINGS: 'settings',
  STATS: 'stats'
};

// Settings defaults
const DEFAULT_SETTINGS = {
  overlayEnabled: true,
  overlayPosition: 'top',
  theme: 'light',
  notifications: true
};

// Tracking parameters to remove from URLs
const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'ref', 'source', 'referrer', '_ga', 'mc_eid',
  'utm_id', 'utm_content_placement'
];

// Storage area to use
const STORAGE_AREA = 'local'; // 'local' or 'sync'
