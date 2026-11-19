const http = require('http');
const { ipcMain } = require('electron');

const servers = new Map(); // port -> { server, ops }

const stripQuotes = (v) => String(v || '').trim().replace(/^"|"$/g, '');

// Local name of the first element inside <Body>
const firstBodyElement = (xml) => {
  const m = /<(?:[\w.-]+:)?Body\b[^>]*>\s*(?:<!--[\s\S]*?-->\s*)*<(?:[\w.-]+:)?([\w.-]+)/i.exec(xml || '');
  return m ? m[1] : null;
};

const fault = (code, message) =>
  '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><soap:Fault>'
  + `<faultcode>${code}</faultcode><faultstring>${message}</faultstring></soap:Fault></soap:Body></soap:Envelope>`;

const findOperation = (ops, soapAction, element) =>
  ops.find((o) => o.soapAction && stripQuotes(o.soapAction) === soapAction && soapAction !== '')
  || ops.find((o) => element && (o.requestElement === element || o.name === element));

const startMock = ({ port, operations }) =>
  new Promise((resolve, reject) => {
    const p = Number(port);
    if (!Number.isInteger(p) || p < 1 || p > 65535) return reject(new Error('Invalid port'));
    if (servers.has(p)) return reject(new Error(`Mock already running on port ${p}`));
    const entry = { ops: Array.isArray(operations) ? operations : [] };
    entry.server = http.createServer((req, res) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        const op = findOperation(entry.ops, stripQuotes(req.headers.soapaction), firstBodyElement(body));
        const out = op ? op.response : fault('soap:Client', 'No mock operation matches this request');
        res.writeHead(op ? 200 : 500, { 'Content-Type': 'text/xml; charset=utf-8' });
        res.end(out);
      });
    });
    entry.server.once('error', reject);
    // loopback only: the mock must not be exposed to the network
    entry.server.listen(p, '127.0.0.1', () => {
      servers.set(p, entry);
      resolve({ port: p, operations: entry.ops.length });
    });
  });

const stopMock = (port) =>
  new Promise((resolve) => {
    const entry = servers.get(Number(port));
    if (!entry) return resolve(false);
    servers.delete(Number(port));
    entry.server.close(() => resolve(true));
  });

const registerWsdlMockIpc = () => {
  ipcMain.handle('renderer:wsdl-mock-start', (e, args) => startMock(args || {}));
  ipcMain.handle('renderer:wsdl-mock-stop', (e, port) => stopMock(port));
  ipcMain.handle('renderer:wsdl-mock-list', () => [...servers.entries()].map(([port, v]) => ({ port, operations: v.ops.length })));
};

module.exports = { registerWsdlMockIpc, startMock, stopMock, findOperation, firstBodyElement };
