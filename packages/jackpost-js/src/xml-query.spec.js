const { evalXPath, countXPath, getSoapFault } = require('./xml-query');
const JackpostResponse = require('./jackpost-response');

const ok = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><R xmlns="u"><Id>42</Id></R></s:Body></s:Envelope>';
const fault = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><s:Fault><faultcode>s:Server</faultcode><faultstring>Boom</faultstring></s:Fault></s:Body></s:Envelope>';

describe('xml-query', () => {
  it('evaluates xpath ignoring namespaces via local-name()', () => {
    expect(evalXPath(ok, '//*[local-name()="Id"]')).toBe('42');
    expect(countXPath(ok, '//*')).toBe(4);
  });
  it('uses root-declared prefixes', () => {
    expect(evalXPath(ok, 'count(//s:Body/*)')).toBe(1);
  });
  it('detects SOAP 1.1 fault', () => {
    expect(getSoapFault(fault)).toEqual({ code: 's:Server', message: 'Boom' });
    expect(getSoapFault(ok)).toBeNull();
  });
  it('is safe on broken xml', () => {
    expect(evalXPath('<a><b>', '//b')).toBeUndefined();
    expect(getSoapFault('<a><b>')).toBeNull();
  });
  it('is exposed on JackpostResponse', () => {
    const res = new JackpostResponse({ status: 200, headers: {}, data: fault });
    expect(res.getSoapFault().message).toBe('Boom');
    expect(res.xpath('//faultcode')).toBe('s:Server');
  });
});
