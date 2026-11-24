const { ipcMain, Menu } = require('electron');
const menuTemplate = require('./menu-template');

const SUPPORTED_LANGUAGES = ['en', 'ru'];

// Labels keyed by the English label, or by role for items that only declare a role
const RU_LABELS = {
  'Collection': 'Коллекция',
  'Open Collection': 'Открыть коллекцию',
  'Open Recent': 'Недавние',
  'Clear Recent': 'Очистить список',
  'Quit': 'Выйти',
  'Force Quit': 'Завершить принудительно',
  'Edit': 'Правка',
  'View': 'Вид',
  'Actual Size': 'Реальный размер',
  'Zoom In': 'Увеличить',
  'Zoom Out': 'Уменьшить',
  'About Jackpost': 'О Jackpost',
  'Check for Updates…': 'Проверить обновления…',
  'undo': 'Отменить',
  'redo': 'Повторить',
  'cut': 'Вырезать',
  'copy': 'Копировать',
  'paste': 'Вставить',
  'selectAll': 'Выделить всё',
  'hide': 'Скрыть Jackpost',
  'hideOthers': 'Скрыть остальные',
  'toggledevtools': 'Инструменты разработчика',
  'togglefullscreen': 'Полноэкранный режим',
  'window': 'Окно',
  'minimize': 'Свернуть',
  'close': 'Закрыть окно',
  'help': 'Справка'
};

const DICTIONARIES = { en: {}, ru: RU_LABELS };

const localizeItems = (items, dictionary) => items.map((item) => {
  const translated = dictionary[item.label] || (!item.label && dictionary[item.role]);
  const localized = translated ? { ...item, label: translated } : { ...item };
  if (Array.isArray(item.submenu)) localized.submenu = localizeItems(item.submenu, dictionary);
  return localized;
});

const buildLocalizedMenu = (language) => Menu.buildFromTemplate(localizeItems(menuTemplate, DICTIONARIES[language] || {}));

const setMenuLanguage = (language) => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  Menu.setApplicationMenu(buildLocalizedMenu(language));
};

const registerMenuLanguageIpc = () => {
  ipcMain.handle('renderer:set-language', (event, language) => setMenuLanguage(language));
};

module.exports = { buildLocalizedMenu, setMenuLanguage, registerMenuLanguageIpc };
