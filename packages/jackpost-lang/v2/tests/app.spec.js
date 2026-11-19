const jpToJson = require('../src/jpToJson');
const jsonToJp = require('../src/jsonToJp');

describe('app block', () => {
  const appJpEnabled = `app {
  enabled: true
  code: '''
    <div>hello</div>
  '''
}
`;

  const appJpDisabled = `app {
  code: '''
    <div>hello</div>
  '''
}
`;

  it('should parse an app block without enabled as disabled', () => {
    const output = jpToJson(appJpDisabled);
    expect(output.app).toEqual({ code: '<div>hello</div>', enabled: false });
  });

  it('should parse enabled: true', () => {
    const output = jpToJson(appJpEnabled);
    expect(output.app).toEqual({ code: '<div>hello</div>', enabled: true });
  });

  it('should stringify enabled only when enabled', () => {
    expect(jsonToJp({ app: { code: '<div>hello</div>', enabled: true } })).toEqual(appJpEnabled);
    expect(jsonToJp({ app: { code: '<div>hello</div>', enabled: false } })).toEqual(appJpDisabled);
  });

  it('should round-trip the enabled flag', () => {
    expect(jpToJson(jsonToJp({ app: { code: '<x/>', enabled: true } })).app.enabled).toBe(true);
    expect(jpToJson(jsonToJp({ app: { code: '<x/>', enabled: false } })).app.enabled).toBe(false);
  });

  it('should serialize an enabled app block even without code', () => {
    const jp = jsonToJp({ app: { code: null, enabled: true } });
    expect(jp).toEqual('app {\n  enabled: true\n}\n');
    expect(jpToJson(jp).app).toEqual({ code: null, enabled: true });
  });

  it('should omit the app block when disabled and without code', () => {
    expect(jsonToJp({ app: { code: null, enabled: false } })).toEqual('');
  });
});
