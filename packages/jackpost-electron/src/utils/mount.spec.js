const { isDenied, resolveDenylist } = require('./mount');

describe('mount denylist', () => {
  test('plain folder paths deny the folder and its descendants without matching prefixes', () => {
    const denylist = resolveDenylist(['parent/child']);

    expect(isDenied('parent/child', denylist)).toBe(true);
    expect(isDenied('parent/child/request.jp', denylist)).toBe(true);
    expect(isDenied('parent/children/request.jp', denylist)).toBe(false);
  });

  test('preserves glob matching for default denylist entries', () => {
    expect(isDenied('nested/.DS_Store', resolveDenylist())).toBe(true);
  });

  test('folder entries with a trailing separator deny the folder and its descendants', () => {
    const denylist = resolveDenylist(['hidden/']);

    expect(isDenied('hidden', denylist)).toBe(true);
    expect(isDenied('hidden/request.jp', denylist)).toBe(true);
    expect(isDenied('hidden-other/request.jp', denylist)).toBe(false);
  });

  test('a glob denies the path it matches and not files beneath that directory', () => {
    const denylist = resolveDenylist(['**/hidden']);

    expect(isDenied('nested/hidden', denylist)).toBe(true);
    expect(isDenied('nested/hidden/request.jp', denylist)).toBe(false);
    expect(isDenied('nested/visible/request.jp', denylist)).toBe(false);
  });

  test('a trailing slash on a glob does not match every path', () => {
    expect(isDenied('foo/bar.jp', resolveDenylist(['**/']))).toBe(false);
    expect(isDenied('visible.jp', resolveDenylist(['*/']))).toBe(false);
    expect(isDenied('dir/file.jp', resolveDenylist(['*/']))).toBe(false);
  });

  test('skips empty and slash-only plain patterns', () => {
    const denylist = resolveDenylist(['', '/', '//', 'hidden']);

    expect(isDenied('hidden/request.jp', denylist)).toBe(true);
    expect(isDenied('visible.jp', denylist)).toBe(false);
  });

  test('walk prunes plain ignored directories without descending', () => {
    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const { walk } = require('./mount');
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jackpost-walk-deny-'));

    try {
      fs.mkdirSync(path.join(root, 'hidden'));
      fs.writeFileSync(path.join(root, 'hidden', 'request.jp'), 'hidden');
      fs.writeFileSync(path.join(root, 'visible.jp'), 'visible');

      const files = walk(root, resolveDenylist(['hidden'])).map((f) => f.relativePath);
      expect(files).toEqual(['visible.jp']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('walk still lists files under a directory that only matches a non-cascading glob', () => {
    const fs = require('node:fs');
    const os = require('node:os');
    const path = require('node:path');
    const { walk } = require('./mount');
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jackpost-walk-glob-'));

    try {
      fs.mkdirSync(path.join(root, 'nested', 'hidden'), { recursive: true });
      fs.writeFileSync(path.join(root, 'nested', 'hidden', 'request.jp'), 'nested-hidden');
      fs.writeFileSync(path.join(root, 'visible.jp'), 'visible');

      const files = walk(root, resolveDenylist(['**/hidden'])).map((f) => f.relativePath).sort();
      expect(files).toEqual([
        path.join('nested', 'hidden', 'request.jp'),
        'visible.jp'
      ].sort());
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
