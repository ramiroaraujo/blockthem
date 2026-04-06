import { useEffect, useState } from 'react';

import type { BlockRule, StorageState } from '../shared/types';
import { ToggleSwitch } from '../shared/components/ToggleSwitch';
import { t } from '../shared/i18n';
import { verifyPassword } from '../shared/password';
import { isScheduleActive } from '../shared/schedule';
import { getState, setState } from '../shared/storage';
import { DEFAULT_STATE } from '../shared/types';

function getBaseDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function Popup() {
  const [state, setLocalState] = useState<StorageState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);

  useEffect(() => {
    void getState().then((s) => {
      setLocalState(s);
      setLoaded(true);
    });
    void chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => setActiveTab(tabs[0] ?? null));
  }, []);

  const handleToggle = async () => {
    if (state.blockingEnabled && state.passwordHash && state.passwordSalt) {
      setShowPasswordInput(true);
      return;
    }
    await doToggle();
  };

  const doToggle = async () => {
    const newState = { ...state, blockingEnabled: !state.blockingEnabled };
    setLocalState(newState);
    await setState(newState);
    setShowPasswordInput(false);
    setPassword('');
  };

  const handlePasswordSubmit = async () => {
    if (!state.passwordHash || !state.passwordSalt) return;
    const valid = await verifyPassword(
      password,
      state.passwordHash,
      state.passwordSalt,
    );
    if (valid) {
      await doToggle();
    } else {
      setPasswordError(t('popup_password_wrong'));
      setPassword('');
    }
  };

  const openOptions = () => {
    void chrome.runtime.openOptionsPage();
  };

  const tabUrl = activeTab?.url ?? '';
  const currentDomain = tabUrl ? getBaseDomain(tabUrl) : null;
  const isHttp = tabUrl.startsWith('http://') || tabUrl.startsWith('https://');
  const isExtensionPage = tabUrl.startsWith(chrome.runtime.getURL(''));
  const alreadyBlocked =
    currentDomain !== null &&
    state.rules.some((r) => r.type === 'url' && tabUrl.includes(r.pattern));
  const canBlock =
    isHttp && !isExtensionPage && currentDomain !== null && !alreadyBlocked;

  const handleBlockThis = async () => {
    if (!canBlock || !currentDomain || !activeTab?.id) return;
    const newRule: BlockRule = {
      id: crypto.randomUUID(),
      pattern: currentDomain,
      type: 'url',
      enabled: true,
      schedule: null,
      // eslint-disable-next-line react-hooks/purity -- Date.now() is fine inside an event handler
      createdAt: Date.now(),
    };
    const newState: StorageState = {
      ...state,
      rules: [...state.rules, newRule],
      blockingEnabled: true,
    };
    await setState(newState);
    const ruleParam = encodeURIComponent(currentDomain);
    await chrome.tabs.update(activeTab.id, {
      url: chrome.runtime.getURL(
        `src/blocked/index.html?rule=${ruleParam}&type=url`,
      ),
    });
    window.close();
  };

  if (!loaded) return null;

  const ruleCountLabel =
    state.rules.length === 1
      ? t('popup_rule_count_one')
      : t('popup_rule_count_other', [state.rules.length.toString()]);

  const categoryLabels = [
    state.blockAdultSites && t('popup_category_adult'),
    state.blockGamblingSites && t('popup_category_gambling'),
  ].filter(Boolean);

  const pausedBySchedule =
    state.blockingEnabled &&
    state.scheduleEnabled &&
    !isScheduleActive(state.globalSchedule);

  return (
    <div className="box-border w-[280px] bg-bg p-5 font-sans text-text">
      <div className="mb-4 flex items-center gap-2 text-base font-bold text-primary">
        <img src="/icons/icon-48.png" alt="" className="h-5 w-5" />
        BlockThem
      </div>

      {canBlock && (
        <button
          onClick={handleBlockThis}
          className="mb-3 box-border w-full rounded-md border-none bg-primary px-4 py-2.5 font-inherit text-[13px] font-semibold text-white"
          title={t('popup_block_this_title', [currentDomain])}
        >
          {t('popup_block_this')}
        </button>
      )}

      <div className="mb-3 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
        <div>
          <div className="text-[13px]">
            {state.blockingEnabled
              ? t('popup_blocking_on')
              : t('popup_blocking_off')}
            {pausedBySchedule && (
              <span className="ml-1 text-warning">
                · {t('popup_paused_label')}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[11px]">
            {pausedBySchedule ? (
              <span className="text-warning">
                {t('popup_paused_outside_schedule')}
              </span>
            ) : (
              <span className="text-text-muted">
                {ruleCountLabel}
                {categoryLabels.length > 0 && ` · ${categoryLabels.join(', ')}`}
              </span>
            )}
          </div>
        </div>
        <ToggleSwitch enabled={state.blockingEnabled} onClick={handleToggle} />
      </div>

      {showPasswordInput && (
        <div className="mb-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            placeholder={t('popup_password_placeholder')}
            autoFocus
            className={`mb-2 box-border w-full rounded-md border bg-surface px-2.5 py-2 font-inherit text-xs text-text ${
              passwordError ? 'border-error' : 'border-border'
            }`}
          />
          {passwordError && (
            <div className="text-[11px] text-error">{passwordError}</div>
          )}
        </div>
      )}

      <button
        onClick={openOptions}
        className="box-border w-full rounded-md border border-border bg-transparent px-4 py-2 font-inherit text-xs text-text-secondary"
      >
        {t('popup_open_settings')}
      </button>
    </div>
  );
}
