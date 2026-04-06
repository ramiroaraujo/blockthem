const params = new URLSearchParams(window.location.search);
const rulePattern = params.get('rule');
const ruleType = params.get('type');
const category = params.get('category');

const infoEl = document.getElementById('info');
const ruleInfoEl = document.getElementById('rule-info');

if (category) {
  const labels: Record<string, string> = {
    adult: 'adult content',
    gambling: 'gambling',
  };
  if (infoEl)
    infoEl.textContent = `This site is blocked (${labels[category] ?? category} category)`;
} else if (rulePattern) {
  if (infoEl)
    infoEl.textContent = `${decodeURIComponent(rulePattern)} is on your block list`;
  if (ruleInfoEl) {
    ruleInfoEl.innerHTML = `Matched rule: <span class="pattern">${decodeURIComponent(rulePattern)}</span> · ${ruleType?.toUpperCase() ?? 'URL'}`;
    ruleInfoEl.style.display = 'inline-block';
  }
} else if (infoEl) {
  infoEl.textContent = 'This site is on your block list';
}
