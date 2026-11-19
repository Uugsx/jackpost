const { app } = require('electron');
const fetch = require('node-fetch');

const LATEST_RELEASE_URL = 'https://api.github.com/repos/Uugsx/jackpost/releases/latest';
const REQUEST_TIMEOUT_MS = 10000;

const parseVersion = (version) => String(version).replace(/^v/i, '').split('-')[0].split('.').map((part) => parseInt(part, 10) || 0);

const isNewerVersion = (candidate, current) => {
  const next = parseVersion(candidate);
  const installed = parseVersion(current);
  const length = Math.max(next.length, installed.length);
  for (let i = 0; i < length; i++) {
    const diff = (next[i] || 0) - (installed[i] || 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
};

const fetchLatestRelease = async () => {
  const response = await fetch(LATEST_RELEASE_URL, {
    headers: { Accept: 'application/vnd.github+json' },
    timeout: REQUEST_TIMEOUT_MS
  });
  if (!response.ok) {
    throw new Error(`GitHub responded with ${response.status}`);
  }
  return response.json();
};

const checkForUpdate = async (mainWindow) => {
  try {
    const release = await fetchLatestRelease();
    if (!release?.tag_name || !isNewerVersion(release.tag_name, app.getVersion())) {
      return;
    }
    mainWindow.webContents.send('main:update-available', {
      version: release.tag_name.replace(/^v/i, ''),
      url: release.html_url
    });
  } catch (error) {
    console.error('Update check failed:', error.message);
  }
};

const registerUpdateCheckIpc = (mainWindow) => {
  mainWindow.webContents.once('did-finish-load', () => checkForUpdate(mainWindow));
};

module.exports = { registerUpdateCheckIpc, checkForUpdate, isNewerVersion };
