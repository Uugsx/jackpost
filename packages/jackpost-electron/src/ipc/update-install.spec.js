jest.mock('electron', () => ({ app: { getPath: jest.fn() }, ipcMain: { handle: jest.fn() } }));

const { pickMacDmgAsset } = require('./update-install');

const asset = (name, digest = 'sha256:abc') => ({ name, digest });

describe('pickMacDmgAsset', () => {
  const originalPlatform = process.platform;
  const originalArch = process.arch;
  const setEnv = (platform, arch) => {
    Object.defineProperty(process, 'platform', { value: platform });
    Object.defineProperty(process, 'arch', { value: arch });
  };

  afterEach(() => setEnv(originalPlatform, originalArch));

  it('выбирает arm64 DMG на Apple Silicon', () => {
    setEnv('darwin', 'arm64');
    const assets = [asset('Jackpost-2.0.1-x64.dmg'), asset('Jackpost-2.0.1-arm64.dmg'), asset('Jackpost-2.0.1.zip')];
    expect(pickMacDmgAsset(assets).name).toBe('Jackpost-2.0.1-arm64.dmg');
  });

  it('выбирает x64 DMG на Intel', () => {
    setEnv('darwin', 'x64');
    const assets = [asset('Jackpost-2.0.1-arm64.dmg'), asset('Jackpost-2.0.1-x64.dmg')];
    expect(pickMacDmgAsset(assets).name).toBe('Jackpost-2.0.1-x64.dmg');
  });

  it('игнорирует DMG без sha256-дайджеста', () => {
    setEnv('darwin', 'arm64');
    expect(pickMacDmgAsset([{ name: 'Jackpost-arm64.dmg' }])).toBeNull();
  });

  it('возвращает null вне macOS', () => {
    setEnv('win32', 'x64');
    expect(pickMacDmgAsset([asset('Jackpost-x64.dmg')])).toBeNull();
  });
});
