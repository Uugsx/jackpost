const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const fsExtra = require('fs-extra');

jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn(), on: jest.fn(), emit: jest.fn() },
  app: { getPath: jest.fn(() => require('node:os').tmpdir()) }
}));
jest.mock('./mount', () => ({
  unmount: jest.fn(async () => {}),
  clearCollectionIndex: jest.fn()
}));
jest.mock('../app/collections', () => ({
  openCollection: jest.fn(async () => ({ opened: true }))
}));
jest.mock('../services/snapshot', () => ({
  setCollection: jest.fn(),
  remapCollectionTabPaths: jest.fn()
}));
jest.mock('../store/jackpost-config', () => ({
  clearJackpostConfig: jest.fn()
}));
jest.mock('../cache/requestUids', () => ({
  clearRequestUidsForCollection: jest.fn()
}));
// The worker pool needs a built dist + worker threads; unit tests run the sync
// equivalents instead — the conversion output is identical.
jest.mock('@jackpost/filestore', () => {
  const actual = jest.requireActual('@jackpost/filestore');
  return {
    ...actual,
    parseRequestViaWorker: async (content, options) => actual.parseRequest(content, options),
    stringifyRequestViaWorker: async (obj, options) => actual.stringifyRequest(obj, options),
    parseFolderViaWorker: async (content, options) => actual.parseFolder(content, options),
    stringifyFolderViaWorker: async (obj, options) => actual.stringifyFolder(obj, options),
    parseEnvironmentViaWorker: async (content, options) => actual.parseEnvironment(content, options),
    stringifyEnvironmentViaWorker: async (obj, options) => actual.stringifyEnvironment(obj, options)
  };
});

const {
  migrateCollectionOnDisk,
  migrateCollectionToYml,
  stripJpExtInRunRequest,
  MIGRATION_CANCELLED_MESSAGE
} = require('./yml-migration');
const { openCollection } = require('../app/collections');
const snapshotManager = require('../services/snapshot');

const JACKPOST_JSON = {
  version: '1',
  name: 'test-collection',
  type: 'collection',
  collectionVersion: '2.1.0'
};

const REQUEST_JP = `meta {
  name: ping
  type: http
  seq: 1
}

get {
  url: http://localhost:3000/ping
}
`;

const FOLDER_JP = `meta {
  name: api
}
`;

const ENV_JP = `vars {
  host: http://localhost:3000
}
`;

const COLLECTION_JP = `docs {
  Root level docs
}
`;

const REQUEST_JP_WITH_RUN_REQUEST = `meta {
  name: chain
  type: http
  seq: 1
}

get {
  url: http://localhost:3000/chain
}

script:pre-request {
  await jp.runRequest("newFolder/SecondReq.jp");
  await jp.runRequest('single/quoted.jp');
}

script:post-response {
  await jp.runRequest(\`template/literal.jp\`);
  await jp.runRequest("no-ext");
  await jp.runRequest("keeper.bruv");
}

tests {
  await jp.runRequest("tests/only.jp");
}
`;

const FOLDER_JP_WITH_RUN_REQUEST = `meta {
  name: chained
}

script:pre-request {
  await jp.runRequest("folder-scoped/first.jp");
}
`;

const COLLECTION_JP_WITH_RUN_REQUEST = `script:pre-request {
  await jp.runRequest("collection-scoped/first.jp");
}
`;

describe('migrateCollectionOnDisk', () => {
  let collectionDir;
  let backupRootDir;

  const filePath = (...segments) => path.join(collectionDir, ...segments);

  const listFilesRecursive = (dir) => {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...listFilesRecursive(entryPath));
      } else {
        results.push(entryPath);
      }
    }
    return results.sort();
  };

  const snapshotDisk = () => {
    const files = {};
    for (const file of listFilesRecursive(collectionDir)) {
      files[path.relative(collectionDir, file)] = fs.readFileSync(file, 'utf8');
    }
    return files;
  };

  const runMigration = (overrides = {}) =>
    migrateCollectionOnDisk({
      collectionPathname: collectionDir,
      jackpostConfig: { ...JACKPOST_JSON },
      backupRootDir,
      ...overrides
    });

  beforeEach(() => {
    collectionDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yml-migration-collection-'));
    backupRootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yml-migration-backup-'));

    fs.writeFileSync(filePath('jackpost.json'), JSON.stringify(JACKPOST_JSON, null, 2));
    fs.writeFileSync(filePath('collection.jp'), COLLECTION_JP);
    fs.writeFileSync(filePath('ping.jp'), REQUEST_JP);
    fs.mkdirSync(filePath('api'));
    fs.writeFileSync(filePath('api', 'folder.jp'), FOLDER_JP);
    fs.writeFileSync(filePath('api', 'get-users.jp'), REQUEST_JP.replace('ping', 'get-users'));
    fs.mkdirSync(filePath('environments'));
    fs.writeFileSync(filePath('environments', 'Local.jp'), ENV_JP);
    fs.writeFileSync(filePath('README.md'), '# not a jp file\n');
  });

  afterEach(() => {
    fsExtra.removeSync(collectionDir);
    fsExtra.removeSync(backupRootDir);
    jest.restoreAllMocks();
  });

  it('converts every .jp file, removes the sources and leaves other files untouched', async () => {
    const { jackpostConfig, tabPathMap } = await runMigration();

    const remaining = listFilesRecursive(collectionDir).map((file) => path.relative(collectionDir, file));
    expect(remaining).toEqual(
      [
        'README.md',
        'opencollection.yml',
        'ping.yml',
        path.join('api', 'folder.yml'),
        path.join('api', 'get-users.yml'),
        path.join('environments', 'Local.yml')
      ].sort()
    );

    expect(tabPathMap[filePath('ping.jp')]).toBe(filePath('ping.yml'));
    expect(tabPathMap[filePath('api', 'get-users.jp')]).toBe(filePath('api', 'get-users.yml'));
    expect(tabPathMap[filePath('environments', 'Local.jp')]).toBe(filePath('environments', 'Local.yml'));

    const ocYml = fs.readFileSync(filePath('opencollection.yml'), 'utf8');
    expect(ocYml).toContain('opencollection:');
    expect(fs.readFileSync(filePath('README.md'), 'utf8')).toBe('# not a jp file\n');

    expect(jackpostConfig.opencollection).toBe('1.0.0');
    expect(jackpostConfig.version).toBe('2.1.0');
    expect(jackpostConfig.collectionVersion).toBeUndefined();

    // backup is removed once the migration committed
    expect(fs.readdirSync(backupRootDir)).toEqual([]);
  });

  it('emits parsing, writing and finalizing progress with consistent totals', async () => {
    const events = [];
    await runMigration({ emitProgress: (phase, current, total) => events.push({ phase, current, total }) });

    const phases = [...new Set(events.map((event) => event.phase))];
    expect(phases).toEqual(['parsing', 'writing', 'finalizing']);

    for (const phase of phases) {
      const phaseEvents = events.filter((event) => event.phase === phase);
      const { total } = phaseEvents[0];
      expect(phaseEvents.map((event) => event.current)).toEqual(
        Array.from({ length: phaseEvents.length }, (_, i) => i + 1)
      );
      expect(phaseEvents[phaseEvents.length - 1].current).toBe(total);
    }

    // 5 .jp files parsed; 4 converted + opencollection.yml written; 5 .jp + jackpost.json removed
    expect(events.filter((e) => e.phase === 'parsing').length).toBe(5);
    expect(events.filter((e) => e.phase === 'writing').length).toBe(5);
    expect(events.filter((e) => e.phase === 'finalizing').length).toBe(6);
  });

  it('aborts before writing anything when a file fails to parse', async () => {
    fs.writeFileSync(filePath('broken.jp'), 'meta { this is not parseable');
    const before = snapshotDisk();

    await expect(runMigration()).rejects.toThrow(/failed to parse/);

    expect(snapshotDisk()).toEqual(before);
  });

  it('aborts without touching disk when a target yml file already exists', async () => {
    fs.writeFileSync(filePath('ping.yml'), 'pre-existing file\n');
    const before = snapshotDisk();

    await expect(runMigration()).rejects.toThrow(/already exist/);

    expect(snapshotDisk()).toEqual(before);
    expect(fs.readFileSync(filePath('ping.yml'), 'utf8')).toBe('pre-existing file\n');
  });

  it('leaves the collection untouched when cancelled during parsing', async () => {
    const before = snapshotDisk();
    let calls = 0;
    const checkCancelled = () => {
      if (++calls > 2) {
        throw new Error(MIGRATION_CANCELLED_MESSAGE);
      }
    };

    await expect(runMigration({ checkCancelled })).rejects.toThrow(MIGRATION_CANCELLED_MESSAGE);

    expect(snapshotDisk()).toEqual(before);
    expect(fs.readdirSync(backupRootDir)).toEqual([]);
  });

  it('restores removed sources and deletes written yml when finalizing fails midway', async () => {
    const before = snapshotDisk();
    const realUnlink = fs.promises.unlink.bind(fs.promises);
    let unlinkCalls = 0;
    jest.spyOn(fs.promises, 'unlink').mockImplementation(async (target) => {
      if (++unlinkCalls === 3) {
        throw new Error('EPERM: simulated lock');
      }
      return realUnlink(target);
    });

    await expect(runMigration()).rejects.toThrow('EPERM: simulated lock');

    expect(snapshotDisk()).toEqual(before);
    expect(fs.readdirSync(backupRootDir)).toEqual([]);
  });

  it('does not touch .jp files inside node_modules or .git', async () => {
    fs.mkdirSync(filePath('node_modules'));
    fs.writeFileSync(filePath('node_modules', 'stray.jp'), REQUEST_JP);
    fs.mkdirSync(filePath('.git'));
    fs.writeFileSync(filePath('.git', 'inside-git.jp'), REQUEST_JP);

    await runMigration();

    expect(fs.existsSync(filePath('node_modules', 'stray.jp'))).toBe(true);
    expect(fs.existsSync(filePath('.git', 'inside-git.jp'))).toBe(true);
    expect(fs.existsSync(filePath('node_modules', 'stray.yml'))).toBe(false);
    expect(fs.existsSync(filePath('.git', 'inside-git.yml'))).toBe(false);
  });

  it('does not follow symlinks pointing outside the collection', async () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'yml-migration-outside-'));
    const externalJp = path.join(outside, 'external.jp');
    try {
      fs.writeFileSync(externalJp, REQUEST_JP);
      try {
        fs.symlinkSync(externalJp, filePath('linked.jp'));
      } catch (err) {
        // Skip on platforms/permissions where symlink creation fails (e.g. non-admin Windows).
        return;
      }

      await runMigration();

      expect(fs.existsSync(externalJp)).toBe(true);
      expect(fs.readFileSync(externalJp, 'utf8')).toBe(REQUEST_JP);
      expect(fs.existsSync(filePath('linked.jp'))).toBe(true);
      expect(fs.existsSync(filePath('linked.yml'))).toBe(false);
    } finally {
      fsExtra.removeSync(outside);
    }
  });

  it('honors jackpost.json `ignore` paths so vendored .jp files are not migrated', async () => {
    fs.mkdirSync(filePath('vendor'));
    fs.writeFileSync(filePath('vendor', 'lib.jp'), REQUEST_JP);

    await runMigration({ jackpostConfig: { ...JACKPOST_JSON, ignore: ['vendor'] } });

    expect(fs.existsSync(filePath('vendor', 'lib.jp'))).toBe(true);
    expect(fs.existsSync(filePath('vendor', 'lib.yml'))).toBe(false);
  });

  it('upgrades a legacy-shape proxy block so it survives the yml stringifier', async () => {
    const legacyProxyConfig = {
      ...JACKPOST_JSON,
      proxy: {
        enabled: true,
        protocol: 'http',
        hostname: 'proxy.example.com',
        port: '8080',
        auth: { enabled: true, username: 'u', password: 'p' },
        bypassProxy: 'localhost,127.0.0.1'
      }
    };

    const { jackpostConfig } = await runMigration({ jackpostConfig: legacyProxyConfig });

    // Legacy `enabled: true` must become `inherit: false` (an explicit collection-level
    // proxy), not `inherit: true` (which would silently defer to the global proxy).
    expect(jackpostConfig.proxy).toEqual(expect.objectContaining({
      inherit: false,
      config: expect.objectContaining({
        protocol: 'http',
        hostname: 'proxy.example.com',
        port: '8080',
        auth: { username: 'u', password: 'p' },
        bypassProxy: 'localhost,127.0.0.1'
      })
    }));

    const ocYml = fs.readFileSync(filePath('opencollection.yml'), 'utf8');
    expect(ocYml).toContain('proxy.example.com');
  });

  it('strips the .jp extension from jp.runRequest calls across request, folder and collection scripts', async () => {
    fs.writeFileSync(filePath('collection.jp'), COLLECTION_JP_WITH_RUN_REQUEST);
    fs.writeFileSync(filePath('chain.jp'), REQUEST_JP_WITH_RUN_REQUEST);
    fs.writeFileSync(filePath('api', 'folder.jp'), FOLDER_JP_WITH_RUN_REQUEST);

    await runMigration();

    const chainYml = fs.readFileSync(filePath('chain.yml'), 'utf8');
    expect(chainYml).toContain('jp.runRequest("newFolder/SecondReq")');
    expect(chainYml).toContain('jp.runRequest(\'single/quoted\')');
    expect(chainYml).toContain('jp.runRequest(`template/literal`)');
    expect(chainYml).toContain('jp.runRequest("tests/only")');
    // Untouched: extensionless call and a look-alike extension.
    expect(chainYml).toContain('jp.runRequest("no-ext")');
    expect(chainYml).toContain('jp.runRequest("keeper.bruv")');
    // No stray literal ".jp" survived any of the rewritten calls.
    expect(chainYml).not.toMatch(/jp\.runRequest\([^)]*\.jp['"`]\)/);

    const folderYml = fs.readFileSync(filePath('api', 'folder.yml'), 'utf8');
    expect(folderYml).toContain('jp.runRequest("folder-scoped/first")');
    expect(folderYml).not.toContain('folder-scoped/first.jp');

    const ocYml = fs.readFileSync(filePath('opencollection.yml'), 'utf8');
    expect(ocYml).toContain('jp.runRequest("collection-scoped/first")');
    expect(ocYml).not.toContain('collection-scoped/first.jp');
  });

  it('keeps the backup and reports when a source cannot be restored', async () => {
    const realUnlink = fs.promises.unlink.bind(fs.promises);
    let unlinkCalls = 0;
    jest.spyOn(fs.promises, 'unlink').mockImplementation(async (target) => {
      if (++unlinkCalls === 3) {
        throw new Error('EPERM: simulated lock');
      }
      return realUnlink(target);
    });
    const realCopy = fsExtra.copy;
    jest.spyOn(fsExtra, 'copy').mockImplementation(async (src, dest) => {
      // let backup copies (into backupRootDir) pass; fail the restore copies back
      if (dest.startsWith(collectionDir)) {
        throw new Error('EACCES: simulated restore failure');
      }
      return realCopy(src, dest);
    });
    const reportError = jest.fn();

    await expect(runMigration({ reportError })).rejects.toThrow('EPERM: simulated lock');

    expect(reportError).toHaveBeenCalledWith(expect.stringContaining('could not be restored'));
    // the backup directory with the originals must survive for manual recovery
    expect(fs.readdirSync(backupRootDir)).toHaveLength(1);
  });
});

describe('stripJpExtInRunRequest', () => {
  it('rewrites standalone string-literal arguments in every quote style', () => {
    const input = [
      'await jp.runRequest("folder/one.jp");',
      'await jp.runRequest(\'folder/two.jp\');',
      'await jp.runRequest(`folder/three.jp`);'
    ].join('\n');
    const output = stripJpExtInRunRequest(input);
    expect(output).toBe([
      'await jp.runRequest("folder/one");',
      'await jp.runRequest(\'folder/two\');',
      'await jp.runRequest(`folder/three`);'
    ].join('\n'));
  });

  it('rewrites every eligible call on the same line', () => {
    const input = 'jp.runRequest("a.jp"); jp.runRequest("b.jp");';
    expect(stripJpExtInRunRequest(input)).toBe('jp.runRequest("a"); jp.runRequest("b");');
  });

  it('leaves calls inside line comments untouched', () => {
    const input = [
      '// jp.runRequest("commented.jp")',
      'jp.runRequest("real.jp");'
    ].join('\n');
    const output = stripJpExtInRunRequest(input);
    expect(output).toContain('// jp.runRequest("commented.jp")');
    expect(output).toContain('jp.runRequest("real")');
    expect(output).not.toContain('real.jp');
  });

  it('leaves calls inside block comments untouched', () => {
    const input = '/* jp.runRequest("block.jp") */ jp.runRequest("real.jp");';
    const output = stripJpExtInRunRequest(input);
    expect(output).toContain('/* jp.runRequest("block.jp") */');
    expect(output).toContain('jp.runRequest("real")');
  });

  it('leaves lookalike text inside an unrelated outer string literal untouched', () => {
    const single = 'const s = \'jp.runRequest("outer.jp")\';';
    const double = 'const s = "jp.runRequest(\'outer.jp\')";';
    expect(stripJpExtInRunRequest(single)).toBe(single);
    expect(stripJpExtInRunRequest(double)).toBe(double);
  });

  it('does not rewrite when the argument is a compound expression', () => {
    const cases = [
      'jp.runRequest("first.jp" + suffix)',
      'jp.runRequest("first.jp", { retries: 1 })',
      'jp.runRequest(getPath("first.jp"))',
      'jp.runRequest(`${prefix}` + ".jp")'
    ];
    for (const input of cases) {
      expect(stripJpExtInRunRequest(input)).toBe(input);
    }
  });

  it('does not rewrite calls whose argument does not end in .jp', () => {
    const cases = [
      'jp.runRequest("no-ext")',
      'jp.runRequest("looks/like.bruv")',
      'jp.runRequest("")'
    ];
    for (const input of cases) {
      expect(stripJpExtInRunRequest(input)).toBe(input);
    }
  });

  it('ignores identifiers that only end in "jp"', () => {
    const input = 'notbru.runRequest("foo.jp"); mybru.runRequest("bar.jp");';
    expect(stripJpExtInRunRequest(input)).toBe(input);
  });

  it('tolerates whitespace around the call punctuation', () => {
    const input = 'jp.runRequest\n(\n  "spaced/out.jp"\n)';
    expect(stripJpExtInRunRequest(input)).toBe('jp.runRequest\n(\n  "spaced/out"\n)');
  });

  it('is a no-op when the input never references runRequest', () => {
    const input = 'const x = 1;\nfunction f() { return x + 2; }';
    expect(stripJpExtInRunRequest(input)).toBe(input);
  });

  it('returns the input unchanged for empty or non-string values', () => {
    expect(stripJpExtInRunRequest('')).toBe('');
    expect(stripJpExtInRunRequest(null)).toBe(null);
    expect(stripJpExtInRunRequest(undefined)).toBe(undefined);
  });

  it('rewrites calls nested inside a template literal substitution', () => {
    const input = 'const msg = `Result: ${await jp.runRequest("nested/one.jp")}`;';
    expect(stripJpExtInRunRequest(input)).toBe(
      'const msg = `Result: ${await jp.runRequest("nested/one")}`;'
    );
  });

  it('descends into nested template substitutions', () => {
    const input = 'const s = `${`inner ${jp.runRequest("deep.jp")}`}`;';
    expect(stripJpExtInRunRequest(input)).toBe(
      'const s = `${`inner ${jp.runRequest("deep")}`}`;'
    );
  });

  it('leaves template literal text (outside substitutions) untouched', () => {
    const input = 'const s = `text jp.runRequest("outer.jp") text`;';
    expect(stripJpExtInRunRequest(input)).toBe(input);
  });

  it('leaves calls that appear inside a regex literal untouched', () => {
    const cases = [
      'const re = /jp\\.runRequest\\("foo\\.jp"\\)/;',
      'if (source.match(/jp\\.runRequest\\("bar.jp"\\)/)) {}',
      'const re = /[a-z]jp\\.runRequest\\("baz.jp"\\)/g;'
    ];
    for (const input of cases) {
      expect(stripJpExtInRunRequest(input)).toBe(input);
    }
  });

  it('rewrites a call that follows an unrelated division', () => {
    const input = 'const half = total / 2; jp.runRequest("real.jp");';
    expect(stripJpExtInRunRequest(input)).toBe(
      'const half = total / 2; jp.runRequest("real");'
    );
  });

  it('treats `/` after a value-expecting keyword as a regex, not division', () => {
    const input = 'function f() { return /jp\\.runRequest\\("kw.jp"\\)/; }';
    expect(stripJpExtInRunRequest(input)).toBe(input);
  });
});

describe('migrateCollectionToYml reopen', () => {
  let collectionDir;
  const collectionUid = 'col-uid';
  const mainWindow = { webContents: { send: jest.fn() } };
  const watcher = { removeWatcher: jest.fn() };

  beforeEach(() => {
    collectionDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yml-migration-reopen-'));
    fs.writeFileSync(path.join(collectionDir, 'jackpost.json'), JSON.stringify(JACKPOST_JSON, null, 2));
    fs.writeFileSync(path.join(collectionDir, 'collection.jp'), COLLECTION_JP);
    fs.writeFileSync(path.join(collectionDir, 'ping.jp'), REQUEST_JP);
    openCollection.mockReset();
    openCollection.mockResolvedValue({ opened: true });
    snapshotManager.remapCollectionTabPaths.mockClear();
    mainWindow.webContents.send.mockClear();
  });

  afterEach(() => {
    fsExtra.removeSync(collectionDir);
  });

  it('fails the success path when openCollection returns opened: false', async () => {
    openCollection.mockResolvedValue({
      opened: false,
      error: 'broken opencollection.yml'
    });

    await expect(
      migrateCollectionToYml({
        mainWindow,
        watcher,
        collectionPathname: collectionDir,
        collectionUid
      })
    ).rejects.toThrow('broken opencollection.yml');

    // Disk migration still completed (yml present); reopen failure must not look like success.
    expect(fs.existsSync(path.join(collectionDir, 'opencollection.yml'))).toBe(true);
    expect(fs.existsSync(path.join(collectionDir, 'jackpost.json'))).toBe(false);
  });

  it('still surfaces the migration error when reopen also returns opened: false', async () => {
    fs.writeFileSync(path.join(collectionDir, 'broken.jp'), 'meta { this is not parseable');
    openCollection.mockResolvedValue({
      opened: false,
      error: 'could not reopen'
    });

    await expect(
      migrateCollectionToYml({
        mainWindow,
        watcher,
        collectionPathname: collectionDir,
        collectionUid
      })
    ).rejects.toThrow(/failed to parse/);
  });
});
