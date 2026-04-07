import { getDir, t } from '../shared/i18n';

document.documentElement.lang = chrome.i18n.getUILanguage();
document.documentElement.dir = getDir();
document.title = t('blocked_page_title');

const headingEl = document.getElementById('heading');
if (headingEl) headingEl.textContent = t('blocked_heading');
