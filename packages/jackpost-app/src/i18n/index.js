import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './translation/en.json';
import translationRu from './translation/ru.json';
import ruInterface from './translation/ru-ui.json';
import { applyLanguage } from './dom-translator';
import { getStoredLanguage, storeLanguage } from './language';

const resources = {
  en: {
    translation: translationEn
  },
  ru: {
    translation: translationRu
  }
};

// Texts rendered without t(), keyed by their English source
const INTERFACE_DICTIONARIES = {
  en: {},
  ru: ruInterface
};

const initialLanguage = getStoredLanguage();

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',

    ns: 'translation', // Use translation as the default Namespace that will be loaded by default

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

const syncInterface = (code) => {
  document.documentElement.lang = code;
  applyLanguage(INTERFACE_DICTIONARIES[code]);
  if (window.ipcRenderer) {
    window.ipcRenderer.invoke('renderer:set-language', code).catch((err) => console.warn('Failed to translate the app menu', err));
  }
};

export const changeLanguage = async (code) => {
  storeLanguage(code);
  await i18n.changeLanguage(code);
  syncInterface(code);
};

if (document.body) {
  syncInterface(initialLanguage);
} else {
  document.addEventListener('DOMContentLoaded', () => syncInterface(initialLanguage), { once: true });
}

export default i18n;
