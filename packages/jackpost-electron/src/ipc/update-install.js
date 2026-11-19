const { app, ipcMain } = require('electron');
const { spawn } = require('child_process');
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

// Установка «по воздуху» поддержана только на macOS: подмена .app через DMG.
const pickMacDmgAsset = (assets = []) => {
  if (process.platform !== 'darwin') return null;
  const dmgs = assets.filter((asset) => /\.dmg$/i.test(asset.name) && asset.digest?.startsWith('sha256:'));
  const archMatch = dmgs.find((asset) => (/arm64/i.test(asset.name)) === (process.arch === 'arm64'));
  return archMatch || null;
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

const downloadDmg = async ({ url, name, digest }) => {
  const cacheDir = path.join(app.getPath('cache'), 'jackpost-updates');
  await fsPromises.mkdir(cacheDir, { recursive: true });
  const dmgPath = path.join(cacheDir, path.basename(name));

  const response = await fetch(url, { timeout: DOWNLOAD_TIMEOUT_MS });
  if (!response.ok) {
    throw new Error(`Download failed with ${response.status}`);
  }
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(dmgPath);
    response.body.on('error', reject);
    out.on('error', reject);
    out.on('finish', resolve);
    response.body.pipe(out);
  });

  const expected = digest.replace(/^sha256:/, '').toLowerCase();
  if ((await sha256OfFile(dmgPath)) !== expected) {
    await fsPromises.rm(dmgPath, { force: true });
    throw new Error('Update checksum mismatch');
  }
  return dmgPath;
};

// Пути передаются аргументами, а не текстом скрипта. Новую версию копируем рядом и подменяем
// только после успешного копирования: при ошибке остаётся и запускается старое приложение.
const INSTALL_SCRIPT = `#!/bin/bash
set -euo pipefail
DMG="$1"
DEST="$2"
PID="$3"
SCRIPT="$0"
MOUNT=$(mktemp -d /tmp/jackpost-update.XXXXXX)
while kill -0 "$PID" 2>/dev/null; do sleep 0.2; done
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

const installPendingUpdate = async () => {
  const destApp = getAppBundlePath();
  if (!pendingUpdate || !destApp) {
    throw new Error('Установка обновления недоступна');
  }
  const dmgPath = await downloadDmg(pendingUpdate);
  const scriptPath = path.join(app.getPath('temp'), `jackpost-install-${process.pid}.sh`);
  await fsPromises.writeFile(scriptPath, INSTALL_SCRIPT, { mode: 0o755 });
  spawn('/bin/bash', [scriptPath, dmgPath, destApp, String(process.pid)], { detached: true, stdio: 'ignore' }).unref();
  app.exit(0);
};

const registerUpdateInstallIpc = () => {
  ipcMain.handle('renderer:install-update', installPendingUpdate);
};

module.exports = { registerUpdateInstallIpc, setPendingUpdate, pickMacDmgAsset, installPendingUpdate };
