import type enMessages from '../../public/_locales/en/messages.json';

export type MessageKey = keyof typeof enMessages;

export function t(key: MessageKey, substitutions?: string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

export function getUILocale(): string {
  return chrome.i18n.getUILanguage();
}
