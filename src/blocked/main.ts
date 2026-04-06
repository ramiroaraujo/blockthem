const params = new URLSearchParams(window.location.search)
const rulePattern = params.get('rule')
const ruleType = params.get('type')

const infoEl = document.getElementById('info')!
const ruleInfoEl = document.getElementById('rule-info')!

if (rulePattern) {
  infoEl.textContent = `${decodeURIComponent(rulePattern)} is on your block list`
  ruleInfoEl.innerHTML = `Matched rule: <span class="pattern">${decodeURIComponent(rulePattern)}</span> · ${ruleType?.toUpperCase() ?? 'URL'}`
  ruleInfoEl.style.display = 'inline-block'
} else {
  infoEl.textContent = 'This site is on your block list'
}

document.getElementById('back-btn')!.addEventListener('click', () => {
  if (history.length > 1) {
    history.back()
  } else {
    window.close()
  }
})
