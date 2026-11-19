const Jp = require('../src/jp');

describe('Global Environment Variable APIs', () => {
  const makeJp = (globalEnvironmentVariables = {}) =>
    new Jp({
      runtime: 'quickjs',
      envVariables: {},
      runtimeVariables: {},
      processEnvVars: {},
      collectionPath: '/',
      collectionName: 'Test',
      globalEnvironmentVariables
    });

  describe('jp.setGlobalEnvVar', () => {
    test('sets a new global env variable', () => {
      const jp = makeJp();
      jp.setGlobalEnvVar('apiKey', 'abc123');
      expect(jp.globalEnvironmentVariables.apiKey).toBe('abc123');
    });

    test('overwrites an existing variable', () => {
      const jp = makeJp({ apiKey: 'old' });
      jp.setGlobalEnvVar('apiKey', 'new');
      expect(jp.globalEnvironmentVariables.apiKey).toBe('new');
    });

    test('allows non-string values', () => {
      const jp = makeJp();
      jp.setGlobalEnvVar('count', 42);
      expect(jp.globalEnvironmentVariables.count).toBe(42);

      jp.setGlobalEnvVar('config', { port: 3000 });
      expect(jp.globalEnvironmentVariables.config).toEqual({ port: 3000 });
    });

    test('throws when key is empty', () => {
      const jp = makeJp();
      expect(() => jp.setGlobalEnvVar('', 'v')).toThrow(/without specifying a name/);
    });

    test('rejects key with invalid characters', () => {
      const jp = makeJp();
      expect(() => jp.setGlobalEnvVar('invalid key', 'v')).toThrow(/contains invalid characters/);
      expect(jp.globalEnvironmentVariables).not.toHaveProperty('invalid key');
    });

    test('re-run: setting same key twice does not throw', () => {
      const jp = makeJp();
      jp.setGlobalEnvVar('key', 'first');
      jp.setGlobalEnvVar('key', 'second');
      expect(jp.globalEnvironmentVariables.key).toBe('second');
    });
  });

  describe('jp.setGlobalEnvVar — dirty flag for typed values', () => {
    test('setting a number trips the global-env dirty flag', () => {
      const jp = makeJp();
      expect(jp._globalEnvDirty).toBe(false);
      jp.setGlobalEnvVar('count', 42);
      expect(jp._globalEnvDirty).toBe(true);
    });

    test('setting a boolean trips the global-env dirty flag', () => {
      const jp = makeJp();
      jp.setGlobalEnvVar('active', true);
      expect(jp._globalEnvDirty).toBe(true);
    });

    test('setting an object trips the global-env dirty flag', () => {
      const jp = makeJp();
      jp.setGlobalEnvVar('config', { port: 3000 });
      expect(jp._globalEnvDirty).toBe(true);
    });
  });

  describe('jp.setGlobalEnvVar — dirty flag for reference-mutation idiom', () => {
    test('the getGlobalEnvVar → mutate → setGlobalEnvVar idiom trips the dirty flag', () => {
      const jp = makeJp({ config: { port: 3000 } });
      expect(jp._globalEnvDirty).toBe(false);
      // Real-script idiom: getGlobalEnvVar deep-copies through interpolate's JSON roundtrip,
      // so mutating the result leaves the store untouched and the deep-equal guard fires.
      const config = jp.getGlobalEnvVar('config');
      config.port = 4000;
      jp.setGlobalEnvVar('config', config);
      expect(jp._globalEnvDirty).toBe(true);
      expect(jp.globalEnvironmentVariables.config).toEqual({ port: 4000 });
    });

    test('re-setting a structurally-equal object value does NOT trip the dirty flag', () => {
      const jp = makeJp({ config: { port: 3000 } });
      jp.setGlobalEnvVar('config', { port: 3000 });
      expect(jp._globalEnvDirty).toBe(false);
    });

    test('re-setting a structurally-equal primitive value does NOT trip the dirty flag', () => {
      const jp = makeJp({ token: 'abc' });
      jp.setGlobalEnvVar('token', 'abc');
      expect(jp._globalEnvDirty).toBe(false);
    });
  });

  describe('jp.deleteGlobalEnvVar — dirty flag contract', () => {
    test('deleting an existing key trips the global-env dirty flag', () => {
      const jp = makeJp({ token: 'abc' });
      jp.deleteGlobalEnvVar('token');
      expect(jp._globalEnvDirty).toBe(true);
    });

    test('deleting a non-existent key leaves the dirty flag clean', () => {
      const jp = makeJp();
      jp.deleteGlobalEnvVar('missing');
      expect(jp._globalEnvDirty).toBe(false);
    });
  });

  describe('jp.deleteAllGlobalEnvVars — dirty flag contract', () => {
    test('deleting populated scope trips the dirty flag', () => {
      const jp = makeJp({ a: '1', b: '2' });
      jp.deleteAllGlobalEnvVars();
      expect(jp._globalEnvDirty).toBe(true);
    });

    test('calling on empty scope leaves the dirty flag clean', () => {
      const jp = makeJp();
      jp.deleteAllGlobalEnvVars();
      expect(jp._globalEnvDirty).toBe(false);
    });
  });

  describe('jp.getGlobalEnvVar', () => {
    test('returns value of an existing variable', () => {
      const jp = makeJp({ token: 'abc' });
      expect(jp.getGlobalEnvVar('token')).toBe('abc');
    });

    test('returns undefined for non-existent variable', () => {
      const jp = makeJp();
      expect(jp.getGlobalEnvVar('missing')).toBeUndefined();
    });
  });

  describe('jp.hasGlobalEnvVar', () => {
    test('returns true for existing variable', () => {
      const jp = makeJp({ token: 'abc' });
      expect(jp.hasGlobalEnvVar('token')).toBe(true);
    });

    test('returns false for non-existent variable', () => {
      const jp = makeJp();
      expect(jp.hasGlobalEnvVar('missing')).toBe(false);
    });
  });

  describe('jp.deleteGlobalEnvVar', () => {
    test('removes an existing variable', () => {
      const jp = makeJp({ token: 'abc' });
      jp.deleteGlobalEnvVar('token');
      expect(jp.globalEnvironmentVariables.token).toBeUndefined();
      expect(jp.hasGlobalEnvVar('token')).toBe(false);
    });

    test('re-run: deleting a non-existent key is a silent no-op', () => {
      const jp = makeJp();
      expect(() => jp.deleteGlobalEnvVar('missing')).not.toThrow();
    });

    test('re-run: deleting an already-deleted key is a silent no-op', () => {
      const jp = makeJp({ token: 'abc' });
      jp.deleteGlobalEnvVar('token');
      expect(() => jp.deleteGlobalEnvVar('token')).not.toThrow();
    });
  });

  describe('jp.deleteAllGlobalEnvVars', () => {
    test('removes all global env variables', () => {
      const jp = makeJp({ a: '1', b: '2', c: '3' });
      jp.deleteAllGlobalEnvVars();
      expect(jp.globalEnvironmentVariables).toEqual({});
    });

    test('re-run: calling on empty scope is a silent no-op', () => {
      const jp = makeJp();
      expect(() => jp.deleteAllGlobalEnvVars()).not.toThrow();
      expect(jp.globalEnvironmentVariables).toEqual({});
    });

    test('re-run: calling twice is a silent no-op', () => {
      const jp = makeJp({ a: '1' });
      jp.deleteAllGlobalEnvVars();
      expect(() => jp.deleteAllGlobalEnvVars()).not.toThrow();
    });
  });

  describe('jp.getAllGlobalEnvVars', () => {
    test('returns a copy of all global env variables', () => {
      const jp = makeJp({ a: '1', b: '2' });
      expect(jp.getAllGlobalEnvVars()).toEqual({ a: '1', b: '2' });
    });

    test('returned object is a copy, not a reference', () => {
      const jp = makeJp({ a: '1' });
      const all = jp.getAllGlobalEnvVars();
      all.a = 'mutated';
      expect(jp.globalEnvironmentVariables.a).toBe('1');
    });

    test('returns empty object when no variables exist', () => {
      const jp = makeJp();
      expect(jp.getAllGlobalEnvVars()).toEqual({});
    });
  });
});
