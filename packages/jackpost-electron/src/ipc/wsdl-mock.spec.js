const http = require('http');
jest.mock('electron', () => ({ ipcMain: { handle: jest.fn() } }));
const { startMock, stopMock, firstBodyElement } = require('./wsdl-mock');

const post = (port, headers, body) =>
  new Promise((resolve) => {
    const r = http.request({ port, host: '127.0.0.1', method: 'POST', headers }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.end(body);
  });

describe('wsdl mock', () => {
  const ops = [{ name: 'Add', soapAction: '"urn:Add"', requestElement: 'Add', response: '<r>add</r>' }];
  it('matches by SOAPAction, by body element, and faults otherwise', async () => {
    const { port } = await startMock({ port: 38917, operations: ops });
    expect((await post(port, { SOAPAction: '"urn:Add"' }, '<x/>')).body).toBe('<r>add</r>');
    expect((await post(port, {}, '<s:Envelope><s:Body><ns:Add/></s:Body></s:Envelope>')).body).toBe('<r>add</r>');
    const miss = await post(port, {}, '<s:Envelope><s:Body><Nope/></s:Body></s:Envelope>');
    expect(miss.status).toBe(500);
    expect(miss.body).toContain('Fault');
    expect(await stopMock(port)).toBe(true);
  });
  it('extracts body element', () => {
    expect(firstBodyElement('<a:Envelope><a:Body><!-- c --><m:Foo x="1"/></a:Body></a:Envelope>')).toBe('Foo');
  });
});
