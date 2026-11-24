jest.mock('electron', () => ({ app: { getPath: jest.fn() }, ipcMain: { handle: jest.fn() } }));

const { pickUpdateAsset } = require('./update-install');

const asset = (name, digest = 'sha256:abc') => ({ name, digest });

describe('pickUpdateAsset', () => {
  it('выбирает arm64 DMG на Apple Silicon', () => {
    const assets = [asset('Jackpost-2.0.1-x64.dmg'), asset('Jackpost-2.0.1-arm64.dmg'), asset('Jackpost-2.0.1.zip')];
    expect(pickUpdateAsset(assets, 'darwin', 'arm64').name).toBe('Jackpost-2.0.1-arm64.dmg');
  });

  it('выбирает x64 DMG на Intel', () => {
    const assets = [asset('Jackpost-2.0.1-arm64.dmg'), asset('Jackpost-2.0.1-x64.dmg')];
    expect(pickUpdateAsset(assets, 'darwin', 'x64').name).toBe('Jackpost-2.0.1-x64.dmg');
  });

  it('игнорирует файлы без sha256-дайджеста', () => {
    expect(pickUpdateAsset([{ name: 'Jackpost-arm64.dmg' }], 'darwin', 'arm64')).toBeNull();
  });

  it('выбирает установщик Windows нужной архитектуры', () => {
    const assets = [
      asset('Jackpost_2.0.4_arm64_mac.dmg'),
      asset('Jackpost_2.0.4_arm64_win.exe'),
      asset('Jackpost_2.0.4_x64_win.exe')
    ];
    expect(pickUpdateAsset(assets, 'win32', 'x64').name).toBe('Jackpost_2.0.4_x64_win.exe');
    expect(pickUpdateAsset(assets, 'win32', 'arm64').name).toBe('Jackpost_2.0.4_arm64_win.exe');
  });

  it('не берёт DMG на Windows и exe на macOS', () => {
    expect(pickUpdateAsset([asset('Jackpost-x64.dmg')], 'win32', 'x64')).toBeNull();
    expect(pickUpdateAsset([asset('Jackpost_x64_win.exe')], 'darwin', 'x64')).toBeNull();
  });

  it('возвращает null на неподдерживаемых платформах', () => {
    expect(pickUpdateAsset([asset('Jackpost-x64.dmg')], 'linux', 'x64')).toBeNull();
  });

  it('не предлагает автоустановку portable-сборке и не путает portable с установщиком', () => {
    const assets = [asset('Jackpost_2.0.5_x64_win_portable.exe'), asset('Jackpost_2.0.5_x64_win.exe')];
    expect(pickUpdateAsset(assets, 'win32', 'x64', true)).toBeNull();
    expect(pickUpdateAsset(assets, 'win32', 'x64', false).name).toBe('Jackpost_2.0.5_x64_win.exe');
    expect(pickUpdateAsset([asset('Jackpost_2.0.5_x64_win_portable.exe')], 'win32', 'x64', false)).toBeNull();
  });
});
