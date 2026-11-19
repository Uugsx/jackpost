const Jp = require('../src/jp');

describe('Collection Variable APIs', () => {
  const makeJp = (collectionVariables = {}) =>
    new Jp({
      runtime: 'quickjs',
      envVariables: {},
      runtimeVariables: {},
      processEnvVars: {},
      collectionPath: '/',
      collectionName: 'Test',
      collectionVariables
    });

  describe('jp.setCollectionVar', () => {
    test('sets a new collection variable', () => {
      const jp = makeJp();
      jp.setCollectionVar('baseUrl', 'https://api.example.com');
      expect(jp.collectionVariables.baseUrl).toBe('https://api.example.com');
    });

    test('overwrites an existing collection variable', () => {
      const jp = makeJp({ baseUrl: 'https://old.com' });
      jp.setCollectionVar('baseUrl', 'https://new.com');
      expect(jp.collectionVariables.baseUrl).toBe('https://new.com');
    });

    test('allows non-string values', () => {
      const jp = makeJp();
      jp.setCollectionVar('count', 42);
      expect(jp.collectionVariables.count).toBe(42);

      jp.setCollectionVar('active', true);
      expect(jp.collectionVariables.active).toBe(true);

      jp.setCollectionVar('config', { port: 3000 });
      expect(jp.collectionVariables.config).toEqual({ port: 3000 });
    });

    test('throws when key is empty', () => {
      const jp = makeJp();
      expect(() => jp.setCollectionVar('', 'v')).toThrow(/without specifying a name/);
    });

    test('throws when key has invalid characters', () => {
      const jp = makeJp();
      expect(() => jp.setCollectionVar('invalid key', 'v')).toThrow(/contains invalid characters/);
    });

    test('re-run: setting same key twice does not throw', () => {
      const jp = makeJp();
      jp.setCollectionVar('key', 'first');
      jp.setCollectionVar('key', 'second');
      expect(jp.collectionVariables.key).toBe('second');
    });
  });

  describe('jp.setCollectionVar — dirty flag for typed values', () => {
    test('setting a number trips the collection-vars dirty flag', () => {
      const jp = makeJp();
      expect(jp._collVarsDirty).toBe(false);
      jp.setCollectionVar('count', 42);
      expect(jp._collVarsDirty).toBe(true);
    });

    test('setting a boolean trips the collection-vars dirty flag', () => {
      const jp = makeJp();
      jp.setCollectionVar('active', true);
      expect(jp._collVarsDirty).toBe(true);
    });

    test('setting an object trips the collection-vars dirty flag', () => {
      const jp = makeJp();
      jp.setCollectionVar('config', { port: 3000 });
      expect(jp._collVarsDirty).toBe(true);
    });
  });

  describe('jp.setCollectionVar — dirty flag for reference-mutation idiom', () => {
    test('the getCollectionVar → mutate → setCollectionVar idiom trips the dirty flag', () => {
      const jp = makeJp({ config: { port: 3000 } });
      expect(jp._collVarsDirty).toBe(false);
      // Real-script idiom: getCollectionVar deep-copies through interpolate's JSON roundtrip,
      // so mutating the result leaves the store untouched and the deep-equal guard fires.
      const config = jp.getCollectionVar('config');
      config.port = 4000;
      jp.setCollectionVar('config', config);
      expect(jp._collVarsDirty).toBe(true);
      expect(jp.collectionVariables.config).toEqual({ port: 4000 });
    });

    test('re-setting a structurally-equal object value does NOT trip the dirty flag', () => {
      const jp = makeJp({ config: { port: 3000 } });
      jp.setCollectionVar('config', { port: 3000 });
      expect(jp._collVarsDirty).toBe(false);
    });

    test('re-setting a structurally-equal primitive value does NOT trip the dirty flag', () => {
      const jp = makeJp({ token: 'abc' });
      jp.setCollectionVar('token', 'abc');
      expect(jp._collVarsDirty).toBe(false);
    });
  });

  describe('jp.deleteCollectionVar — dirty flag contract', () => {
    test('deleting an existing key trips the collection-vars dirty flag', () => {
      const jp = makeJp({ token: 'abc' });
      jp.deleteCollectionVar('token');
      expect(jp._collVarsDirty).toBe(true);
    });

    test('deleting a non-existent key leaves the dirty flag clean', () => {
      const jp = makeJp();
      jp.deleteCollectionVar('missing');
      expect(jp._collVarsDirty).toBe(false);
    });
  });

  describe('jp.deleteAllCollectionVars — dirty flag contract', () => {
    test('deleting populated scope trips the dirty flag', () => {
      const jp = makeJp({ a: '1', b: '2' });
      jp.deleteAllCollectionVars();
      expect(jp._collVarsDirty).toBe(true);
    });

    test('calling on empty scope leaves the dirty flag clean', () => {
      const jp = makeJp();
      jp.deleteAllCollectionVars();
      expect(jp._collVarsDirty).toBe(false);
    });
  });

  describe('jp.getCollectionVar', () => {
    test('returns the value of an existing variable', () => {
      const jp = makeJp({ token: 'abc123' });
      expect(jp.getCollectionVar('token')).toBe('abc123');
    });

    test('returns undefined for a non-existent variable', () => {
      const jp = makeJp();
      expect(jp.getCollectionVar('missing')).toBeUndefined();
    });
  });

  describe('jp.hasCollectionVar', () => {
    test('returns true for an existing variable', () => {
      const jp = makeJp({ token: 'abc' });
      expect(jp.hasCollectionVar('token')).toBe(true);
    });

    test('returns false for a non-existent variable', () => {
      const jp = makeJp();
      expect(jp.hasCollectionVar('missing')).toBe(false);
    });
  });

  describe('jp.deleteCollectionVar', () => {
    test('removes an existing variable', () => {
      const jp = makeJp({ token: 'abc' });
      jp.deleteCollectionVar('token');
      expect(jp.collectionVariables.token).toBeUndefined();
      expect(jp.hasCollectionVar('token')).toBe(false);
    });

    test('re-run: deleting a non-existent key is a silent no-op', () => {
      const jp = makeJp();
      expect(() => jp.deleteCollectionVar('missing')).not.toThrow();
    });

    test('re-run: deleting an already-deleted key is a silent no-op', () => {
      const jp = makeJp({ token: 'abc' });
      jp.deleteCollectionVar('token');
      expect(() => jp.deleteCollectionVar('token')).not.toThrow();
    });
  });

  describe('jp.deleteAllCollectionVars', () => {
    test('removes all collection variables', () => {
      const jp = makeJp({ a: '1', b: '2', c: '3' });
      jp.deleteAllCollectionVars();
      expect(jp.collectionVariables).toEqual({});
    });

    test('re-run: calling on empty scope is a silent no-op', () => {
      const jp = makeJp();
      expect(() => jp.deleteAllCollectionVars()).not.toThrow();
      expect(jp.collectionVariables).toEqual({});
    });

    test('re-run: calling twice is a silent no-op', () => {
      const jp = makeJp({ a: '1' });
      jp.deleteAllCollectionVars();
      expect(() => jp.deleteAllCollectionVars()).not.toThrow();
      expect(jp.collectionVariables).toEqual({});
    });
  });

  describe('jp.getAllCollectionVars', () => {
    test('returns a copy of all collection variables', () => {
      const jp = makeJp({ a: '1', b: '2' });
      const all = jp.getAllCollectionVars();
      expect(all).toEqual({ a: '1', b: '2' });
    });

    test('returned object is a copy, not a reference', () => {
      const jp = makeJp({ a: '1' });
      const all = jp.getAllCollectionVars();
      all.a = 'mutated';
      expect(jp.collectionVariables.a).toBe('1');
    });

    test('returns empty object when no variables exist', () => {
      const jp = makeJp();
      expect(jp.getAllCollectionVars()).toEqual({});
    });
  });
});
