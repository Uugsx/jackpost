const Jp = require('../src/jp');

const makeJp = () =>
  new Jp({
    runtime: 'quickjs',
    envVariables: {},
    runtimeVariables: {},
    processEnvVars: {},
    collectionPath: '/',
    collectionName: 'Test'
  });

describe('jp.setEnvVar', () => {
  test('sets envVariables[key] to value', () => {
    const jp = makeJp();
    jp.setEnvVar('token', 'abc123');
    expect(jp.envVariables.token).toBe('abc123');
  });

  test('allows non-string values', () => {
    const jp = makeJp();
    jp.setEnvVar('count', 42);
    expect(jp.envVariables.count).toBe(42);

    jp.setEnvVar('active', true);
    expect(jp.envVariables.active).toBe(true);

    jp.setEnvVar('config', { port: 3000 });
    expect(jp.envVariables.config).toEqual({ port: 3000 });
  });

  test('overwrites existing value', () => {
    const jp = makeJp();
    jp.setEnvVar('key', 'old');
    jp.setEnvVar('key', 'new');
    expect(jp.envVariables.key).toBe('new');
  });

  test('throws when key is empty', () => {
    const jp = makeJp();
    expect(() => jp.setEnvVar('', 'v')).toThrow(/without specifying a name/);
  });

  test('rejects key with invalid characters', () => {
    const jp = makeJp();
    expect(() => jp.setEnvVar('invalid key', 'v')).toThrow(/contains invalid characters/);
  });
});

describe('jp.setEnvVar — dirty flag for typed values', () => {
  test('setting a number trips the env dirty flag', () => {
    const jp = makeJp();
    expect(jp._envDirty).toBe(false);
    jp.setEnvVar('count', 42);
    expect(jp._envDirty).toBe(true);
  });

  test('setting a boolean trips the env dirty flag', () => {
    const jp = makeJp();
    jp.setEnvVar('active', true);
    expect(jp._envDirty).toBe(true);
  });

  test('setting an object trips the env dirty flag', () => {
    const jp = makeJp();
    jp.setEnvVar('config', { port: 3000 });
    expect(jp._envDirty).toBe(true);
  });
});

describe('jp.deleteEnvVar', () => {
  test('removes an existing variable', () => {
    const jp = makeJp();
    jp.setEnvVar('token', 'abc');
    jp.deleteEnvVar('token');
    expect(jp.envVariables.token).toBeUndefined();
  });

  test('deleting a non-existent key is a silent no-op', () => {
    const jp = makeJp();
    expect(() => jp.deleteEnvVar('missing')).not.toThrow();
  });

  test('does not delete the internal __name__ marker', () => {
    const jp = new Jp({
      runtime: 'quickjs',
      envVariables: { __name__: 'dev', token: 'abc' },
      runtimeVariables: {},
      processEnvVars: {},
      collectionPath: '/',
      collectionName: 'Test'
    });
    jp.deleteEnvVar('__name__');
    expect(jp.envVariables.__name__).toBe('dev');
    expect(jp._envDirty).toBe(false);
  });
});

describe('jp.setEnvVar — dirty flag for reference-mutation idiom', () => {
  test('the getEnvVar → mutate → setEnvVar idiom trips the dirty flag', () => {
    const jp = new Jp({
      runtime: 'quickjs',
      envVariables: { config: { port: 3000 } },
      runtimeVariables: {},
      processEnvVars: {},
      collectionPath: '/',
      collectionName: 'Test'
    });
    expect(jp._envDirty).toBe(false);
    // Real-script idiom: `const c = jp.getEnvVar('config'); c.port = 4000; jp.setEnvVar('config', c);`
    // `getEnvVar` deep-copies through interpolate's JSON roundtrip, so mutating the result
    // leaves envVariables.config untouched; the deep-equal guard then sees a real change.
    // Pre-fix the strict-`!==` guard missed cases where the script structurally rebuilt the value.
    const config = jp.getEnvVar('config');
    config.port = 4000;
    jp.setEnvVar('config', config);
    expect(jp._envDirty).toBe(true);
    expect(jp.envVariables.config).toEqual({ port: 4000 });
  });

  test('re-setting a structurally-equal object value does NOT trip the dirty flag', () => {
    const jp = new Jp({
      runtime: 'quickjs',
      envVariables: { config: { port: 3000 } },
      runtimeVariables: {},
      processEnvVars: {},
      collectionPath: '/',
      collectionName: 'Test'
    });
    jp.setEnvVar('config', { port: 3000 });
    expect(jp._envDirty).toBe(false);
  });

  test('re-setting a structurally-equal primitive value does NOT trip the dirty flag', () => {
    const jp = new Jp({
      runtime: 'quickjs',
      envVariables: { token: 'abc' },
      runtimeVariables: {},
      processEnvVars: {},
      collectionPath: '/',
      collectionName: 'Test'
    });
    jp.setEnvVar('token', 'abc');
    expect(jp._envDirty).toBe(false);
  });
});

describe('jp.deleteEnvVar — dirty flag contract', () => {
  test('deleting an existing key trips the env dirty flag', () => {
    const jp = makeJp();
    jp.setEnvVar('token', 'abc');
    jp._envDirty = false; // reset post-set
    jp.deleteEnvVar('token');
    expect(jp._envDirty).toBe(true);
  });

  test('deleting a non-existent key leaves the dirty flag clean', () => {
    const jp = makeJp();
    jp.deleteEnvVar('missing');
    expect(jp._envDirty).toBe(false);
  });
});

describe('jp.deleteAllEnvVars — dirty flag contract', () => {
  test('deleting populated env trips the dirty flag', () => {
    const jp = new Jp({
      runtime: 'quickjs',
      envVariables: { a: '1', b: '2' },
      runtimeVariables: {},
      processEnvVars: {},
      collectionPath: '/',
      collectionName: 'Test'
    });
    jp.deleteAllEnvVars();
    expect(jp._envDirty).toBe(true);
  });

  test('calling on empty env leaves the dirty flag clean', () => {
    const jp = makeJp();
    jp.deleteAllEnvVars();
    expect(jp._envDirty).toBe(false);
  });
});

describe('jp.deleteAll* methods — resilient to user-shadowed Object.prototype methods', () => {
  // Use Object.hasOwn (not the property accessor) to check deletion, since after
  // delete the prototype's hasOwnProperty becomes visible again on a plain object.
  test('deleteAllEnvVars works when a var named "hasOwnProperty" was set', () => {
    const jp = makeJp();
    jp.setEnvVar('hasOwnProperty', 'shadow');
    jp.setEnvVar('other', 'value');
    expect(() => jp.deleteAllEnvVars()).not.toThrow();
    expect(Object.hasOwn(jp.envVariables, 'hasOwnProperty')).toBe(false);
    expect(Object.hasOwn(jp.envVariables, 'other')).toBe(false);
  });

  test('deleteAllGlobalEnvVars works when a var named "hasOwnProperty" was set', () => {
    const jp = makeJp();
    jp.setGlobalEnvVar('hasOwnProperty', 'shadow');
    jp.setGlobalEnvVar('other', 'value');
    expect(() => jp.deleteAllGlobalEnvVars()).not.toThrow();
    expect(Object.hasOwn(jp.globalEnvironmentVariables, 'hasOwnProperty')).toBe(false);
  });

  test('deleteAllCollectionVars works when a var named "hasOwnProperty" was set', () => {
    const jp = makeJp();
    jp.setCollectionVar('hasOwnProperty', 'shadow');
    jp.setCollectionVar('other', 'value');
    expect(() => jp.deleteAllCollectionVars()).not.toThrow();
    expect(Object.hasOwn(jp.collectionVariables, 'hasOwnProperty')).toBe(false);
  });

  test('deleteAllVars works when a runtime var named "hasOwnProperty" was set', () => {
    const jp = makeJp();
    jp.setVar('hasOwnProperty', 'shadow');
    jp.setVar('other', 'value');
    expect(() => jp.deleteAllVars()).not.toThrow();
    expect(Object.hasOwn(jp.runtimeVariables, 'hasOwnProperty')).toBe(false);
  });
});
