const Jp = require('../src/jp');

describe('jp.getGlobalEnvName', () => {
  const makeJp = (opts = {}) =>
    new Jp({
      runtime: 'quickjs',
      envVariables: {},
      runtimeVariables: {},
      processEnvVars: {},
      collectionPath: '/',
      collectionName: 'Test',
      globalEnvironmentVariables: {},
      ...opts
    });

  test('returns the active global environment name', () => {
    const jp = makeJp({ globalEnvironmentName: 'Production' });
    expect(jp.getGlobalEnvName()).toBe('Production');
  });

  test('returns undefined when no global environment is active', () => {
    const jp = makeJp();
    expect(jp.getGlobalEnvName()).toBeUndefined();
  });

  test('is independent of the collection environment name', () => {
    const jp = makeJp({ envVariables: { __name__: 'Local' }, globalEnvironmentName: 'Staging' });
    expect(jp.getEnvName()).toBe('Local');
    expect(jp.getGlobalEnvName()).toBe('Staging');
  });

  // The CLI carries the env name in-band as globalEnvironmentVariables.__name__.
  // Mirror the collection-env behaviour: __name__ is a reserved key, not a user var.
  test('getAllGlobalEnvVars strips the reserved __name__ key', () => {
    const jp = makeJp({ globalEnvironmentVariables: { __name__: 'Production', apiKey: 'abc' } });
    expect(jp.getAllGlobalEnvVars()).toEqual({ apiKey: 'abc' });
  });

  test('setGlobalEnvVar cannot overwrite the reserved __name__ key', () => {
    const jp = makeJp({ globalEnvironmentVariables: { __name__: 'Production' } });
    jp.setGlobalEnvVar('__name__', 'Other');
    expect(jp.globalEnvironmentVariables.__name__).toBe('Production');
    expect(jp._globalEnvDirty).toBeFalsy();
  });

  test('getGlobalEnvVar and hasGlobalEnvVar do not expose the reserved __name__ key', () => {
    const jp = makeJp({ globalEnvironmentVariables: { __name__: 'Production' } });
    expect(jp.getGlobalEnvVar('__name__')).toBeUndefined();
    expect(jp.hasGlobalEnvVar('__name__')).toBe(false);
  });

  test('deleteGlobalEnvVar cannot remove the reserved __name__ key', () => {
    const jp = makeJp({ globalEnvironmentVariables: { __name__: 'Production' } });
    jp.deleteGlobalEnvVar('__name__');
    expect(jp.globalEnvironmentVariables.__name__).toBe('Production');
  });

  test('deleteAllGlobalEnvVars preserves the reserved __name__ key', () => {
    const jp = makeJp({ globalEnvironmentVariables: { __name__: 'Production', apiKey: 'abc' } });
    jp.deleteAllGlobalEnvVars();
    expect(jp.globalEnvironmentVariables).toEqual({ __name__: 'Production' });
  });

  test('is exposed in the QuickJS sandbox', async () => {
    const { executeQuickJsVm, loader } = require('../src/sandbox/quickjs');
    await loader();
    const result = executeQuickJsVm({
      script: 'jp.getGlobalEnvName()',
      context: { jp: makeJp({ globalEnvironmentName: 'Production' }) },
      scriptType: 'expression'
    });
    expect(result).toBe('Production');
  });
});
