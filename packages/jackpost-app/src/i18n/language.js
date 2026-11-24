export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' }
];

const STORAGE_KEY = 'jackpost.language';

const isSupported = (code) => SUPPORTED_LANGUAGES.some((language) => language.code === code);

export const getStoredLanguage = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) return stored;
  } catch (err) {
    // localStorage can be unavailable; fall back to the system language
  }
  return (window.navigator.language || 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
};

export const storeLanguage = (code) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch (err) {
    // the language still applies for this session
  }
};
