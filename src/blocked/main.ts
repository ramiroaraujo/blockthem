import { t } from '../shared/i18n';

document.documentElement.lang = chrome.i18n.getUILanguage();
document.title = t('blocked_page_title');

const headingEl = document.getElementById('heading');
if (headingEl) headingEl.textContent = t('blocked_heading');

const params = new URLSearchParams(window.location.search);
const rulePattern = params.get('rule');
const ruleType = params.get('type');
const category = params.get('category');

const infoEl = document.getElementById('info');
const ruleInfoEl = document.getElementById('rule-info');

if (category) {
  const categoryLabel =
    category === 'adult'
      ? t('blocked_category_adult')
      : category === 'gambling'
        ? t('blocked_category_gambling')
        : category;
  if (infoEl) infoEl.textContent = t('blocked_by_category', [categoryLabel]);
} else if (rulePattern) {
  const decodedPattern = decodeURIComponent(rulePattern);
  if (infoEl) infoEl.textContent = t('blocked_by_rule', [decodedPattern]);
  if (ruleInfoEl) {
    const patternSpan = document.createElement('span');
    patternSpan.className = 'pattern';
    patternSpan.textContent = decodedPattern;
    ruleInfoEl.append(
      document.createTextNode(t('blocked_matched_rule') + ' '),
      patternSpan,
      document.createTextNode(` · ${ruleType?.toUpperCase() ?? 'URL'}`),
    );
    ruleInfoEl.style.display = 'inline-block';
  }
} else if (infoEl) {
  infoEl.textContent = t('blocked_generic');
}
