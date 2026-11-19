import { mergeXmlValues, flattenRequests } from './index';

describe('wsdl-refresh', () => {
  const fresh = '<e><b><a>string</a><c>0</c><d>new</d></b></e>';

  it('keeps values typed by the user', () => {
    const old = '<e><b><a>hello</a><c>42</c></b></e>';
    const out = mergeXmlValues(old, fresh);
    expect(out).toContain('<a>hello</a>');
    expect(out).toContain('<c>42</c>');
    expect(out).toContain('<d>new</d>');
  });

  it('returns fresh xml when old xml is broken', () => {
    expect(mergeXmlValues('<e><b>', fresh)).toBe(fresh);
  });

  it('returns fresh xml when nothing was customised', () => {
    expect(mergeXmlValues(fresh, fresh)).toBe(fresh);
  });

  it('flattens requests with folder keys', () => {
    const r = flattenRequests([{ type: 'folder', name: 'S', items: [{ type: 'http-request', name: 'op' }] }]);
    expect(r[0].key).toBe('S/op');
    expect(r[0].folderKey).toBe('S');
  });
});
