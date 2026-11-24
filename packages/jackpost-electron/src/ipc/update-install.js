const { app, ipcMain } = require('electron');
const { spawn, spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const fetch = require('node-fetch');

const DOWNLOAD_TIMEOUT_MS = 20000;

let pendingUpdate = null;

const setPendingUpdate = (update) => {
  pendingUpdate = update || null;
};

// Установка «по воздуху»: на macOS подмена .app из DMG, на Windows — запуск NSIS-установщика.
const UPDATE_ASSET_PATTERNS = {
  darwin: /\.dmg$/i,
  win32: /_win\.exe$/i
};

const isArm64Asset = (name) => /arm64/i.test(name);

const pickUpdateAsset = (assets = [], platform = process.platform, arch = process.arch) => {
  const pattern = UPDATE_ASSET_PATTERNS[platform];
  if (!pattern) return null;
  const candidates = assets.filter((asset) => pattern.test(asset.name) && asset.digest?.startsWith('sha256:'));
  return candidates.find((asset) => isArm64Asset(asset.name) === (arch === 'arm64')) || null;
};

const getAppBundlePath = () => {
  let dir = process.execPath;
  while (dir !== path.dirname(dir)) {
    if (dir.endsWith('.app')) return dir;
    dir = path.dirname(dir);
  }
  return null;
};

const sha256OfFile = async (filePath) => {
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(filePath)) {
    hash.update(chunk);
  }
  return hash.digest('hex');
};

const downloadUpdate = async ({ url, name, digest }) => {
  const cacheDir = path.join(app.getPath('cache'), 'jackpost-updates');
  await fsPromises.mkdir(cacheDir, { recursive: true });
  const filePath = path.join(cacheDir, path.basename(name));

  const response = await fetch(url, { timeout: DOWNLOAD_TIMEOUT_MS });
  if (!response.ok) {
    throw new Error(`Download failed with ${response.status}`);
  }
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(filePath);
    response.body.on('error', reject);
    out.on('error', reject);
    out.on('finish', resolve);
    response.body.pipe(out);
  });

  const expected = digest.replace(/^sha256:/, '').toLowerCase();
  if ((await sha256OfFile(filePath)) !== expected) {
    await fsPromises.rm(filePath, { force: true });
    throw new Error('Update checksum mismatch');
  }
  return filePath;
};

// Пути передаются аргументами, а не текстом скрипта. Новую версию копируем рядом и подменяем
// только после успешного копирования: при ошибке остаётся и запускается старое приложение.
const INSTALL_SCRIPT = `#!/bin/bash
set -euo pipefail
# Скрипт живёт дольше приложения и не привязан к терминалу: лог — единственный способ узнать причину сбоя.
exec >> "\${TMPDIR:-/tmp}/jackpost-update.log" 2>&1
trap '' HUP
DMG="$1"
DEST="$2"
PID="$3"
SCRIPT="$0"
MOUNT=$(mktemp -d /tmp/jackpost-update.XXXXXX)
for _ in $(seq 1 25); do kill -0 "$PID" 2>/dev/null || break; sleep 0.2; done
kill -9 "$PID" 2>/dev/null || true
sleep 0.5
cleanup() {
  hdiutil detach "$MOUNT" -quiet 2>/dev/null || true
  rm -rf "$MOUNT"
  rm -f "$SCRIPT" "$DMG"
}
trap cleanup EXIT
STAGE="$DEST.update-$$"
BACKUP="$DEST.previous-$$"
restore_on_error() {
  rm -rf "$STAGE"
  if [ ! -d "$DEST" ] && [ -d "$BACKUP" ]; then mv "$BACKUP" "$DEST"; fi
  if [ -d "$DEST" ]; then open "$DEST"; fi
}
trap restore_on_error ERR
hdiutil attach -nobrowse -mountpoint "$MOUNT" "$DMG"
SRC=$(find "$MOUNT" -maxdepth 1 -name '*.app' | head -1)
if [ -z "$SRC" ]; then echo "No .app in DMG" >&2; false; fi
rm -rf "$STAGE"
ditto "$SRC" "$STAGE"
xattr -cr "$STAGE"
codesign --force --deep --sign - "$STAGE"
if [ -d "$DEST" ]; then mv "$DEST" "$BACKUP"; fi
mv "$STAGE" "$DEST"
trap - ERR
rm -rf "$BACKUP"
open "$DEST"
`;

// NSIS-установщик electron-builder: /S — тихая установка в прежнюю папку, --force-run — запуск приложения после неё.
const installWindowsUpdate = async () => {
  const installerPath = await downloadUpdate(pendingUpdate);
  const installer = spawn(installerPath, ['/S', '--force-run'], { detached: true, stdio: 'ignore' });
  installer.unref();
  app.exit(0);
};

const installMacUpdate = async () => {
  const destApp = getAppBundlePath();
  if (!destApp) {
    throw new Error('Установка обновления недоступна');
  }
  const dmgPath = await downloadUpdate(pendingUpdate);
  const scriptPath = path.join(app.getPath('temp'), `jackpost-install-${process.pid}.sh`);
  await fsPromises.writeFile(scriptPath, INSTALL_SCRIPT, { mode: 0o755 });
  // launchd владеет процессом установщика: он переживает как выход, так и принудительное завершение приложения
  const label = `com.jackpost.updater.${process.pid}`;
  const submit = spawnSync('/bin/launchctl', ['submit', '-l', label, '--', '/bin/bash', scriptPath, dmgPath, destApp, String(process.pid)]);
  if (submit.status !== 0) {
    throw new Error(`Не удалось запустить установщик: ${String(submit.stderr).trim()}`);
  }
  app.exit(0);
};

const installPendingUpdate = async () => {
  if (!pendingUpdate) {
    throw new Error('Установка обновления недоступна');
  }
  if (process.platform === 'win32') {
    return installWindowsUpdate();
  }
  return installMacUpdate();
};

const registerUpdateInstallIpc = () => {
  ipcMain.handle('renderer:install-update', installPendingUpdate);
};

module.exports = { registerUpdateInstallIpc, setPendingUpdate, pickUpdateAsset, installPendingUpdate };
