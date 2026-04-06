import { chrome } from 'vitest-chrome';

import '@testing-library/jest-dom/vitest';

import enMessages from '../../public/_locales/en/messages.json';

const messages = enMessages as Record<string, { message: string }>;

const i18nOverride = chrome.i18n as {
  getMessage: (key: string, subs?: string | string[]) => string;
  getUILanguage: () => string;
};

i18nOverride.getMessage = (key, subs) => {
  const entry = messages[key];
  if (!entry) return '';
  let msg = entry.message;
  const arr = subs == null ? [] : Array.isArray(subs) ? subs : [subs];
  arr.forEach((value, i) => {
    msg = msg.split(`$${i + 1}`).join(value);
  });
  return msg;
};

i18nOverride.getUILanguage = () => 'en-US';

Object.assign(globalThis, { chrome });
