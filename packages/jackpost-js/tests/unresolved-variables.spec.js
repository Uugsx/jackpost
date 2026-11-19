const { describe, it, expect, beforeAll } = require('@jest/globals');
const Jp = require('../src/jp');
const ScriptRuntime = require('../src/runtime/script-runtime');
const AssertRuntime = require('../src/runtime/assert-runtime');
const { loader: quickJsLoader } = require('../src/sandbox/quickjs');
const { trackUnresolvedVariables, getUnresolvedVariableCollector } = require('../src/unresolved-variables');

const createJp = (unresolvedVariables) => new Jp({
  runtime: 'nodevm',
  envVariables: { present: 'value', falsy: '', baseUrl: '{{host}}/api' },
  runtimeVariables: { zero: 0 },
  collectionVariables: {},
  folderVariables: {},
  requestVariables: {},
  globalEnvironmentVariables: {},
  oauth2CredentialVariables: {},
  processEnvVars: { EMPTY: '' },
  onUnresolved: unresolvedVariables && ((name) => unresolvedVariables.add(name))
});

describe('unresolved variables', () => {
  describe('trackUnresolvedVariables', () => {
    it('shares the set of the top-level request with every nested child request', () => {
      const parentRequest = {};
      const childRequest = {};
      const grandchildRequest = {};
      const parentUnresolvedVariables = trackUnresolvedVariables(parentRequest);
      const childUnresolvedVariables = trackUnresolvedVariables(childRequest, parentUnresolvedVariables);
      trackUnresolvedVariables(grandchildRequest, childUnresolvedVariables);

      getUnresolvedVariableCollector(childRequest)('childHost');
      getUnresolvedVariableCollector(grandchildRequest)('grandchildToken');

      expect([...parentUnresolvedVariables]).toEqual(['childHost', 'grandchildToken']);
    });
  });

  describe('Jp getters', () => {
    it('record a key that is missing from its scope', () => {
      const unresolvedVariables = new Set();
      const jp = createJp(unresolvedVariables);

      jp.getEnvVar('missingEnv');
      jp.getVar('missingVar');
      jp.getCollectionVar('missingCollection');
      jp.getFolderVar('missingFolder');
      jp.getRequestVar('missingRequest');
      jp.getGlobalEnvVar('missingGlobal');
      jp.getOauth2CredentialVar('missingOauth2');
      jp.getProcessEnv('MISSING');

      expect([...unresolvedVariables]).toEqual([
        'missingEnv',
        'missingVar',
        'missingCollection',
        'missingFolder',
        'missingRequest',
        'missingGlobal',
        'missingOauth2',
        'process.env.MISSING'
      ]);
    });

    it('do not record a present key whose value is falsy', () => {
      const unresolvedVariables = new Set();
      const jp = createJp(unresolvedVariables);

      jp.getEnvVar('falsy');
      jp.getVar('zero');
      jp.getProcessEnv('EMPTY');

      expect(unresolvedVariables.size).toBe(0);
    });

    it('record a missing placeholder inside a value that was read, not the key that was read', () => {
      const unresolvedVariables = new Set();
      const jp = createJp(unresolvedVariables);

      expect(jp.getEnvVar('baseUrl')).toBe('{{host}}/api');
      expect([...unresolvedVariables]).toEqual(['host']);
    });

    it('record a placeholder that jp.interpolate cannot resolve', () => {
      const unresolvedVariables = new Set();
      const jp = createJp(unresolvedVariables);

      expect(jp.interpolate('{{present}}-{{absent}}')).toBe('value-{{absent}}');
      expect([...unresolvedVariables]).toEqual(['absent']);
    });

    it('work without a collector', () => {
      const jp = createJp();

      expect(jp.getVar('missingVar')).toBeUndefined();
      expect(jp.interpolate('{{absent}}')).toBe('{{absent}}');
    });
  });

  describe.each(['nodevm', 'quickjs'])('script runtime on %s', (runtime) => {
    beforeAll(async () => {
      if (runtime === 'quickjs') {
        await quickJsLoader();
      }
    });

    it('records script reads of missing variables into the request collector', async () => {
      const request = { method: 'GET', url: 'http://localhost', headers: {} };
      const unresolvedVariables = trackUnresolvedVariables(request);
      const script = `
        jp.getVar('token');
        jp.getEnvVar('host');
        jp.getEnvVar('present');
      `;

      const onConsoleLog = () => {};
      await new ScriptRuntime({ runtime }).runRequestScript(script, request, { present: 'value' }, {}, '.', onConsoleLog, {});

      expect([...unresolvedVariables]).toEqual(['token', 'host']);
    });

    it('does not expose the unresolved variables to the script on jp or req', async () => {
      const request = { method: 'GET', url: 'http://localhost', headers: {} };
      trackUnresolvedVariables(request);
      const script = `
        jp.setVar('visible', JSON.stringify([
          Object.keys(jp).filter((key) => key.toLowerCase().includes('unresolved')),
          Object.keys(req.req || {}).filter((key) => key.toLowerCase().includes('unresolved'))
        ]));
      `;

      const onConsoleLog = () => {};
      const result = await new ScriptRuntime({ runtime }).runRequestScript(script, request, {}, {}, '.', onConsoleLog, {});

      expect(result.runtimeVariables.visible).toBe('[[],[]]');
    });
  });

  describe('assertions', () => {
    it('record an undefined variable on the right-hand side', () => {
      const request = { method: 'GET', url: 'http://localhost', headers: {} };
      const unresolvedVariables = trackUnresolvedVariables(request);
      const response = { status: 200, statusText: 'OK', data: {}, headers: {} };

      new AssertRuntime({ runtime: 'nodevm' }).runAssertions(
        [{ name: 'res.status', value: 'eq {{expectedStatus}}', enabled: true }],
        request,
        response,
        {},
        {},
        {}
      );

      expect([...unresolvedVariables]).toEqual(['expectedStatus']);
    });
  });
});
