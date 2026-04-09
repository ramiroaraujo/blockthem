import { getDir, t } from '../shared/i18n';

document.documentElement.lang = chrome.i18n.getUILanguage();
document.documentElement.dir = getDir();
document.title = t('blocked_page_title');

const headingEl = document.getElementById('heading');
if (headingEl) headingEl.textContent = t('blocked_heading');

// Display domain and block stats
const params = new URLSearchParams(location.search);
const domain = params.get('domain');

if (domain) {
  const domainEl = document.getElementById('domain');
  if (domainEl) domainEl.textContent = domain;

  void chrome.storage.local.get('blockStats').then((result) => {
    const stats = (
      result as {
        blockStats?: Record<string, { timestamps: number[] }>;
      }
    ).blockStats;
    const entry = stats?.[domain];
    const timestamps = entry?.timestamps ?? [];
    if (timestamps.length === 0) return;

    const now = new Date();
    const todayStr = now.toDateString();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Start of current week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    let today = 0;
    let week = 0;
    let month = 0;
    let hasMultipleDays = false;
    let hasMultipleWeeks = false;
    let hasMultipleMonths = false;

    for (const ts of timestamps) {
      const d = new Date(ts);
      const isToday = d.toDateString() === todayStr;
      const isThisWeek = ts >= startOfWeek.getTime();
      const isThisMonth =
        d.getFullYear() === currentYear && d.getMonth() === currentMonth;

      if (isToday) today++;
      if (isThisWeek) week++;
      if (isThisMonth) month++;

      if (!isToday) hasMultipleDays = true;
      if (!isThisWeek) hasMultipleWeeks = true;
      if (!isThisMonth) hasMultipleMonths = true;
    }

    // Build columns progressively based on history depth
    const columns: { value: number; label: string }[] = [
      { value: today, label: t('stat_label_today') },
    ];

    if (hasMultipleDays) {
      columns.push({ value: week, label: t('stat_label_week') });
    }

    if (hasMultipleWeeks) {
      columns.push({ value: month, label: t('stat_label_month') });
    }

    if (hasMultipleMonths) {
      columns.push({
        value: timestamps.length,
        label: t('stat_label_total'),
      });
    }

    const statsRow = document.getElementById('stats');
    const statsContainer = document.getElementById('stats-container');
    const statsHeader = document.getElementById('stats-header');
    if (!statsRow || !statsContainer) return;

    if (statsHeader) statsHeader.textContent = t('stat_header_blocked');

    for (const col of columns) {
      const item = document.createElement('div');
      item.className = 'stat-item';

      const value = document.createElement('div');
      value.className = 'stat-value';
      value.textContent = String(col.value);

      const label = document.createElement('div');
      label.className = 'stat-label';
      label.textContent = col.label;

      item.appendChild(value);
      item.appendChild(label);
      statsRow.appendChild(item);
    }

    statsContainer.style.display = '';
  });
}
