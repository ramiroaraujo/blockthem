import type { BlockStats } from '../shared/block-stats';
import { computeStatCounts } from '../shared/block-stats';
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
    const stats = (result as { blockStats?: BlockStats }).blockStats;
    const entry = stats?.[domain];
    if (!entry) return;

    const counts = computeStatCounts(entry);

    // Build columns progressively based on history depth
    const columns: { value: number; label: string }[] = [
      { value: counts.today, label: t('stat_label_today') },
    ];

    if (counts.hasMultipleDays) {
      columns.push({ value: counts.week, label: t('stat_label_week') });
    }

    if (counts.hasMultipleWeeks) {
      columns.push({ value: counts.month, label: t('stat_label_month') });
    }

    if (counts.hasMultipleMonths) {
      columns.push({
        value: counts.total,
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
